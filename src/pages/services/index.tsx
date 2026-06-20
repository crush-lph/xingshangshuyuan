import { View, Text } from '@tarojs/components'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import '@nutui/nutui-react-taro/dist/es/packages/button/style/css'
import { ItemList, SectionCard } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { router, routes, type RoutePath } from '@/shared/router'

interface Category {
  name: string
  desc: string
  path: RoutePath
}

const categories: Category[] = [
  { name: '智能工具', desc: '发票、申报、对账', path: routes.resourceList },
  { name: '培训课程', desc: '经营增长、考证辅导', path: routes.eventHome },
  { name: '增值咨询', desc: '股权、税筹、合规', path: routes.resourceSubmit },
  { name: '资质认证', desc: '专精特新、ISO', path: routes.resourceList }
]

export default function ServicesPage() {
  return (
    <PageShell title="服务商城" subtitle="工具、培训、咨询和资质服务统一入口。">
      <View className="grid gap-3">
        <SectionCard>
          <View className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <View
                key={category.name}
                className="rounded-lg bg-brand-soft px-4 py-4"
                onClick={() => router.to(category.path)}
              >
                <View className="mb-3 h-1 w-8 rounded-full bg-gold" />
                <Text className="block text-base font-bold text-brand">{category.name}</Text>
                <Text className="mt-1 block text-xs leading-5 text-muted">{category.desc}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        <ItemList
          items={[
            {
              title: 'AI 智能发票管理',
              desc: '票据采集、识别、查重与归档。',
              price: '¥2,980/年',
              tag: '智能工具',
              action: '试用',
              path: routes.resourceStandardDetail
            },
            {
              title: '财税公司老客户升单训练营',
              desc: '线下实战课，会员享报名优惠。',
              price: '会员 ¥598',
              tag: '培训课程',
              action: '报名',
              path: routes.eventDetail
            },
            {
              title: '股权架构与税筹咨询',
              desc: '专家诊断、方案设计、合规落地。',
              price: '面议',
              tag: '增值咨询',
              action: '咨询',
              path: routes.resourceSubmit
            },
            {
              title: 'ISO9001 质量管理体系认证',
              desc: '材料代办、审核辅导、进度跟踪。',
              price: '¥4,800 起',
              tag: '资质认证',
              action: '办理',
              path: routes.resourcePurchase
            }
          ]}
        />

        <View className="rounded-lg bg-brand-deep p-4 shadow-medium">
          <View className="flex items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="block text-base font-bold text-white">不知道选哪个？</Text>
              <Text className="mt-2 block text-sm leading-5 text-white/65">
                提交需求，客户经理帮你匹配工具、供应商或课程方案。
              </Text>
            </View>
            <Button type="primary" size="small" onClick={() => router.to(routes.resourceSubmit)}>
              提需求
            </Button>
          </View>
        </View>
      </View>
    </PageShell>
  )
}
