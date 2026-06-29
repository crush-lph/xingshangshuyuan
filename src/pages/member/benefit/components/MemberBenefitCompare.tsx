import { Text, View } from '@tarojs/components'
import type { VipLevelItem } from '@/services'
import { textOrPlaceholder } from '@/shared/view-data'
import { compareRows, getLevelTitle } from '../member-benefit.helpers'

interface MemberBenefitCompareProps {
  levels: VipLevelItem[]
}

export function MemberBenefitCompare({ levels }: MemberBenefitCompareProps) {
  const eliteName = textOrPlaceholder(getLevelTitle(levels[0]), '菁英会员')
  const navigatorName = textOrPlaceholder(getLevelTitle(levels[1]), '领航会员')

  return (
    <View id="member-benefit-compare">
      <View className="mb-3 flex items-center justify-between">
        <Text className="text-lg font-bold text-white">权益对比</Text>
        <Text className="text-xs text-white/50">一眼看清差异</Text>
      </View>
      <View className="overflow-hidden rounded-[24px] border border-white/10 bg-white/10">
        <View className="grid grid-cols-3 bg-white/10">
          <Text className="px-2 py-3 text-xs font-bold text-white">权益项</Text>
          <Text className="px-2 py-3 text-center text-xs font-bold text-[#F7D789]">{eliteName}</Text>
          <Text className="px-2 py-3 text-center text-xs font-bold text-[#AEBBFF]">{navigatorName}</Text>
        </View>
        {compareRows.map((item, index) => (
          <View
            key={item.label}
            className={`grid grid-cols-3 bg-[#111D33] ${index === compareRows.length - 1 ? '' : 'border-b border-white/10'}`}
          >
            <Text className="px-2 py-3 text-xs font-bold text-white">{item.label}</Text>
            <Text className="px-2 py-3 text-center text-xs text-white/70">{item.elite}</Text>
            <Text className="px-2 py-3 text-center text-xs font-bold text-[#AEBBFF]">{item.navigator}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
