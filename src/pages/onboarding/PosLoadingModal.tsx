import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'
import posCup from '../../assets/illust/pos-cup.png'
import Modal from '../../components/ui/Modal'
import data from '../../data/onboarding.json'

const L = data.loading
// 일러스트(원본에서 점을 지운 그림) 안 점 3개 자리 — 그림 크기 대비 비율
const DOTS = [0.4622, 0.5247, 0.5872]
const DOT_Y = 0.4655
const DOT_SIZE = 6.5

/** POS 연결 로딩 — 진행바 0→100% (약 3초), 체크리스트 3개가 차례로 완료되면 onDone */
export default function PosLoadingModal({ open, onDone }: { open: boolean; onDone: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!open) return
    setProgress(0)
    const start = performance.now()
    let timer: ReturnType<typeof setTimeout>
    // 지난 시간으로 진행도 계산 — 화면이 뒤에 있어도 멈추지 않음
    const interval = setInterval(() => {
      const p = Math.min(1, (performance.now() - start) / L.durationMs)
      setProgress(p)
      if (p >= 1) {
        clearInterval(interval)
        timer = setTimeout(onDone, 400)
      }
    }, 30)
    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [open, onDone])

  // 진행이 1/3, 2/3, 끝에 닿을 때 항목이 하나씩 완료
  const doneCount = progress >= 1 ? 3 : Math.floor(progress * 3)

  return (
    <Modal open={open} dismissible={false} screenCenter>
      <div className="flex flex-col items-center pb-[58px] pt-[62px]">
        <h2 className="text-[25px] font-bold text-gray-900">{L.title}</h2>
        {/* 80% 넘으면 문구가 바뀜 */}
        <p className="mt-[14px] text-[16px] font-medium text-gray-700">{progress >= L.almostDoneFrom ? L.almostDone : L.subtitle}</p>
        {/* 점 3개는 로딩 표시처럼 차례로 움직임 */}
        <div className="relative mt-[29px] w-[176px]">
          <img src={posCup} alt="" className="w-full" />
          {DOTS.map((x, i) => (
            <span
              key={x}
              aria-hidden
              className="absolute animate-pos-dot rounded-full"
              style={{
                left: `${x * 100}%`,
                top: `${DOT_Y * 100}%`,
                width: DOT_SIZE,
                height: DOT_SIZE,
                background: 'radial-gradient(circle at 35% 30%, #FFE08A, #FBB914 55%, #E39C08)',
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </div>
        <div
          className="mt-[42px] h-[5px] w-[519px] overflow-hidden rounded-full bg-gray-250"
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
        >
          <div className="h-full rounded-full bg-yellow-300" style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="mt-[13px] font-num text-[15px] font-medium text-gray-500" aria-live="off">
          {Math.round(progress * 100)}%
        </p>
        <ul className="mt-[33px] flex flex-col gap-[9px]" role="status">
          {L.items.map((it, i) => {
            const done = i < doneCount
            return (
              <li key={it.done} className="flex items-center gap-[10px] text-[15px]">
                {done ? (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500">
                    <Check size={11} strokeWidth={3} className="text-white" />
                  </span>
                ) : (
                  <span className="h-4 w-4 rounded-full border-[1.5px] border-yellow-500" />
                )}
                <span className={done ? 'text-gray-900' : 'text-gray-600'}>{done ? it.done : it.doing}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </Modal>
  )
}
