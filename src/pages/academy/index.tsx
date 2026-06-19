import { View, Text } from '@tarojs/components'
import { PageShell } from '../../components/PageShell'

const sections = ['书苑介绍', '师资团队', '课程体系', '空间预约']

export default function AcademyPage() {
  return (
    <PageShell title='行尚书苑' subtitle='了解书苑理念、课程体系和线下空间服务。'>
      <View className='rounded-lg bg-white p-4 shadow-soft'>
        {sections.map((section, index) => (
          <View
            key={section}
            className={`flex items-center justify-between py-4 ${
              index === sections.length - 1 ? '' : 'border-b border-[#edf1ee]'
            }`}
          >
            <Text className='text-base font-medium text-ink'>{section}</Text>
            <Text className='text-xl text-[#9aa7a1]'>›</Text>
          </View>
        ))}
      </View>
    </PageShell>
  )
}
