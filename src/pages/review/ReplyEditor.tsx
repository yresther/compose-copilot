import { useEffect, useState } from 'react'
import AiSparkleIcon from '../../components/icons/AiSparkleIcon'
import Button from '../../components/ui/Button'
import { useTyping } from '../../hooks/useTyping'

type Props = { draft: string; onCancel: () => void; onSubmit: (text: string) => void }

/** AI 답글 초안 — 타이핑 효과로 채운 뒤 수정 가능, 등록 */
export default function ReplyEditor({ draft, onCancel, onSubmit }: Props) {
  const { typed, done } = useTyping(draft, true)
  const [text, setText] = useState('')
  // 타이핑이 끝나면 그때부터 사장님이 직접 고칠 수 있음
  useEffect(() => {
    if (done) setText(draft)
  }, [done, draft])

  return (
    <div className="mt-4 rounded-input border border-yellow-line bg-yellow-50 p-4">
      <p className="flex items-center gap-[5px] text-[14px] font-semibold text-yellow-700">
        <AiSparkleIcon size={14} />
        {done ? 'AI 답글 초안이에요. 필요하면 고쳐서 등록하세요' : 'AI가 답글을 쓰고 있어요…'}
      </p>
      <textarea
        aria-label="답글"
        value={done ? text : typed}
        readOnly={!done}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        className={`mt-3 w-full resize-none rounded-input border bg-white px-4 py-3 text-[14px] leading-[1.6] text-gray-900 outline-none transition-colors ${
          done ? 'border-gray-300 focus:border-yellow-300' : 'border-transparent'
        }`}
      />
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="outline" size="sm" className="w-[72px]" onClick={onCancel}>
          취소
        </Button>
        <Button size="sm" className="w-[72px]" disabled={!done || !text.trim()} onClick={() => onSubmit(text.trim())}>
          등록
        </Button>
      </div>
    </div>
  )
}
