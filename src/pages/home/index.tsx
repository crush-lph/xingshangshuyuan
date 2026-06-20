import { View, Text } from '@tarojs/components'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { router, routes, type RoutePath } from '@/shared/router'

interface QuickEntry {
  label: string
  icon: string
  path: RoutePath
}

const stats = [
  ['7000+', '合作机构'],
  ['3000+', '付费会员'],
  ['10000+', '业务对接'],
  ['10+', '战略供应商']
]

const quickEntries: QuickEntry[] = [
  { label: '找资源', icon: '资', path: routes.resourceHome },
  { label: '采购标品', icon: '采', path: routes.resourceStandardDetail },
  { label: '报名活动', icon: '活', path: routes.eventHome },
  { label: '发布商机', icon: '商', path: routes.opportunityPublish },
  { label: '加入会员', icon: '会', path: routes.memberBenefit },
  { label: '企业认证', icon: '企', path: routes.userCert }
]

export default function HomePage() {
  return (
    <View className='min-h-screen bg-canvas pb-6 text-ink'>
      <View className='bg-brand px-5 pb-6 pt-5'>
        <View className='flex items-start justify-between gap-3'>
          <View>
            <Text className='block text-xl font-bold text-white'>行商书苑</Text>
            <Text className='mt-1 block text-xs text-white/70'>财税产业生态平台</Text>
          </View>
          <View
            className='rounded-full bg-white/15 px-3 py-1'
            onClick={() => router.to(routes.adminCheckin)}
          >
            <Text className='text-xs font-semibold text-white'>待办</Text>
          </View>
        </View>

        <View className='mt-4 flex items-center gap-3 rounded-lg bg-white/10 px-3 py-3'>
          <View className='flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand'>
            <Text className='font-bold'>陈</Text>
          </View>
          <View className='flex-1'>
            <Text className='block text-sm font-semibold text-white'>陈总 · 鑫财财税</Text>
            <Text className='mt-1 block text-xs text-gold-light'>行商·菁英会员</Text>
          </View>
          <View className='rounded bg-white/15 px-2 py-1' onClick={() => router.to(routes.userCert)}>
            <Text className='text-xs font-semibold text-white'>已认证</Text>
          </View>
        </View>

        <View
          className='mt-4 rounded-full bg-white px-4 py-3'
          onClick={() => router.to(routes.resourceList)}
        >
          <Text className='text-sm text-muted'>搜索资源、活动、商机...</Text>
        </View>
      </View>

      <View className='px-4 py-3'>
        <View
          className='rounded-lg bg-brand-deep p-4 shadow-medium'
          onClick={() => router.to(routes.resourceHome)}
        >
          <Text className='rounded bg-white/10 px-2 py-1 text-xs font-semibold text-gold-light'>
            供应链资源库
          </Text>
          <Text className='mt-3 block text-xl font-bold leading-7 text-white'>
            70+ 优质资源，财税公司专属底价
          </Text>
          <Text className='mt-3 block text-sm font-semibold text-gold-light'>立即采购 →</Text>
        </View>

        <View className='mt-3 grid grid-cols-4 overflow-hidden rounded-lg bg-white shadow-soft'>
          {stats.map(([value, label], index) => (
            <View
              key={label}
              className={`px-1 py-4 text-center ${index === stats.length - 1 ? '' : 'border-r border-line'}`}
            >
              <Text className='block text-base font-bold text-brand'>{value}</Text>
              <Text className='mt-1 block text-xs text-muted'>{label}</Text>
            </View>
          ))}
        </View>

        <View className='mt-3 rounded-lg bg-white p-4 shadow-soft'>
          <View className='grid grid-cols-3 gap-3'>
            {quickEntries.map((entry) => (
              <View
                key={entry.label}
                className='items-center text-center'
                onClick={() => router.to(entry.path)}
              >
                <View className='mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-brand-soft'>
                  <Text className='text-sm font-bold text-brand'>{entry.icon}</Text>
                </View>
                <Text className='mt-2 block text-xs font-semibold text-ink'>{entry.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='mt-3 rounded-lg bg-white p-4 shadow-soft'>
          <View className='mb-3 flex items-center justify-between'>
            <Text className='text-base font-bold text-ink'>热门资源推荐</Text>
            <Text className='text-xs font-medium text-tech' onClick={() => router.to(routes.resourceHome)}>
              查看全部 ›
            </Text>
          </View>
          {[
            {
              title: '财税公司一体化经营系统',
              desc: '战略级供应商 · 平台兜底 · 支持转卖',
              price: '会员 ¥2,980',
              path: routes.resourceStandardDetail
            },
            {
              title: '会计工厂交付外包服务',
              desc: '非标需求 · 支持批量 · 客户经理报价',
              price: '提交需求',
              path: routes.resourceNonstandardDetail
            }
          ].map((item) => (
            <View
              key={item.title}
              className='border-t border-line py-3'
              onClick={() => router.to(item.path)}
            >
              <View className='flex items-center justify-between gap-3'>
                <View className='flex-1'>
                  <Text className='block text-sm font-semibold text-ink'>{item.title}</Text>
                  <Text className='mt-1 block text-xs leading-5 text-muted'>{item.desc}</Text>
                </View>
                <Text className='text-sm font-bold text-gold'>{item.price}</Text>
              </View>
            </View>
          ))}
        </View>

        <View className='mt-3 rounded-lg bg-white p-4 shadow-soft'>
          <View className='mb-3 flex items-center justify-between'>
            <Text className='text-base font-bold text-ink'>近期线下活动</Text>
            <Text className='text-xs font-medium text-tech' onClick={() => router.to(routes.eventHome)}>
              查看全部 ›
            </Text>
          </View>
          <View className='rounded-lg bg-canvas p-3' onClick={() => router.to(routes.eventDetail)}>
            <View className='flex items-center gap-3'>
              <View className='rounded-lg bg-brand px-3 py-2 text-center'>
                <Text className='block text-xs text-white/70'>07月</Text>
                <Text className='block text-lg font-bold text-white'>12</Text>
              </View>
              <View className='flex-1'>
                <Text className='block text-sm font-semibold text-ink'>财税公司老客户升单训练营</Text>
                <Text className='mt-1 block text-xs text-muted'>深圳 · 周六全天 · 支持拼团</Text>
              </View>
              <Button type='primary' size='small' onClick={() => router.to(routes.eventSignup)}>
                报名
              </Button>
            </View>
          </View>
        </View>

        <View className='mt-3 rounded-lg bg-brand-deep p-4 shadow-medium'>
          <Text className='block text-xs text-white/60'>行商会员特权</Text>
          <Text className='mt-1 block text-base font-bold text-white'>加入会员，获取供应链底价</Text>
          <View className='mt-3 grid grid-cols-2 gap-2'>
            {[
              ['行商·菁英会员', '年度优惠 ¥4980'],
              ['行商·领航会员', '年度优惠 ¥12800']
            ].map(([name, price]) => (
              <View
                key={name}
                className='rounded-lg bg-white/10 px-3 py-3'
                onClick={() => router.to(routes.memberBenefit)}
              >
                <Text className='block text-sm font-semibold text-gold-light'>{name}</Text>
                <Text className='mt-1 block text-xs text-white/65'>{price}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='mt-3 rounded-lg bg-white p-4 shadow-soft'>
          <View className='mb-3 flex items-center justify-between'>
            <Text className='text-base font-bold text-ink'>推荐商机</Text>
            <Text className='text-xs font-medium text-tech' onClick={() => router.to(routes.opportunityHome)}>
              查看全部 ›
            </Text>
          </View>
          <View className='rounded-lg border border-line p-3' onClick={() => router.to(routes.opportunityDetail)}>
            <View className='flex items-start justify-between gap-3'>
              <Text className='flex-1 text-sm font-semibold leading-5 text-ink'>
                深圳宝安区工商注册+代账需求，约50家
              </Text>
              <Text className='rounded bg-gold-soft px-2 py-1 text-xs font-semibold text-gold'>高价值</Text>
            </View>
            <Text className='mt-2 block text-xs text-muted'>代账 · 深圳 · 平台撮合</Text>
            <View className='mt-3 flex items-center justify-between'>
              <Text className='text-sm font-bold text-brand'>预算 ¥15万+</Text>
              <Text className='text-xs text-muted'>2小时前</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
