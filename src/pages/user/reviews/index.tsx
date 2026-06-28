import { useEffect, useMemo, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import Rate from '@nutui/nutui-react-taro/dist/es/packages/rate'
import '@nutui/nutui-react-taro/dist/es/packages/rate/style/css'
import { ActionBar, FormSection, FormTextareaField, ReviewList, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getUserReviews, submitReview, type UserReviewItem } from '@/services'
import { router, routes } from '@/shared/router'
import { getPageParam, numberOf, textOf, textOrPlaceholder } from '@/shared/view-data'

export default function UserReviewsPage() {
  const orderId = numberOf(getPageParam('order_id'))
  const orderTitle = textOf(getPageParam('title'))
  const [items, setItems] = useState<UserReviewItem[]>([])
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const pageTitle = useMemo(() => (orderId ? '提交评价' : '我的评价'), [orderId])
  const reviewItems = items.map((item) => ({
    key: String(item.id ?? `${item.order_id}-${item.created_at}`),
    title: textOrPlaceholder(item.product_name ?? item.order_id, '未命名服务'),
    content: textOrPlaceholder(item.content, '暂无评价内容'),
    rating: item.rating,
    thumbnail: item.thumbnail,
    statusText: item.status === 0 ? '隐藏' : '已评价',
    statusTone: item.status === 0 ? ('neutral' as const) : ('success' as const),
    meta: item.order_id ? `订单 ${item.order_id}` : textOrPlaceholder(item.created_at),
    time: textOf(item.created_at)
  }))

  async function loadReviews() {
    setIsLoading(true)
    setHasError(false)
    try {
      const response = await getUserReviews({ page: 1, page_size: 20 })
      setItems(response.data.list ?? [])
    } catch {
      setHasError(true)
      throw new Error('load reviews failed')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    setIsLoading(true)
    setHasError(false)

    void getUserReviews({ page: 1, page_size: 20 })
      .then((response) => {
        if (isMounted) {
          setItems(response.data.list ?? [])
        }
      })
      .catch(() => {
        if (isMounted) {
          setItems([])
          setHasError(true)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit() {
    if (!orderId) {
      Taro.showToast({ title: '缺少订单信息', icon: 'none' })
      return
    }

    const nextContent = textOf(content)

    if (!nextContent) {
      Taro.showToast({ title: '请填写评价内容', icon: 'none' })
      return
    }

    setIsSubmitting(true)
    Taro.showLoading({ title: '提交中' })

    try {
      await submitReview({
        order_id: orderId,
        rating,
        content: nextContent
      })
      Taro.showToast({ title: '评价已提交', icon: 'success' })
      setContent('')
      setRating(5)
      await loadReviews()
      router.redirect(routes.userReviews)
    } catch {
      Taro.showToast({ title: '评价提交失败，请稍后重试', icon: 'none' })
    } finally {
      Taro.hideLoading()
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell title={pageTitle} subtitle={orderId ? '对已完成的服务订单进行评价。' : '查看已提交的资源和服务评价。'}>
      <View className="grid gap-3">
        {orderId ? (
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
                { label: '返回列表', variant: 'outline', path: routes.userReviews },
                { label: isSubmitting ? '提交中' : '提交评价', disabled: isSubmitting, onClick: handleSubmit }
              ]}
            />
          </FormSection>
        ) : null}

        {!orderId ? (
          <StateNotice
            state="empty"
            copy={{
              title: '待评价来源以订单为准',
              desc: '当前不展示静态待评价数量；可评价入口仅来自真实已完成订单。'
            }}
          />
        ) : null}

        {isLoading ? (
          <StateNotice state="loading" />
        ) : hasError ? (
          <StateNotice state="error" />
        ) : reviewItems.length ? (
          <ReviewList items={reviewItems} />
        ) : (
          <StateNotice
            state="empty"
            copy={{
              title: orderId ? '暂无历史评价' : '暂无评价',
              desc: orderId ? '当前接口没有返回该订单的历史评价。' : '当前接口没有返回评价记录。'
            }}
          />
        )}
      </View>
    </PageShell>
  )
}
