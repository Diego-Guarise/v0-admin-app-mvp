import { AdminLayout } from '@/components/admin-layout'
import { ExpenseForm } from '@/components/expenses/expense-form'
import { notFound } from 'next/navigation'
import { EXPENSES } from '@/lib/mock-data'

interface EditExpensePageProps {
  params: Promise<{ id: string }>
}

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const { id } = await params
  const expense = EXPENSES.find(e => e.id === id)

  if (!expense) {
    notFound()
  }

  return (
    <AdminLayout>
      <ExpenseForm expense={expense} />
    </AdminLayout>
  )
}
