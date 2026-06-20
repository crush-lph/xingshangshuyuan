import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function EventTicketPage() {
  return (
    <PageShell title="我的电子票" subtitle="报名成功，请凭电子票现场核销。">
      <View className="grid gap-3">
        <SectionCard>
          <View className="items-center py-4 text-center">
            <Text className="block text-3xl font-bold text-brand">XS-2026-0618</Text>
            <Text className="mt-2 block text-sm text-muted">现场出示编号或二维码完成核销</Text>
          </View>
        </SectionCard>
        <FieldList
          fields={[
            { label: '活动', value: '数字化转型峰会' },
            { label: '参会人', value: '陈总' },
            { label: '票种', value: '普通票' },
            { label: '状态', value: '待核销' }
          ]}
        />
        <ActionBar actions={[{ label: '查看我的活动', path: routes.userEvents }]} />
      </View>
    </PageShell>
  )
}
