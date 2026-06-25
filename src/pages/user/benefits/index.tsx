import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ActionBar, EmptyState, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getUserProfile, getUserVip } from '@/services'
import { routes } from '@/shared/router'
import { firstRecordList, isRecord, textOf, textOrPlaceholder } from '@/shared/view-data'

export default function UserBenefitsPage() {
  const [levelText, setLevelText] = useState('')
  const [fields, setFields] = useState<Array<{ label: string; value: string }>>([])

  useEffect(() => {
    async function loadBenefits() {
      const [profileResult, vipResult] = await Promise.allSettled([getUserProfile(), getUserVip()])

      if (profileResult.status === 'fulfilled') {
        setLevelText(textOf(profileResult.value.data.vip_level_text) ?? '')
      }

      if (vipResult.status === 'fulfilled') {
        const data = vipResult.value.data

        if (isRecord(data)) {
          const records = firstRecordList(data.perks, data.rights, data.items, data.list)
          setFields(
            records.map((item, index) => ({
              label: textOrPlaceholder(item.label ?? item.name ?? item.title, `权益${index + 1}`),
              value: textOrPlaceholder(item.value ?? item.desc ?? item.description ?? item.status_text)
            }))
          )
        }
      }
    }

    void loadBenefits().catch(() => {
      setLevelText('')
      setFields([])
    })
  }, [])

  return (
    <PageShell title="我的权益" subtitle="查看当前会员等级、权益使用情况和升级入口。">
      <View className="grid gap-3">
        {levelText ? (
          <SectionCard title="当前会员">
            <Text className="block text-lg font-bold text-gold">{levelText}</Text>
          </SectionCard>
        ) : (
          <EmptyState title="暂无会员信息" />
        )}
        {fields.length ? <FieldList fields={fields} /> : <EmptyState title="暂无权益明细" />}
        <ActionBar actions={[{ label: '升级会员', variant: 'gold', path: routes.memberBenefit }]} />
      </View>
    </PageShell>
  )
}
