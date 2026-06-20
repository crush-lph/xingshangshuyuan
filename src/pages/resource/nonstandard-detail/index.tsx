import { Text, View } from '@tarojs/components'
import { ActionBar, FieldList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function ResourceNonstandardDetailPage() {
  return (
    <PageShell title='跨区域工商注册需求' subtitle='非标资源由客户经理协同供应商报价和交付。'>
      <View className='grid gap-3'>
        <SectionCard title='需求说明'>
          <Text className='text-sm leading-6 text-muted'>
            适用于跨城市工商注册、批量变更、疑难资质和项目型服务。提交需求后平台进行供应商匹配。
          </Text>
        </SectionCard>
        <FieldList
          fields={[
            { label: '响应时效', value: '1小时内' },
            { label: '报价方式', value: '多供应商比价' },
            { label: '服务保障', value: '过程留痕' },
            { label: '会员权益', value: '优先匹配' }
          ]}
        />
        <ActionBar
          actions={[
            { label: '开通会员优先匹配', variant: 'gold', path: routes.memberBenefit },
            { label: '提交需求', path: routes.resourceSubmit }
          ]}
        />
      </View>
    </PageShell>
  )
}
