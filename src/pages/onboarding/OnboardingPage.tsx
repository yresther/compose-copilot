import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useOnboarding } from './OnboardingContext'
import OnboardingLayout from './OnboardingLayout'
import Step1Pos from './Step1Pos'
import Step2Store from './Step2Store'
import Step3Expense from './Step3Expense'
import Step4Extra from './Step4Extra'

const STEPS = [Step1Pos, Step2Store, Step3Expense, Step4Extra]

/** /onboarding/1 ~ 4 */
export default function OnboardingPage() {
  const step = Number(useParams().step)
  const Step = STEPS[step - 1]
  const { reach } = useOnboarding()
  useEffect(() => {
    if (step >= 1 && step <= STEPS.length) reach(step)
  }, [step, reach])
  if (!Step) return <Navigate to="/onboarding/1" replace />
  return (
    <OnboardingLayout step={step}>
      <Step key={step} />
    </OnboardingLayout>
  )
}
