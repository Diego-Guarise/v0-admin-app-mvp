import { AdminLayout } from '@/components/admin-layout'
import { ExpenseDetail } from '@/components/expenses/expense-detail'
import { notFound } from 'next/navigation'
import { EXPENSES } from '@/lib/mock-data'

interface ExpenseDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ExpenseDetailPage({ params }: ExpenseDetailPageProps) {
  const { id } = await params
  const expense = EXPENSES.find(e => e.id === id)

  if (!expense) {
    notFound()
  }

  return (
    <AdminLayout>
      <ExpenseDetail expense={expense} />
    </AdminLayout>
  )
}
