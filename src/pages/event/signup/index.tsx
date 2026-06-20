import { FormPreview } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { routes } from '@/shared/router'

export default function EventSignupPage() {
  return (
    <PageShell title='活动报名' subtitle='确认参会人和票务信息。'>
      <FormPreview
        title='报名信息'
        desc='提交后生成活动订单和电子票。'
        fields={[
          { label: '参会人', value: '陈总' },
          { label: '手机号', value: '13800008888' },
          { label: '公司', value: '鑫财财税有限公司' },
          { label: '票种', value: '普通票 ¥598' }
        ]}
        actions={[
          { label: '对公转账', variant: 'outline', path: routes.paymentTransfer },
          { label: '确认报名', path: routes.eventTicket }
        ]}
      />
    </PageShell>
  )
}
