import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ToastProvider } from './components/ui/Toast.tsx'
import './index.css'
import { ExpenseProvider } from './state/ExpenseContext.tsx'
import { ActionsProvider } from './state/ActionsContext.tsx'
import { InventoryProvider } from './state/InventoryContext.tsx'
import { ReviewsProvider } from './state/ReviewsContext.tsx'
import { NotificationsProvider } from './state/NotificationsContext.tsx'
import { AskAIProvider } from './state/AskAIContext.tsx'
import { OnboardingProvider } from './pages/onboarding/OnboardingContext.tsx'
import { OrdersProvider } from './state/OrdersContext.tsx'

// 사이트를 새로 열거나 새로고침하면 어느 주소였든 인트로 + 로그인 화면부터
if (window.location.pathname !== '/login') window.history.replaceState(null, '', '/login')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <ActionsProvider>
          <OrdersProvider>
            <InventoryProvider>
              <ExpenseProvider>
                <ReviewsProvider>
                  <NotificationsProvider>
                    <AskAIProvider>
                      <OnboardingProvider>
                        <App />
                      </OnboardingProvider>
                    </AskAIProvider>
                  </NotificationsProvider>
                </ReviewsProvider>
              </ExpenseProvider>
            </InventoryProvider>
          </OrdersProvider>
        </ActionsProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
