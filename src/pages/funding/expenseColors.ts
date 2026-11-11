import type { ExpenseId } from '../../lib/expense'

// 항목별 색 — tailwind가 찾을 수 있게 클래스 이름을 그대로 적는다
export const EXPENSE_BG: Record<ExpenseId, string> = {
  material: 'bg-expense-material',
  labor: 'bg-expense-labor',
  rent: 'bg-expense-rent',
  royalty: 'bg-expense-royalty',
  loan: 'bg-expense-loan',
  repair: 'bg-expense-repair',
  telecom: 'bg-expense-telecom',
}
export const EXPENSE_TEXT: Record<ExpenseId, string> = {
  material: 'text-expense-material-text',
  labor: 'text-expense-labor-text',
  rent: 'text-expense-rent-text',
  royalty: 'text-expense-royalty-text',
  loan: 'text-expense-loan-text',
  repair: 'text-expense-repair-text',
  telecom: 'text-expense-telecom-text',
}

export const won = (n: number) => `${n.toLocaleString('ko-KR')}원`
export const pct = (n: number) => `${n.toFixed(1).replace(/\.0$/, '')}%`
