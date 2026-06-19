import { View, Text } from '@tarojs/components'
import { PageShell } from '@/components/PageShell'

const sections = [
  ['平台定位', '财税行业生态服务与资源协同'],
  ['伙伴权益', '优先派单、工具优惠、专属课程'],
  ['课程体系', '经营增长、专业考证、线下活动'],
  ['服务标准', '认证服务商、顾问审核、过程留痕']
]

export default function ShuyuanPage() {
  return (
    <PageShell title='行商书苑' subtitle='沉淀行业资源、服务标准和伙伴成长体系。'>
      <View className='rounded-lg bg-white p-4 shadow-soft'>
        {sections.map(([title, desc], index) => (
          <View
            key={title}
            className={`flex items-center justify-between gap-4 py-4 ${
              index === sections.length - 1 ? '' : 'border-b border-line'
            }`}
          >
            <View>
              <Text className='block text-base font-semibold text-ink'>{title}</Text>
              <Text className='mt-1 block text-xs leading-5 text-muted'>{desc}</Text>
            </View>
            <Text className='text-xl text-line'>›</Text>
          </View>
        ))}
      </View>
    </PageShell>
  )
}
