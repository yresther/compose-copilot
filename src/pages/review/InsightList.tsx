import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AiSparkleIcon from '../../components/icons/AiSparkleIcon'
import { useToast } from '../../components/ui/Toast'
import data from '../../data/reviews.json'

type Insight = { text: string; link?: { label: string; to?: string; toast?: string } }

/** 지금 확인하면 좋아요 — 번호 + 인사이트 + 바로가기 */
export default function InsightList() {
  const navigate = useNavigate()
  const toast = useToast()
  return (
    <section className="mt-6 rounded-card border border-yellow-line bg-yellow-50 px-[27px] pb-[22px] pt-[14px]">
      <p className="flex items-center gap-[5px] text-[15px] font-medium text-yellow-700">
        <AiSparkleIcon size={15} />
        지금 확인하면 좋아요
      </p>
      <ol className="mt-[22px] flex flex-col gap-[21px]">
        {(data.insights as Insight[]).map((it, i) => (
          <li key={i} className="flex">
            <span className="mt-[1px] flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] bg-yellow-500 font-num text-[11px] font-semibold text-white">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="ml-[13px]">
              <p className="text-[15px] font-medium leading-6 text-gray-900">{it.text}</p>
              {it.link && (
                <button
                  type="button"
                  onClick={() => (it.link!.to ? navigate(it.link!.to) : toast.show(it.link!.toast ?? '준비중이에요'))}
                  className="ml-1 mt-px flex items-center gap-1 text-[15px] font-semibold text-yellow-700 hover:underline"
                >
                  {it.link.label}
                  <ChevronRight size={15} strokeWidth={2.25} />
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
