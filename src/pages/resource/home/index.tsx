import { Text, View } from '@tarojs/components'
import { ActionBar, ItemList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { router, routes } from '@/shared/router'

export default function ResourceHomePage() {
  return (
    <PageShell title='资源库' subtitle='软件工具、会计工厂、资质许可与财税服务资源统一采购。'>
      <View className='grid gap-3'>
        <View className='rounded-lg bg-gold-soft px-4 py-3'>
          <Text className='text-sm font-semibold text-gold'>
            新上架：企税宝工商年报代办服务，菁英会员 6 折
          </Text>
        </View>
        <View className='rounded-full bg-white px-4 py-3 shadow-soft' onClick={() => router.to(routes.resourceList)}>
          <Text className='text-sm text-muted'>搜索项目、供应商、服务类型...</Text>
        </View>
        <SectionCard title='资源分类'>
          <View className='flex flex-wrap gap-2'>
            {['热门项目', '软件工具', '会计工厂', '资质许可', '知产科创', '财税咨询', '获客增长', '会员专享'].map((item, index) => (
              <View
                key={item}
                className={`rounded-full px-3 py-2 ${index === 0 ? 'bg-brand' : 'bg-brand-soft'}`}
                onClick={() => router.to(index === 7 ? routes.memberBenefit : routes.resourceList)}
              >
                <Text className={`text-xs font-semibold ${index === 0 ? 'text-white' : 'text-brand'}`}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </SectionCard>
        <SectionCard title='战略供应商推荐'>
          <ItemList
            items={[
              {
                title: '财税公司一体化经营系统',
                desc: '战略级供应商 · 平台兜底 · 支持转卖',
                price: '¥2,980',
                tag: '标品',
                action: '立即采购',
                path: routes.resourceStandardDetail
              },
              {
                title: '会计工厂交付外包服务',
                desc: '战略级供应商 · 非标 · 支持批量',
                price: '面议',
                tag: '非标',
                action: '提交需求',
                path: routes.resourceNonstandardDetail
              },
              {
                title: '代理记账许可证代办',
                desc: '认证级供应商 · 平台监管 · 标准流程',
                price: '¥4,800',
                tag: '认证级',
                action: '查看',
                path: routes.resourceList
              }
            ]}
          />
        </SectionCard>
        <View className='rounded-lg bg-brand-deep p-4 shadow-medium'>
          <Text className='block text-base font-bold text-gold-light'>开通会员享底价</Text>
          <Text className='mt-2 block text-sm leading-5 text-white/65'>
            70+ 资源专属会员价，平均节省 40%。
          </Text>
          <View className='mt-3'>
            <ActionBar actions={[{ label: '立即开通', variant: 'gold', path: routes.memberBenefit }]} />
          </View>
        </View>
        <View className='rounded-lg bg-white p-4 shadow-soft'>
          <View className='flex items-center justify-between gap-4'>
            <View className='flex-1'>
              <Text className='block text-base font-bold text-ink'>不知道选哪个？</Text>
              <Text className='mt-2 block text-sm leading-5 text-muted'>
                提交需求，客户经理帮你匹配最优供应商和报价方案。
              </Text>
            </View>
            <View className='rounded-lg bg-brand px-3 py-2' onClick={() => router.to(routes.resourceSubmit)}>
              <Text className='text-xs font-semibold text-white'>提交需求</Text>
            </View>
          </View>
        </View>
      </View>
    </PageShell>
  )
}
