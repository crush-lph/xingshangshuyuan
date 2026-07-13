import { useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, PaymentStatusPoller, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import {
  buyCourse,
  getCourseDetail,
  payOrder,
  queryOrderPaymentStatus,
  type BuyCourseData,
  type GetCourseDetailData
} from '@/services'
import { ensureLoggedIn } from '@/shared/auth-guard'
import { router, routes } from '@/shared/router'
import { getPageParam, priceOf, textOf, textOrPlaceholder } from '@/shared/view-data'
import { getWechatPaymentErrorMessage, requestWechatPayment } from '@/shared/wechat-payment'

export default function CoursePurchasePage() {
  const [course, setCourse] = useState<GetCourseDetailData | null>(null)
  const [order, setOrder] = useState<BuyCourseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pollingOrderNo, setPollingOrderNo] = useState('')
  const paymentLockRef = useRef(false)

  useEffect(() => {
    async function loadCourse() {
      setIsLoading(true)
      setHasError(false)

      const courseId = getPageParam('course_id')

      if (!courseId) {
        setCourse(null)
        return
      }

      const response = await getCourseDetail({ course_id: courseId })
      setCourse(response.data.id ? response.data : null)
    }

    void loadCourse()
      .catch(() => {
        setCourse(null)
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function ensureOrder(forceNew = false) {
    if (!(await ensureLoggedIn('登录后才能购买课程'))) {
      return null
    }

    if (!forceNew && order?.order_no) {
      return order
    }

    if (!course?.id) {
      Taro.showToast({ title: '暂无课程数据', icon: 'none' })
      return null
    }

    Taro.showLoading({ title: '生成订单中' })

    try {
      const response = await buyCourse({ course_id: course.id })
      setOrder(response.data)
      return response.data
    } catch {
      Taro.showToast({ title: '课程订单生成失败，请稍后重试', icon: 'none' })
      return null
    } finally {
      Taro.hideLoading()
    }
  }

  async function handleWechatPayment(forceNew = false) {
    if (paymentLockRef.current) return
    paymentLockRef.current = true
    setIsSubmitting(true)

    try {
      const nextOrder = await ensureOrder(forceNew)

      if (!nextOrder?.order_no) {
        Taro.showToast({ title: '订单生成失败', icon: 'none' })
        return
      }

      Taro.showLoading({ title: '拉起支付中' })
      const payResult = await payOrder({ order_no: nextOrder.order_no, pay_method: 1 })
      await requestWechatPayment(payResult.data.pay_params)

      setPollingOrderNo(nextOrder.order_no)
      Taro.showToast({ title: '正在确认支付结果', icon: 'none' })
    } catch (error) {
      Taro.showToast({ title: getWechatPaymentErrorMessage(error), icon: 'none' })
    } finally {
      paymentLockRef.current = false
      Taro.hideLoading()
      setIsSubmitting(false)
    }
  }

  const displayPrice = priceOf(order?.pay_amount ?? course?.price) ?? '生成订单后确认'
  const originalPrice = priceOf(course?.original_price)
  const isPaymentLocked = isSubmitting || Boolean(pollingOrderNo)

  return (
    <PageShell title="购买课程" subtitle="确认课程信息后生成订单并完成支付。">
      {isLoading ? (
        <StateNotice state="loading" />
      ) : hasError ? (
        <StateNotice state="error" />
      ) : course ? (
        <View className="grid gap-3">
          <View className="overflow-hidden rounded-lg bg-brand-deep shadow-medium">
            <View className="p-4">
              <Text className="block text-xs font-semibold text-gold-light">
                {textOrPlaceholder(course.course_type_text, '课程购买')}
              </Text>
              <Text className="mt-2 block text-xl font-bold leading-8 text-white">
                {textOrPlaceholder(course.title, '未命名课程')}
              </Text>
              <Text className="mt-2 block text-sm leading-6 text-white/72">
                {textOrPlaceholder(course.description, '接口未返回课程简介')}
              </Text>
              {order?.order_no ? (
                <View className="mt-3 rounded bg-white/10 px-3 py-2">
                  <Text className="text-[20rpx] font-semibold text-white/80">最近订单：{order.order_no}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <FieldList
            fields={[
              { label: '课程讲师', value: textOrPlaceholder(course.teacher_name) },
              { label: '课程类型', value: textOrPlaceholder(course.course_type_text) },
              { label: '学习人数', value: course.student_count === undefined ? '未提供' : `${course.student_count}人` },
              { label: '订单状态', value: textOrPlaceholder(order?.status_text, '未生成') }
            ]}
          />

          <SectionCard title="金额确认">
            <View className="grid gap-3 rounded-lg bg-canvas p-3">
              <View className="flex items-center justify-between gap-3">
                <Text className="text-sm font-semibold text-muted">课程金额</Text>
                <Text className="text-right text-sm font-bold text-ink">{priceOf(course.price) ?? '未提供'}</Text>
              </View>
              {originalPrice && originalPrice !== priceOf(course.price) ? (
                <View className="flex items-center justify-between gap-3">
                  <Text className="text-sm font-semibold text-muted">课程原价</Text>
                  <Text className="text-right text-sm text-muted line-through">{originalPrice}</Text>
                </View>
              ) : null}
              <View className="flex items-center justify-between gap-3">
                <Text className="text-sm font-semibold text-muted">应付金额</Text>
                <Text className="text-right text-lg font-bold text-brand">{displayPrice}</Text>
              </View>
            </View>
            <Text className="mt-3 block text-[20rpx] leading-5 text-muted">
              支付完成后可进入课程学习，最终金额以订单接口返回为准。
            </Text>
          </SectionCard>

          {textOf(course.teacher_intro) ? (
            <SectionCard title="讲师介绍">
              <Text className="block text-sm leading-6 text-muted">{textOf(course.teacher_intro)}</Text>
            </SectionCard>
          ) : null}

          <ActionBar
            actions={[
              {
                label: isPaymentLocked ? '支付处理中' : '微信支付购买',
                disabled: isPaymentLocked,
                onClick: handleWechatPayment
              }
            ]}
          />
          {pollingOrderNo ? (
            <PaymentStatusPoller
              orderNo={pollingOrderNo}
              queryStatus={queryOrderPaymentStatus}
              onRetryPayment={(reason) => {
                setPollingOrderNo('')
                if (reason !== 'timeout') setOrder(null)
                void handleWechatPayment(reason !== 'timeout')
              }}
              onBack={() => {
                void router.redirect(routes.userOrders)
              }}
              onSuccess={() => {
                setOrder(null)
                setPollingOrderNo('')
                Taro.showToast({ title: '支付已确认，进入学习', icon: 'success' })
                router.redirect(routes.courseLearn, { course_id: course?.id })
              }}
            />
          ) : null}
        </View>
      ) : (
        <StateNotice state="empty" copy={{ title: '暂无课程', desc: '当前缺少课程编号或接口没有返回课程详情。' }} />
      )}
    </PageShell>
  )
}
