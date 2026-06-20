import { Text, View } from '@tarojs/components'
import { FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'

export default function AdminCheckinPage() {
  return (
    <PageShell title="活动核销" subtitle="现场工作人员核验电子票并完成签到。">
      <View className="grid gap-3">
        <SectionCard title="核销入口">
          <Text className="block rounded-lg border border-dashed border-line bg-canvas px-4 py-8 text-center text-sm text-muted">
            扫描电子票二维码或输入票号
          </Text>
        </SectionCard>
        <FieldList
          fields={[
            { label: '票号', value: 'XS-2026-0618' },
            { label: '参会人', value: '陈总' },
            { label: '活动', value: '数字化转型峰会' },
            { label: '状态', value: '待核销' }
          ]}
        />
      </View>
    </PageShell>
  )
}
