import { useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import Rate from '@nutui/nutui-react-taro/dist/es/packages/rate'
import '@nutui/nutui-react-taro/dist/es/packages/rate/style/css'
import { ActionBar, FormSection, FormTextareaField, ListLoadMore, ReviewList, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getUserReviews, submitReview, type UserReviewItem } from '@/services'
import { routes } from '@/shared/router'
import { usePaginatedList } from '@/shared/use-paginated-list'
import { getPageParam, numberOf, textOf, textOrPlaceholder } from '@/shared/view-data'

const ORDER_REVIEW_PAGE_SIZE = 50
const MAX_REVIEW_PAGES = 100

function mapReview(item: UserReviewItem, fallbackTitle?: string) {
  return {
    key: String(item.id ?? `${item.order_id}-${item.created_at}`),
    title: textOrPlaceholder(item.product_name ?? fallbackTitle ?? item.order_id, '未命名服务'),
    content: textOrPlaceholder(item.content, '暂无评价内容'),
    rating: item.rating,
    thumbnail: item.thumbnail,
    statusText: item.status === 0 ? '隐藏' : '已评价',
    statusTone: item.status === 0 ? ('neutral' as const) : ('success' as const),
    meta: item.order_id ? `订单 ${item.order_id}` : textOrPlaceholder(item.created_at),
    time: textOf(item.created_at)
  }
}

async function findOrderReview(orderId: number) {
  let page = 1
  let previousPageSignature = ''

  while (page <= MAX_REVIEW_PAGES) {
    const response = await getUserReviews({ page, page_size: ORDER_REVIEW_PAGE_SIZE })
    const records = response.data.list ?? []
    const matchedReview = records.find((item) => item.order_id === orderId)

    if (matchedReview) {
      return matchedReview
    }

    const totalPage = numberOf(response.data.total_page)
    const pageSignature = records.map((item) => item.id ?? `${item.order_id}-${item.created_at}`).join(',')

    const reachedLastPage = totalPage !== undefined ? page >= totalPage : records.length < ORDER_REVIEW_PAGE_SIZE

    if (reachedLastPage || pageSignature === previousPageSignature) {
      return null
    }

    previousPageSignature = pageSignature
    page += 1
  }

  throw new Error('评价记录过多，暂时无法确认订单评价状态')
}

function ReviewHistory() {
  const { hasError, hasMore, isLoading, isLoadingMore, items } = usePaginatedList<UserReviewItem, UserReviewItem>({
    deps: [],
    fetchPage: ({ page, page_size }) => getUserReviews({ page, page_size }),
    mapItems: (records: UserReviewItem[]) => records
  })
  const reviewItems = items.map((item) => mapReview(item))

  if (isLoading) {
    return <StateNotice state="loading" />
  }

  if (hasError) {
    return <StateNotice state="error" />
  }

  if (!reviewItems.length) {
    return <StateNotice state="empty" copy={{ title: '暂无评价', desc: '订单支付后可在订单列表提交评价。' }} />
  }

  return (
    <>
      <ReviewList items={reviewItems} />
      <ListLoadMore hasItems hasMore={hasMore} isLoadingMore={isLoadingMore} />
    </>
  )
}

function OrderReviewFlow({ orderId, orderNo, orderTitle }: { orderId: number; orderNo?: string; orderTitle?: string }) {
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [existingReview, setExistingReview] = useState<UserReviewItem | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [hasCheckError, setHasCheckError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reloadVersion, setReloadVersion] = useState(0)
  const submissionLockRef = useRef(false)

  useEffect(() => {
    let isActive = true

    void findOrderReview(orderId)
      .then((review) => {
        if (isActive) setExistingReview(review)
      })
      .catch(() => {
        if (isActive) {
          setExistingReview(null)
          setHasCheckError(true)
        }
      })
      .finally(() => {
        if (isActive) setIsChecking(false)
      })

    return () => {
      isActive = false
    }
  }, [orderId, reloadVersion])

  function retryCheck() {
    setIsChecking(true)
    setHasCheckError(false)
    setReloadVersion((value) => value + 1)
  }

  async function handleSubmit() {
    if (submissionLockRef.current || isChecking || existingReview) {
      return
    }

    const nextContent = textOf(content)

    if (!nextContent) {
      Taro.showToast({ title: '请填写评价内容', icon: 'none' })
      return
    }

    if (rating < 1 || rating > 5) {
      Taro.showToast({ title: '请选择1至5星评分', icon: 'none' })
      return
    }

    submissionLockRef.current = true
    setIsSubmitting(true)
    Taro.showLoading({ title: '提交中' })

    try {
      const response = await submitReview({ order_id: orderId, rating, content: nextContent })
      setExistingReview({
        ...response.data,
        order_id: orderId,
        product_name: orderTitle,
        status: 1
      })
      setContent('')
      Taro.showToast({ title: '评价已提交', icon: 'success' })
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : '评价提交失败，请稍后重试'
      Taro.showToast({ title: message, icon: 'none' })
      retryCheck()
    } finally {
      submissionLockRef.current = false
      Taro.hideLoading()
      setIsSubmitting(false)
    }
  }

  const backAction = orderNo
    ? { label: '返回订单', variant: 'outline' as const, path: routes.paymentTransfer, query: { order_no: orderNo } }
    : { label: '返回订单', variant: 'outline' as const, path: routes.userOrders }

  if (isChecking) {
    return <StateNotice state="loading" copy={{ title: '正在确认评价状态', desc: '请稍候。' }} />
  }

  if (hasCheckError) {
    return (
      <View className="grid gap-3">
        <StateNotice
          state="error"
          copy={{ title: '评价状态确认失败', desc: '为避免重复评价，请先重新查询评价状态。' }}
        />
        <ActionBar actions={[backAction, { label: '重新查询', onClick: retryCheck }]} />
      </View>
    )
  }

  if (existingReview) {
    return (
      <View className="grid gap-3">
        <StateNotice state="completed" copy={{ title: '该订单已评价', desc: '感谢你的反馈，评价内容如下。' }} />
        <ReviewList items={[mapReview(existingReview, orderTitle)]} />
        <ActionBar actions={[backAction, { label: '查看我的评价', path: routes.userReviews }]} />
      </View>
    )
  }

  return (
    <FormSection title="评价服务" desc={orderTitle ? `订单服务：${orderTitle}` : `订单编号：${orderId}`}>
      <View>
        <Text className="mb-2 block text-sm font-semibold text-ink">
          服务评分<Text className="text-[#E53E3E]"> *</Text>
        </Text>
        <View className="rounded-lg border border-line bg-canvas px-3 py-3">
          <Rate value={rating} count={5} onChange={(value) => setRating(Number(value) || 5)} />
        </View>
      </View>
      <FormTextareaField
        label="评价内容"
        required
        value={content}
        placeholder="请填写本次服务体验"
        onChange={setContent}
      />
      <ActionBar
        actions={[
          backAction,
          { label: isSubmitting ? '提交中' : '提交评价', disabled: isSubmitting, onClick: handleSubmit }
        ]}
      />
    </FormSection>
  )
}

export default function UserReviewsPage() {
  const orderId = numberOf(getPageParam('order_id'))
  const orderNo = textOf(getPageParam('order_no'))
  const orderTitle = textOf(getPageParam('title'))

  return (
    <PageShell
      title={orderId ? '订单评价' : '我的评价'}
      subtitle={orderId ? '分享本次服务体验。' : '查看已提交的资源和服务评价。'}
    >
      <View className="grid gap-3">
        {orderId ? <OrderReviewFlow orderId={orderId} orderNo={orderNo} orderTitle={orderTitle} /> : <ReviewHistory />}
      </View>
    </PageShell>
  )
}
