import { Text, View } from '@tarojs/components'
import { AppIcon } from '@/components/AppIcon'

const heroStats = [
  { value: '40%', label: '采购均值节省' },
  { value: '1年', label: '权益有效期' },
  { value: '6项', label: '核心权益' }
]

export function MemberBenefitHero() {
  return (
    <View className="px-4 pt-4">
      <View className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#223B76] px-5 py-5">
        <View className="absolute -right-12 -top-14 h-36 w-36 rounded-full border border-gold/40 bg-gold/5" />
        <View className="relative">
          <View className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5">
            <AppIcon name="star-line" size={14} color="#F7D789" />
            <Text className="font-bold text-[#F7D789]" style={{ fontSize: '24rpx', lineHeight: '32rpx' }}>
              行商书苑会员体系
            </Text>
          </View>
        </View>
        <Text className="relative mt-4 block text-[30px] font-bold leading-tight text-white">资源、商机与圈层权益</Text>
        <Text className="relative mt-3 block text-sm leading-6 text-white/70">
          加入行商会员，获得供应链底价、线下课程、峰会席位、商机优先和平台授牌资格。
        </Text>
        <View className="relative mt-5 grid grid-cols-3 gap-2">
          {heroStats.map((item) => (
            <View key={item.label} className="rounded-[18px] bg-[#0B1838]/72 px-2 py-3.5 text-center">
              <Text className="block text-lg font-bold leading-none text-[#F7D789]">{item.value}</Text>
              <Text
                className="mt-1.5 block font-semibold text-white/78"
                style={{ fontSize: '22rpx', lineHeight: '30rpx' }}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
