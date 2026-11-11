import { useCallback, useState } from 'react'
import { useLocation } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import { useToast } from '../../components/ui/Toast'
import PolicyIntro from './PolicyIntro'
import PolicyLoading from './PolicyLoading'
import PolicyResult from './PolicyResult'
import PolicySurvey, { type Answers } from './PolicySurvey'
import PreInfoEditor, { type PreInfo } from './PreInfoEditor'
import data from '../../data/funding-policy.json'

type Step = 'intro' | 'survey' | 'info' | 'result'

const TITLE: Record<Step, string> = { intro: '정책자금', survey: '맞춤 정책자금 찾기', info: '수집 정보 수정', result: '정책자금' }

/** 정책자금 — 한 페이지 안에서 intro → survey → (로딩) → result. 유료 기능이지만 데모에서는 모두 공개 */
function FundingPolicy() {
  const toast = useToast()
  const [step, setStep] = useState<Step>('intro')
  const [answers, setAnswers] = useState<Answers>({})
  const [loading, setLoading] = useState(false)
  // 사전 정보 — 수정하기 화면에서 바꾸면 설문·결과 칩에 반영
  const [preInfo, setPreInfo] = useState<PreInfo>(data.infoForm.initial)

  const go = (s: Step) => {
    setStep(s)
    window.scrollTo({ top: 0 })
  }
  const finishLoading = useCallback(() => {
    setLoading(false)
    setStep('result')
    window.scrollTo({ top: 0 })
  }, [])

  return (
    <div className="pb-24">
      <PageHeader title={TITLE[step]} className="pt-6" />
      <div className="px-page">
        {step === 'intro' && <PolicyIntro onStart={() => go('survey')} />}
        {step === 'survey' && (
          <PolicySurvey
            answers={answers}
            onAnswer={(id, v) => setAnswers((a) => ({ ...a, [id]: v }))}
            preInfo={preInfo}
            onEditInfo={() => go('info')}
            onFind={() => setLoading(true)}
            onLater={() => {
              go('intro')
              toast.show('다음에 이어서 찾을 수 있어요')
            }}
          />
        )}
        {step === 'info' && (
          <PreInfoEditor
            value={preInfo}
            onCancel={() => go('survey')}
            onSave={(v) => {
              setPreInfo(v)
              go('survey')
              toast.show('수집 정보를 수정했어요. 지원금 매칭에 반영돼요')
            }}
          />
        )}
        {step === 'result' && <PolicyResult answers={answers} preInfo={preInfo} onEdit={() => go('survey')} />}
      </div>
      <PolicyLoading open={loading} onDone={finishLoading} />
    </div>
  )
}

// 사이드바로 다시 들어오면(같은 주소를 다시 눌러도) intro부터 — 이동할 때마다 새로 그린다
export default function FundingPolicyPage() {
  const location = useLocation()
  return <FundingPolicy key={location.key} />
}
