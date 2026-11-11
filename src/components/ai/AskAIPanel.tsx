import { ArrowUp, RotateCcw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTyping } from '../../hooks/useTyping'
import { STARTER_QUESTIONS, type AiAnswer } from '../../lib/askAI'
import { useAskAI, type ChatMessage } from '../../state/AskAIContext'
import AiSparkleIcon from '../icons/AiSparkleIcon'

function AiAvatar() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-300 text-brown-900">
      <AiSparkleIcon size={15} />
    </span>
  )
}

function Suggestions({ items, onPick }: { items: string[]; onPick: (q: string) => void }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onPick(q)}
          className="rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1.5 text-[13px] font-medium text-gray-800 transition-colors hover:bg-yellow-100"
        >
          {q}
        </button>
      ))}
    </div>
  )
}

/** AI 답 — 마지막 답만 타이핑 효과, 끝나면 바로가기·이어서 물어볼 질문 */
function AiBubble({
  answer,
  animate,
  onPick,
  onLink,
}: {
  answer: AiAnswer
  animate: boolean
  onPick: (q: string) => void
  onLink: (to: string) => void
}) {
  const { typed, done } = useTyping(answer.text, animate, 12)
  const shown = animate ? typed : answer.text
  const finished = !animate || done
  return (
    <div className="flex gap-2.5">
      <AiAvatar />
      <div className="min-w-0 flex-1">
        <div className="whitespace-pre-line rounded-[4px_16px_16px_16px] bg-gray-100 px-4 py-3 text-[14px] leading-[1.65] text-gray-900">
          {shown}
        </div>
        {finished && answer.links && (
          <div className="mt-2 flex flex-wrap gap-2">
            {answer.links.map((l) => (
              <button
                key={l.to + l.label}
                type="button"
                onClick={() => onLink(l.to)}
                className="rounded-btn bg-brown-900 px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-brown-800"
              >
                {l.label} →
              </button>
            ))}
          </div>
        )}
        {finished && animate && answer.suggestions && <Suggestions items={answer.suggestions} onPick={onPick} />}
      </div>
    </div>
  )
}

/** 오른쪽에서 열리는 AI 코파일럿 대화창 */
export default function AskAIPanel() {
  const navigate = useNavigate()
  const { open, setOpen, messages, thinking, ask, reset } = useAskAI()
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 새 메시지·타이핑 중에는 맨 아래로
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const t = setInterval(() => (el.scrollTop = el.scrollHeight), 60)
    const stop = setTimeout(() => clearInterval(t), 4000)
    el.scrollTop = el.scrollHeight
    return () => {
      clearInterval(t)
      clearTimeout(stop)
    }
  }, [messages, thinking])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  if (!open) return null

  const send = (q = text) => {
    if (!q.trim() || thinking) return
    ask(q)
    setText('')
  }
  const lastAi = [...messages].reverse().find((m) => m.role === 'ai')

  return (
    <aside
      role="dialog"
      aria-label="AI 코파일럿"
      className="fixed inset-y-0 right-0 z-50 flex w-[420px] animate-ai-panel-in flex-col bg-white shadow-modal"
    >
      <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-gray-300 px-5">
        <AiAvatar />
        <div>
          <p className="text-[16px] font-bold text-gray-900">AI 코파일럿</p>
          <p className="text-[12px] text-gray-500">우리 매장 데이터를 보고 답해요</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={reset}
              aria-label="대화 지우기"
              className="flex h-8 w-8 items-center justify-center rounded-btn text-gray-500 hover:bg-gray-200 hover:text-gray-800"
            >
              <RotateCcw size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="닫기"
            className="flex h-8 w-8 items-center justify-center rounded-btn text-gray-500 hover:bg-gray-200 hover:text-gray-800"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      <div ref={listRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
        <AiBubble
          answer={{
            text: '안녕하세요 사장님! 매출·재고·지출·리뷰·정책자금처럼 매장 운영에 궁금한 걸 물어보세요. 지금 매장 데이터를 보고 바로 답해드려요.',
          }}
          animate={false}
          onPick={send}
          onLink={() => {}}
        />
        {messages.length === 0 && (
          <div className="pl-[42px]">
            <Suggestions items={STARTER_QUESTIONS} onPick={send} />
          </div>
        )}
        {messages.map((m: ChatMessage) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[80%] whitespace-pre-line rounded-[16px_4px_16px_16px] bg-brown-900 px-4 py-2.5 text-[14px] leading-[1.6] text-white">
                {m.text}
              </p>
            </div>
          ) : (
            <AiBubble
              key={m.id}
              answer={m.answer!}
              animate={m.id === lastAi?.id}
              onPick={send}
              onLink={(to) => {
                setOpen(false)
                navigate(to)
              }}
            />
          ),
        )}
        {thinking && (
          <div className="flex items-center gap-2.5" aria-live="polite">
            <AiAvatar />
            <span className="flex gap-1 rounded-full bg-gray-100 px-4 py-3" aria-label="답을 만드는 중">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: `${i * 120}ms` }} />
              ))}
            </span>
          </div>
        )}
      </div>

      <form
        className="shrink-0 border-t border-gray-300 p-4"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <div className="flex items-end gap-2 rounded-input border border-gray-300 bg-white py-2 pl-4 pr-2 focus-within:border-yellow-300">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // 한글 조합 중 Enter는 무시 (글자가 두 번 보내지는 것 방지)
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                send()
              }
            }}
            rows={1}
            placeholder="무엇이든 물어보세요!"
            aria-label="질문 입력"
            className="max-h-24 flex-1 resize-none bg-transparent py-1.5 text-[14px] text-gray-900 outline-none placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!text.trim() || thinking}
            aria-label="보내기"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-300 text-brown-900 transition disabled:bg-gray-200 disabled:text-gray-400"
          >
            <ArrowUp size={18} strokeWidth={2.25} />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-gray-400">데모용 AI예요. 앱 안의 매장 데이터로만 답해요.</p>
      </form>
    </aside>
  )
}
