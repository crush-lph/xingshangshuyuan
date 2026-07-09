import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ActionBar, SectionCard, StateNotice } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getUserProfile, getUserVip } from '@/services'
import { routes } from '@/shared/router'
import { isRecord, textOf, textOrPlaceholder } from '@/shared/view-data'

function normalizeBenefits(...values: unknown[]) {
  for (const value of values) {
    const list = isRecord(value) && Array.isArray(value.list) ? value.list : value

    if (!Array.isArray(list) || !list.length) {
      continue
    }

    const benefits = list
      .map((item) => {
        if (isRecord(item)) {
          return textOf(
            item.value ??
              item.desc ??
              item.description ??
              item.status_text ??
              item.perk_desc ??
              item.label ??
              item.name ??
              item.title ??
              item.perk_name
          )
        }

        return textOf(item)
      })
      .filter((item): item is string => Boolean(item))

    if (benefits.length) {
      return benefits
    }
  }

  return []
}

function BenefitList({ items }: { items: string[] }) {
  return (
    <View className="overflow-hidden rounded-lg bg-white shadow-soft">
      {items.map((item, index) => (
        <View
          key={`${item}-${index}`}
          className={`flex items-start gap-3 px-4 py-[14px] ${index === items.length - 1 ? '' : 'border-b border-line'}`}
        >
          <View className="mt-[6px] h-2 w-2 shrink-0 rounded-full bg-gold" />
          <Text className="flex-1 text-sm font-semibold leading-6 text-ink">{item}</Text>
        </View>
      ))}
    </View>
  )
}

export default function UserBenefitsPage() {
  const [levelText, setLevelText] = useState('')
  const [benefits, setBenefits] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadBenefits() {
      setIsLoading(true)
      setHasError(false)

      const [profileResult, vipResult] = await Promise.allSettled([getUserProfile(), getUserVip()])

      if (profileResult.status === 'fulfilled') {
        setLevelText(textOf(profileResult.value.data.vip_level_text) ?? '')
      }

      if (vipResult.status === 'fulfilled') {
        const data = vipResult.value.data

        if (isRecord(data)) {
          setBenefits(normalizeBenefits(data.perks, data.rights, data.items, data.list))
        }
      }

      setHasError(profileResult.status === 'rejected' && vipResult.status === 'rejected')
    }

    void loadBenefits()
      .catch(() => {
        setLevelText('')
        setBenefits([])
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <PageShell title="我的权益" subtitle="查看当前会员等级、权益使用情况和升级入口。">
      <View className="grid gap-3">
        {isLoading ? <StateNotice state="loading" /> : hasError ? <StateNotice state="error" /> : null}
        {!isLoading && !hasError && levelText ? (
          <SectionCard title="当前会员">
            <Text className="block text-lg font-bold text-gold">{levelText}</Text>
          </SectionCard>
        ) : (
          !isLoading &&
          !hasError && (
            <StateNotice state="empty" copy={{ title: '暂无会员信息', desc: '当前接口没有返回会员等级。' }} />
          )
        )}
        {!isLoading && !hasError && benefits.length ? (
          <BenefitList items={benefits} />
        ) : (
          !isLoading &&
          !hasError && (
            <StateNotice
              state="empty"
              copy={{
                title: '暂无权益明细',
                desc: '当前接口没有返回权益配置；权益使用状态、剩余额度仍需接口补齐。'
              }}
            />
          )
        )}
        <ActionBar actions={[{ label: '升级领航会员', variant: 'gold', path: routes.memberBenefit }]} />
      </View>
    </PageShell>
  )
}
