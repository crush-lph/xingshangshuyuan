import type { CSSProperties } from 'react'
import { Image, Text, View } from '@tarojs/components'
import Button from '@nutui/nutui-react-taro/dist/es/packages/button'
import { AppIcon } from '@/components/AppIcon'
import eliteIcon from '@/assets/identity/identity-elite.png'
import navigatorIcon from '@/assets/identity/identity-navigator.png'
import type { VipLevelItem } from '@/services'
import {
  getButtonText,
  getLevelDescription,
  getLevelTitle,
  getDisplayPriceText,
  getPerkNames,
  getVipPriceText,
  isFreeLevel,
  isNavigatorLevel
} from '../member-benefit.helpers'
import { textOrPlaceholder } from '@/shared/view-data'

interface MemberPlanCardProps {
  level: VipLevelItem
  isPaymentLocked: boolean
  onPay: (level: VipLevelItem) => void
}

const visualByType = {
  elite: {
    card: 'text-ink',
    borderColor: 'rgba(238, 203, 118, 0.44)',
    background: 'linear-gradient(145deg, rgba(251, 239, 202, 0.98), rgba(255, 252, 244, 0.95)), #fff8e8',
    iconBox: 'bg-white/70',
    icon: eliteIcon,
    badge: 'bg-[rgba(201,147,40,0.14)] text-[#A66E11]',
    priceBox: 'bg-white/90',
    price: 'text-[#BD8221]',
    button: 'border-0 text-[#172033]',
    buttonBackground: 'linear-gradient(135deg, #f7d789, #c99328)',
    buttonShadow: '0 14px 26px rgba(201, 147, 40, 0.28)',
    check: 'bg-[rgba(201,147,40,0.14)] text-[#B57A1C]',
    perk: 'text-[#5F6A7D]',
    origin: 'text-[#8B95A7]'
  },
  navigator: {
    card: 'text-white',
    borderColor: 'rgba(138, 163, 255, 0.46)',
    background:
      'radial-gradient(circle at 84% 16%, rgba(238, 203, 118, 0.2), transparent 28%), linear-gradient(145deg, #111b47, #381767 96%)',
    iconBox: 'bg-white/10',
    icon: navigatorIcon,
    badge: 'bg-white/10 text-white/80',
    priceBox: 'bg-white/10',
    price: 'text-[#F7D789]',
    button: 'border-0 text-white',
    buttonBackground: 'linear-gradient(135deg, #f5d981, #8ea4ff 48%, #7b55ff)',
    buttonShadow: '0 14px 28px rgba(107, 83, 255, 0.32)',
    check: 'bg-[#F7D789]/20 text-[#F7D789]',
    perk: 'text-white/80',
    origin: 'text-white/50'
  }
}

const textStyle = {
  title: { fontSize: '34rpx', lineHeight: '42rpx' },
  desc: { fontSize: '28rpx', lineHeight: '42rpx' },
  badge: { fontSize: '22rpx', lineHeight: '28rpx' },
  priceLabel: { fontSize: '26rpx', lineHeight: '34rpx' },
  price: { fontSize: '46rpx', lineHeight: '52rpx' },
  priceSuffix: { fontSize: '26rpx', lineHeight: '32rpx' },
  originalPrice: { fontSize: '22rpx', lineHeight: '30rpx' },
  perk: { fontSize: '29rpx', lineHeight: '42rpx' },
  button: {
    minHeight: '100rpx',
    height: '100rpx',
    borderRadius: '999rpx',
    fontSize: '30rpx',
    lineHeight: '38rpx'
  }
} satisfies Record<string, CSSProperties>

export function MemberPlanCard({ level, isPaymentLocked, onPay }: MemberPlanCardProps) {
  const isNavigator = isNavigatorLevel(level)
  const visual = visualByType[isNavigator ? 'navigator' : 'elite']
  const perks = getPerkNames(level)
  const priceText = getDisplayPriceText(level)
  const cardStyle: CSSProperties = { background: visual.background, borderColor: visual.borderColor }
  const buttonStyle: CSSProperties = {
    ...textStyle.button,
    background: visual.buttonBackground,
    boxShadow: visual.buttonShadow
  }

  return (
    <View className={`overflow-hidden rounded-[26px] border px-4 py-5 shadow-soft ${visual.card}`} style={cardStyle}>
      <View className="flex items-start justify-between gap-3">
        <View className="flex min-w-0 flex-1 items-center gap-3">
          <View className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] ${visual.iconBox}`}>
            <Image className="h-10 w-10" src={visual.icon} mode="aspectFit" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="block font-bold" style={textStyle.title}>
              {textOrPlaceholder(getLevelTitle(level), '行商会员')}
            </Text>
            <Text className={`mt-2 block ${isNavigator ? 'text-white/72' : 'text-[#5F6A7D]'}`} style={textStyle.desc}>
              {getLevelDescription(level)}
            </Text>
          </View>
        </View>
        <Text className={`shrink-0 rounded-full px-3 py-1.5 font-bold ${visual.badge}`} style={textStyle.badge}>
          {isNavigator ? '推荐升级' : isFreeLevel(level) ? '免费版本' : '基础会员'}
        </Text>
      </View>

      <View className={`mt-5 rounded-[20px] px-4 py-4 ${visual.priceBox}`}>
        <View className="flex items-end justify-between gap-3">
          <View>
            <Text
              className={`block font-semibold ${isNavigator ? 'text-white/55' : 'text-[#7B8496]'}`}
              style={textStyle.priceLabel}
            >
              年度权益价
            </Text>
            <Text className={`mt-2 block font-bold ${visual.price}`} style={textStyle.price}>
              {priceText}
              {isFreeLevel(level) ? null : (
                <Text className="font-bold" style={textStyle.priceSuffix}>
                  /年
                </Text>
              )}
            </Text>
          </View>
          {level.original_price ? (
            <Text className={`max-w-[160rpx] text-right line-through ${visual.origin}`} style={textStyle.originalPrice}>
              原价 {getVipPriceText(level.original_price)}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="mb-7 mt-5 grid gap-3">
        {perks.map((item) => (
          <View key={item} className="flex items-start gap-3">
            <View
              className={`mt-0.5 flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full ${visual.check}`}
            >
              <AppIcon name="check-line" size={13} color="currentColor" />
            </View>
            <Text className={`flex-1 font-semibold ${visual.perk}`} style={textStyle.perk}>
              {item}
            </Text>
          </View>
        ))}
      </View>

      <Button
        block
        className={`rounded-full font-bold ${visual.button}`}
        disabled={isPaymentLocked}
        shape="round"
        size="xlarge"
        style={buttonStyle}
        type="primary"
        onClick={() => onPay(level)}
      >
        {isPaymentLocked ? '支付处理中' : getButtonText(level)}
      </Button>
    </View>
  )
}
