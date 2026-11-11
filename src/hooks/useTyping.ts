import { useEffect, useState } from 'react'

/** 글자를 하나씩 보여주는 타이핑 효과 — active가 되면 처음부터 시작, 끝나면 done */
export function useTyping(text: string, active: boolean, msPerChar = 18) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    setCount(0)
    const timer = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(timer)
          return c
        }
        return c + 2
      })
    }, msPerChar * 2)
    return () => clearInterval(timer)
  }, [text, active, msPerChar])
  const shown = Math.min(count, text.length)
  return { typed: text.slice(0, shown), done: active && shown >= text.length }
}
