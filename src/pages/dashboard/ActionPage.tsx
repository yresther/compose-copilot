import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import type { ActionCardData } from '../../components/ui/ActionCard'
import ActionCardWide from '../../components/ui/ActionCardWide'
import EmptyActions from '../../components/ui/EmptyActions'
import { useToast } from '../../components/ui/Toast'
import { useActions } from '../../state/ActionsContext'
import { useLiveActionList } from '../../state/useLiveActions'

// 액션 제안 (02_dashboard-action.png)
export default function ActionPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { checked, setChecked, completed, complete, undo } = useActions()

  const actions = useLiveActionList()
  const selected = [...checked].filter((id) => !completed[id])

  const completeIds = (ids: string[]) => {
    if (ids.length === 0) return
    complete(ids)
    toast.show('액션을 완료했어요.')
  }

  const open = (a: ActionCardData) => a.link && navigate(a.link)

  // 발주 카드의 '발주시스템으로 전송' — 발주관리로 이동하지 않고 이 자리에서 전송 처리 → 완료(흐린 카드)로
  const sendOrder = (a: ActionCardData) => {
    if (a.done) return
    complete([a.id])
    toast.show(`발주 시스템으로 전송했어요. (${a.title.replace(/ 발주$/, '')} ${a.subtitle})`)
  }

  return (
    <div className="pb-24">
      <PageHeader title="오늘의 할 일" basis />

      <div className="px-page">
        <div className="mt-[21px] flex items-center justify-between">
          <h2 className="text-heading text-gray-900">오늘의 우선 실행 순위</h2>
          {actions.length > 0 && (
            <button
              type="button"
              onClick={() => completeIds(selected)}
              className="mr-2 font-num text-[14px] text-gray-800 underline underline-offset-2 hover:text-gray-900"
            >
              선택항목({selected.length}) 완료하기
            </button>
          )}
        </div>

        {actions.length === 0 && <EmptyActions className="mt-[22px] py-[80px]" />}
        <div className="mt-[22px] flex flex-col gap-[23px]">
          {actions.map((a) => (
            <ActionCardWide
              key={a.id}
              data={a}
              checked={checked.has(a.id)}
              onCheckedChange={(on) => setChecked(a.id, on)}
              onOpen={open}
              onCta={a.kind === 'order' ? sendOrder : undefined}
              onComplete={(d) => completeIds([d.id])}
              onUndo={(d) => {
                undo(d.id)
                toast.show('완료를 취소했어요.')
              }}
              onViewDraft={() => toast.show('초안 전체보기는 준비중이에요')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
