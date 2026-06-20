import { Text, View } from '@tarojs/components'
import { ItemList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

const filters = ['全部', '软件工具', '会计工厂', '资质许可', '财税咨询', '会员专享']

export default function ResourceListPage() {
  return (
    <PageShell title='资源列表' subtitle='按业务场景筛选供应商、工具和标准化服务。'>
      <View className='grid gap-3'>
        <View className='rounded-full bg-white px-4 py-3 shadow-soft'>
          <Text className='text-sm text-muted'>搜索资源名称、服务商、适用场景</Text>
        </View>

        <SectionCard>
          <View className='flex flex-wrap gap-2'>
            {filters.map((item, index) => (
              <View key={item} className={`rounded-full px-3 py-2 ${index === 0 ? 'bg-brand' : 'border border-line bg-white'}`}>
                <Text className={`text-xs font-semibold ${index === 0 ? 'text-white' : 'text-muted'}`}>{item}</Text>
              </View>
            ))}
          </View>
          <View className='mt-3 flex items-center justify-between border-t border-line pt-3'>
            <Text className='text-xs text-muted'>综合排序</Text>
            <Text className='text-xs text-muted'>销量优先 · 价格区间 · 供应商等级</Text>
          </View>
        </SectionCard>

        <ItemList
          items={[
            {
              title: '财税公司一体化经营系统',
              desc: '客户、账套、申报、工单、收款与交付进度统一管理。',
              price: '¥2,980',
              tag: '战略级',
              meta: '会员省 ¥1,000 · 7天交付 · 可开票',
              path: routes.resourceStandardDetail,
              action: '查看'
            },
            {
              title: '会计工厂交付外包服务',
              desc: '旺季账务交付补位，支持批量账套、老账整理和月度交付。',
              price: '面议',
              tag: '非标',
              meta: '客户经理 1 小时内响应',
              path: routes.resourceNonstandardDetail,
              action: '提需求'
            },
            {
              title: '代理记账许可证代办',
              desc: '材料预审、人员资质梳理、现场辅导与进度跟踪。',
              price: '¥4,800',
              tag: '认证级',
              meta: '平台监管 · 标准流程 · 售后保障',
              path: routes.resourceStandardDetail,
              action: '采购'
            },
            {
              title: '专精特新申报辅导',
              desc: '政策匹配、材料梳理、专家预审，适合科创客户增值服务。',
              price: '¥12,800 起',
              meta: '会员优先排期',
              path: routes.resourceNonstandardDetail,
              action: '咨询'
            }
          ]}
        />
      </View>
    </PageShell>
  )
}
