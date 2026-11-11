import type { CSSProperties } from 'react'
import characterImg from '../../assets/illust/character.png'
import Button from '../../components/ui/Button'
import data from '../../data/funding-policy.json'
import FundingCard, { type Program } from './FundingCard'

const programs = data.programs as Program[]

// 배경 카드: 결과 카드를 0.43배로 줄여 260px 간격으로 놓는다
const SLOT = 260
const SET = programs.length * SLOT // 한 바퀴 길이 (카드 4장)

/** 흐린 결과 카드 한 장 */
function PreviewCard({ program }: { program: Program }) {
  return (
    <div className="h-[110px] shrink-0" style={{ width: SLOT }}>
      <div className="w-[585px] origin-top-left scale-[0.43]">
        <div className="rounded-card shadow-float">
          <FundingCard program={program} />
        </div>
      </div>
    </div>
  )
}

/**
 * 한 줄 — 카드 묶음을 3번 이어 붙이고 한 바퀴(SET)만큼 천천히 이동 → 끝나면 처음과 같은 모습이라 끊김 없이 반복
 * start: 처음 보일 때 첫 카드의 왼쪽 위치 (캡처 배치) / direction: 흐르는 방향
 */
function MarqueeRow({ order, top, start, direction }: { order: Program[]; top: number; start: number; direction: 'left' | 'right' }) {
  // 카드 묶음이 SET마다 반복되므로 start-SET, start-2SET 위치는 같은 모습 → 둘 사이를 왕복 없이 한 방향으로만 이동
  const [from, to] = direction === 'left' ? [start - SET, start - SET * 2] : [start - SET * 2, start - SET]
  const style = {
    top,
    '--marquee-from': `${from}px`,
    '--marquee-to': `${to}px`,
  } as CSSProperties
  return (
    <div className="absolute left-0 flex animate-marquee motion-reduce:animate-none" style={style}>
      {[0, 1, 2].flatMap((k) => order.map((p) => <PreviewCard key={`${k}-${p.id}`} program={p} />))}
    </div>
  )
}

/** 1단계 — 지원금 찾기 소개 */
export default function PolicyIntro({ onStart }: { onStart: () => void }) {
  const [a, b, c, d] = programs
  return (
    <section className="relative mt-[25px] h-[448px] overflow-hidden rounded-card bg-white">
      <div className="relative z-10 pl-[50px] pt-[79px]">
        <p className="text-[16px] font-medium text-yellow-700">{data.intro.eyebrow}</p>
        <h2 className="mt-1.5 text-subhead text-gray-900">{data.intro.title}</h2>
        <p className="mt-[25px] text-[20px] text-gray-700">{data.intro.description}</p>
        <div className="mt-[11px] flex gap-4">
          {data.intro.tags.map((t) => (
            <span key={t} className="flex h-[29px] items-center rounded-full bg-gray-100 px-[18px] text-[14px] font-semibold text-gray-800">
              {t}
            </span>
          ))}
        </div>
        <Button className="mt-[78px] h-[47px] w-[233px] rounded-[10px] text-[16px] font-medium" onClick={onStart}>
          시작하기
        </Button>
      </div>

      {/* 오른쪽 배경 — 흐린 결과 카드 두 줄이 위는 왼쪽, 아래는 오른쪽으로 천천히 흐름, 왼쪽 끝은 글자와 겹치지 않게 서서히 사라짐 */}
      <div
        className="pointer-events-none absolute inset-y-0 left-[460px] right-0 opacity-30 [mask-image:linear-gradient(to_right,transparent,black_80px)]"
        aria-hidden
      >
        <MarqueeRow order={[a, b, c, d]} top={77} start={122} direction="left" />
        <MarqueeRow order={[c, d, a, b]} top={259} start={34} direction="right" />
      </div>

      <img src={characterImg} alt="" className="absolute bottom-[-6px] left-[828px] w-[300px]" />
    </section>
  )
}
