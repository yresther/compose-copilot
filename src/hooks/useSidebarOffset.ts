import { useLayoutEffect, useState } from 'react'

/** 열린 사이드바 폭 (홈처럼 본문 위에 겹치는 사이드바는 0) — 모달·바텀시트를 사이드바를 뺀 본문 영역 가운데에 놓을 때 사용 (캡처 기준) */
export function useSidebarOffset(active: boolean) {
  const [offset, setOffset] = useState(0)
  useLayoutEffect(() => {
    if (active) setOffset(document.querySelector('aside[data-flow]')?.getBoundingClientRect().width ?? 0)
  }, [active])
  return offset
}
