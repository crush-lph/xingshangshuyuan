import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { ActionBar, EmptyState, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getAbout, getUserProfile, getVipLevelPerks } from '@/services'
import { routes } from '@/shared/router'
import { firstRecordList, isRecord, textOf, textOrPlaceholder } from '@/shared/view-data'

export default function MemberBenefitPage() {
  const [levelText, setLevelText] = useState('')
  const [fields, setFields] = useState<Array<{ label: string; value: string }>>([])
  const [aboutText, setAboutText] = useState('')

  useEffect(() => {
    async function loadMemberData() {
      const [profileResult, perksResult, aboutResult] = await Promise.allSettled([
        getUserProfile(),
        getVipLevelPerks(),
        getAbout()
      ])

      if (profileResult.status === 'fulfilled') {
        setLevelText(textOf(profileResult.value.data.vip_level_text) ?? '')
      }

      if (perksResult.status === 'fulfilled') {
        const data = perksResult.value.data

        if (isRecord(data)) {
          const records = firstRecordList(data.list, data.perks, data.levels, data.items)
          setFields(
            records.map((item, index) => ({
              label: textOrPlaceholder(item.label ?? item.name ?? item.title, `权益${index + 1}`),
              value: textOrPlaceholder(item.value ?? item.desc ?? item.description ?? item.status_text)
            }))
          )
        }
      }

      if (aboutResult.status === 'fulfilled' && isRecord(aboutResult.value.data)) {
        setAboutText(
          textOf(
            aboutResult.value.data.description ?? aboutResult.value.data.content ?? aboutResult.value.data.about
          ) ?? ''
        )
      }
    }

    void loadMemberData().catch(() => {
      setLevelText('')
      setFields([])
    })
  }, [])

  return (
    <PageShell title="会员权益" subtitle="供应链底价、商机优先、线下课和客户经理支持。">
      <View className="grid gap-3">
        {levelText ? (
          <View className="rounded-lg bg-brand-deep p-4 shadow-medium">
            <Text className="block text-xs font-semibold text-gold-light">当前方案</Text>
            <Text className="mt-1 block text-2xl font-bold text-white">{levelText}</Text>
          </View>
        ) : (
          <EmptyState title="暂无会员方案" desc="Apifox mock 未返回会员等级数据。" />
        )}

        {fields.length ? (
          <FieldList fields={fields} />
        ) : (
          <EmptyState title="暂无权益配置" desc="Apifox mock 未返回会员等级权益配置。" />
        )}

        <SectionCard title="开通说明">
          <Text className="block text-sm leading-6 text-muted">
            {aboutText || '会员权益、价格和有效期以接口返回配置为准。'}
          </Text>
        </SectionCard>

        <ActionBar
          actions={[
            { label: '咨询客户经理', variant: 'outline', path: routes.profile },
            { label: '立即开通', variant: 'gold', path: routes.memberConfirm }
          ]}
        />
      </View>
    </PageShell>
  )
}
