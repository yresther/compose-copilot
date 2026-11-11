import { Package } from 'lucide-react'
import { PRODUCT_IMAGES } from '../../lib/products'

// 칸 크기 대비 사진 높이 — 긴급 배너(69px 칸에 팥 39px)·할 일 카드(54px 칸에 시럽 45px)와 같은 비율
const IMAGE_RATIO: Record<string, number> = { 'vanilla-syrup': 45 / 54, 'red-bean': 39 / 69 }

/** 품목 사진 칸 — 긴급 발주 배너와 같은 회색 둥근 사각형(69×69, 곡률 25) 위에 사진, 사진이 없으면 상자 아이콘 */
export default function ProductThumb({ id, size = 69 }: { id: string; size?: number }) {
  const src = PRODUCT_IMAGES[id]
  return (
    <span
      style={{ width: size, height: size, borderRadius: (size * 25) / 69 }}
      className="flex shrink-0 items-center justify-center overflow-hidden bg-gray-100"
    >
      {src ? (
        <img src={src} alt="" style={{ height: size * (IMAGE_RATIO[id] ?? 0.6) }} className="w-auto" />
      ) : (
        <Package size={size * 0.4} strokeWidth={1.5} className="text-gray-400" />
      )}
    </span>
  )
}
