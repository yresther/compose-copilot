import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import type { ActionCardData } from '../../components/ui/ActionCard'
import ActionCardWide from '../../components/ui/ActionCardWide'
import EmptyActions from '../../components/ui/EmptyActions'
import PeriodTabs from '../../components/ui/PeriodTabs'
import { useToast } from '../../components/ui/Toast'
import { doneToast, useActions } from '../../state/ActionsContext'
import { useLiveActionList } from '../../state/useLiveActions'
import DeleteActionsModal from './DeleteActionsModal'

type Tab = 'todo' | 'done'

// 오늘의 할 일 (02_dashboard-action.png) — 위쪽 탭: 해야 할 일 / 완료한 항목 (?tab=done)
export default function ActionPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { checked, setChecked, completed, complete, undo, remove } = useActions()
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'done' ? 'done' : 'todo'
  const [deleting, setDeleting] = useState<ActionCardData | null>(null)

  const all = useLiveActionList()
  const todo = all.filter((a) => !a.done)
  const done = all.filter((a) => a.done)
  const actions = tab === 'done' ? done : todo
  const selected = [...checked].filter((id) => !completed[id])

  const completeIds = (ids: string[]) => {
    if (ids.length === 0) return
    complete(ids)
    toast.show(doneToast(ids.length))
  }

  const open = (a: ActionCardData) => a.link && navigate(a.link)

  // 발주 카드의 '발주시스템으로 전송' — 발주관리로 이동하지 않고 이 자리에서 전송 처리 → 완료(흐린 카드)로
  const sendOrder = (a: ActionCardData) => {
    if (a.done) return
    complete([a.id])
    toast.show(`발주 시스템으로 전송하고 완료했어요. (${a.title.replace(/ 발주$/, '')} ${a.subtitle}) 완료한 항목에서 볼 수 있어요.`)
  }

  return (
    <div className="pb-24">
      <PageHeader title="오늘의 할 일" basis />

      <div className="px-page">
        <div className="mt-[21px] flex items-center justify-between">
          <PeriodTabs
            variant="light"
            items={[
              { key: 'todo', label: `해야 할 일 ${todo.length}` },
              { key: 'done', label: `완료한 항목 ${done.length}` },
            ]}
            value={tab}
            onChange={(k) => setParams(k === 'done' ? { tab: 'done' } : {}, { replace: true })}
          />
          {tab === 'todo' && todo.length > 0 && (
            <button
              type="button"
              onClick={() => completeIds(selected)}
              className="mr-2 font-num text-[14px] text-gray-800 underline underline-offset-2 hover:text-gray-900"
            >
              선택항목({selected.length}) 완료하기
            </button>
          )}
        </div>

        {tab === 'todo' && <h2 className="mt-[26px] text-heading text-gray-900">오늘의 우선 실행 순위</h2>}
        {actions.length === 0 && (
          <EmptyActions variant={tab === 'done' ? 'done' : done.length > 0 ? 'allDone' : 'none'} className="mt-[22px] py-[80px]" />
        )}
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
                toast.show('완료를 취소했어요. 해야 할 일로 돌아갔어요.')
              }}
              onDelete={tab === 'done' ? setDeleting : undefined}
              onViewDraft={() => toast.show('초안 전체보기는 준비중이에요')}
            />
          ))}
        </div>
      </div>
      <DeleteActionsModal
        open={deleting !== null}
        items={deleting ? [deleting] : []}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) remove([deleting.id])
          setDeleting(null)
          toast.show('완료한 항목을 삭제했어요.')
        }}
      />
    </div>
  )
}
