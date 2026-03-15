'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin-layout'
import { ExpenseForm } from '@/components/expenses/expense-form'
import { EXPENSES } from '@/lib/mock-data'
import { getExpenses, initializeExpenses } from '@/lib/expenses-store'
import type { Expense } from '@/lib/types'

interface EditExpensePageProps {
  params: Promise<{ id: string }>
}

export default function EditExpensePage({ params }: EditExpensePageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [expense, setExpense] = useState<Expense | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let expenses = getExpenses()
    if (expenses.length === 0) {
      initializeExpenses(EXPENSES)
      expenses = EXPENSES
    }
    const found = expenses.find(e => e.id === id)
    if (!found) {
      router.replace('/404')
    } else {
      setExpense(found)
    }
    setIsLoading(false)
  }, [id, router])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    )
  }

  if (!expense) {
    return null
  }

  return (
    <AdminLayout>
      <ExpenseForm expense={expense} />
    </AdminLayout>
  )
}
