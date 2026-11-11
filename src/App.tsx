import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import { NAV_GROUPS } from './config/nav'
import ActionPage from './pages/dashboard/ActionPage'
import DashboardHome from './pages/dashboard/DashboardHome'
import NotificationsPage from './pages/dashboard/NotificationsPage'
import ComponentsPreview from './pages/dev/ComponentsPreview'
import ExpensePage from './pages/funding/ExpensePage'
import FundingPolicyPage from './pages/funding/FundingPolicyPage'
import InventoryPage from './pages/inventory/InventoryPage'
import OrderPage from './pages/order/OrderPage'
import ReviewPage from './pages/review/ReviewPage'
import InsightPage from './pages/onboarding/InsightPage'
import LoginPage from './pages/login/LoginPage'
import OnboardingPage from './pages/onboarding/OnboardingPage'
import PlaceholderPage from './pages/PlaceholderPage'
import SalesPatternPage from './pages/sales/SalesPatternPage'
import SalesReportPage from './pages/sales/SalesReportPage'

const HOME = '/dashboard'
const ACTION = '/dashboard/action'
const SALES_REPORT = '/sales/report'
const SALES_PATTERN = '/sales/pattern'
const ORDER = '/order'
const INVENTORY = '/inventory'
const FUNDING_POLICY = '/funding/policy'
const FUNDING_EXPENSE = '/funding/expense'
const REVIEW = '/review'
const pages = NAV_GROUPS.flatMap((g) => g.items).filter(
  (i) => ![HOME, ACTION, SALES_REPORT, SALES_PATTERN, ORDER, INVENTORY, FUNDING_POLICY, FUNDING_EXPENSE, REVIEW].includes(i.path),
)

export default function App() {
  return (
    <Routes>
      {/* 첫 진입은 인트로 + 로그인 → 온보딩 → 대시보드 */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<LoginPage />} />
      <Route path="/find" element={<LoginPage />} />
      <Route path="/contact" element={<LoginPage />} />
      <Route path="/onboarding/:step" element={<OnboardingPage />} />
      <Route element={<AppLayout />}>
        <Route path="/onboarding/5" element={<InsightPage />} />
        <Route path={HOME} element={<DashboardHome />} />
        <Route path={ACTION} element={<ActionPage />} />
        <Route path="/dashboard/notifications" element={<NotificationsPage />} />
        <Route path={SALES_REPORT} element={<SalesReportPage />} />
        <Route path={SALES_PATTERN} element={<SalesPatternPage />} />
        <Route path={ORDER} element={<OrderPage />} />
        <Route path={INVENTORY} element={<InventoryPage />} />
        <Route path={FUNDING_POLICY} element={<FundingPolicyPage />} />
        <Route path={FUNDING_EXPENSE} element={<ExpensePage />} />
        <Route path={REVIEW} element={<ReviewPage />} />
        {pages.map((p) => (
          <Route key={p.path} path={p.path} element={<PlaceholderPage />} />
        ))}
        {import.meta.env.DEV && <Route path="/dev/components" element={<ComponentsPreview />} />}
      </Route>
      <Route path="*" element={<Navigate to={HOME} replace />} />
    </Routes>
  )
}
