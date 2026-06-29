import { useEffect, useState } from 'react'
import { View } from '@tarojs/components'
import { InterfaceGapNotice, ItemList, StateNotice, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getContractDetail, getContracts, getUserCustomers } from '@/services'
import { firstRecordList, textOf, textOrPlaceholder } from '@/shared/view-data'
import { AdminGuard } from '../components/AdminGuard'

function AdminResourceContent() {
  const [items, setItems] = useState<ListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function loadResources() {
      setIsLoading(true)
      setHasError(false)

      const [customersResult, contractsResult] = await Promise.allSettled([
        getUserCustomers({ page: 1, page_size: 10 }),
        getContracts({ page: 1, page_size: 10 })
      ])

      const customers = customersResult.status === 'fulfilled' ? firstRecordList(customersResult.value.data) : []
      const contracts = contractsResult.status === 'fulfilled' ? firstRecordList(contractsResult.value.data) : []
      const firstContractId = textOf(contracts[0]?.contract_id ?? contracts[0]?.id)
      const contractDetail = firstContractId
        ? await getContractDetail({ contract_id: firstContractId }).catch(() => null)
        : null

      setItems([
        ...customers.map((item) => ({
          title: textOrPlaceholder(item.name ?? item.customer_name ?? item.title, '未命名客户'),
          desc: textOrPlaceholder(item.description ?? item.company_name ?? item.status_text, '接口未返回客户说明'),
          meta: textOf(item.created_at),
          tag: textOf(item.status_text),
          icon: 'user-3-line',
          tone: 'brand' as const,
          action: '查看状态'
        })),
        ...contracts.map((item) => ({
          title: textOrPlaceholder(item.contract_no ?? item.title ?? item.name, '未命名合同'),
          desc: textOrPlaceholder(
            contractDetail?.data && firstRecordList(contractDetail.data)[0]?.description
              ? firstRecordList(contractDetail.data)[0]?.description
              : (item.description ?? item.status_text),
            '接口未返回合同说明'
          ),
          meta: textOf(item.created_at),
          tag: textOf(item.status_text),
          icon: 'archive-line',
          tone: 'tech' as const,
          action: '查看状态'
        }))
      ])

      setHasError(customersResult.status === 'rejected' && contractsResult.status === 'rejected')
    }

    void loadResources()
      .catch(() => {
        setItems([])
        setHasError(true)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <PageShell title="资源需求" subtitle="跟进非标需求、供应商报价和交付状态。">
      <View className="grid gap-3">
        <InterfaceGapNotice
          title="当前可查看，暂不能分配处理"
          desc="当前接口可以读取客户和合同类数据，但还没有后台资源需求队列、分配或处理接口，因此页面不提供处理类操作。"
          items={[
            '缺少后台资源需求列表接口，不能区分用户提交记录和后台待处理记录。',
            '缺少资源需求分配接口，不能指定供应商、客户经理或处理人。',
            '缺少资源需求状态更新接口，不能标记处理中、已匹配或已完成。',
            '缺少资源采购交付进度接口，不能展示服务开通和交付状态。'
          ]}
        />
        {isLoading ? (
          <StateNotice state="loading" />
        ) : hasError ? (
          <StateNotice state="error" />
        ) : items.length ? (
          <ItemList items={items} />
        ) : (
          <StateNotice state="empty" copy={{ title: '暂无资源数据', desc: '当前接口没有返回客户或合同数据。' }} />
        )}
      </View>
    </PageShell>
  )
}

export default function AdminResourcePage() {
  return (
    <AdminGuard title="资源需求">
      <AdminResourceContent />
    </AdminGuard>
  )
}
