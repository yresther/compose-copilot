import { useEffect, useState } from 'react'
import coinImg from '../../assets/illust/coin.png'
import Modal from '../../components/ui/Modal'
import data from '../../data/funding-policy.json'

const DURATION = 3000
const SIZE = 264
const STROKE = 10
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R

// 이미지 속 코인 덩어리의 가운데 (투명 여백 제외, 300px 원본 기준) → 원 중앙에 맞춤
const COIN_W = 130
const CONTENT_OFFSET = { x: ((150 - 162.5) * COIN_W) / 300, y: ((150 - 159.5) * COIN_W) / 300 }

/** 로딩 모달 — 원형 진행(0→100%, 약 3초)과 단계 문구 1/3 → 2/3 → 3/3, 끝나면 onDone */
export default function PolicyLoading({ open, onDone }: { open: boolean; onDone: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!open) return
    setProgress(0)
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION)
      setProgress(p)
      if (p < 1) raf = requestAnimationFrame(tick)
      else setTimeout(onDone, 250)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [open, onDone])

  const steps = data.loadingSteps
  const step = Math.min(steps.length - 1, Math.floor(progress * steps.length))

  return (
    <Modal open={open} dismissible={false}>
      <div className="flex flex-col items-center pb-[58px] pt-[58px]">
        <h2 className="text-subhead text-gray-900">맞춤 지원금 찾는 중...</h2>
        <p className="mt-3 text-[16px] font-medium text-gray-700">잠시만 기다려주세요!</p>

        <div className="relative mt-[29px]" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE} className="-rotate-90" aria-hidden>
            <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#EBEBEB" strokeWidth={STROKE} />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="#FFD21F"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
            />
          </svg>
          <img
            src={coinImg}
            alt=""
            className="absolute left-1/2 top-1/2"
            style={{ width: COIN_W, transform: `translate(-50%, -50%) translate(${CONTENT_OFFSET.x}px, ${CONTENT_OFFSET.y}px)` }}
          />
        </div>

        <p className="mt-[29px] text-[14px] text-gray-600" role="status">
          {steps[step]}({step + 1}/{steps.length})
        </p>
      </div>
    </Modal>
  )
}
