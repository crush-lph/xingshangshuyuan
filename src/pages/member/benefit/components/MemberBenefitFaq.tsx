import { Text, View } from '@tarojs/components'

interface MemberBenefitFaqProps {
  aboutText: string
}

export function MemberBenefitFaq({ aboutText }: MemberBenefitFaqProps) {
  return (
    <View>
      <View className="mb-3 flex items-center justify-between">
        <Text className="text-lg font-bold text-white">开通说明</Text>
        <Text className="text-xs text-white/50">规则透明</Text>
      </View>
      <View className="grid gap-3">
        <View className="rounded-[20px] border border-white/10 bg-white/10 px-4 py-3">
          <Text className="block text-sm font-bold text-white">有效期多久？</Text>
          <Text className="mt-1 block text-sm leading-6 text-white/60">开通之日起 1 年有效，到期可续费。</Text>
        </View>
        <View className="rounded-[20px] border border-white/10 bg-white/10 px-4 py-3">
          <Text className="block text-sm font-bold text-white">支持对公转账吗？</Text>
          <Text className="mt-1 block text-sm leading-6 text-white/60">支持微信支付和对公转账，财务确认后开通。</Text>
        </View>
        <View className="rounded-[20px] border border-white/10 bg-white/10 px-4 py-3">
          <Text className="block text-sm font-bold text-white">是否可以升级？</Text>
          <Text className="mt-1 block text-sm leading-6 text-white/60">
            {aboutText || '支持从菁英升级到领航，最终规则以平台配置为准。'}
          </Text>
        </View>
      </View>
    </View>
  )
}
