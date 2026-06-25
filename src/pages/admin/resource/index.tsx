import { useEffect, useState } from 'react'
import { EmptyState, ItemList, type ListItem } from '@/components/business'
import { PageShell } from '@/components/PageShell'
import { getContractDetail, getContracts, getUserCustomers } from '@/services'
import { firstRecordList, textOf, textOrPlaceholder } from '@/shared/view-data'

export default function AdminResourcePage() {
  const [items, setItems] = useState<ListItem[]>([])

  useEffect(() => {
    async function loadResources() {
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
          action: '查看'
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
          action: '查看'
        }))
      ])
    }

    void loadResources().catch(() => setItems([]))
  }, [])

  return (
    <PageShell title="资源需求" subtitle="跟进非标需求、供应商报价和交付状态。">
      {items.length ? <ItemList items={items} /> : <EmptyState title="暂无资源需求" />}
    </PageShell>
  )
}
