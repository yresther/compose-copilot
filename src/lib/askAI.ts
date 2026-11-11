// AI에게 추가질문하기 — 백엔드 없이 앱의 데모 데이터(사장님이 고친 값 포함)를 보고 답한다
// 질문 속 낱말로 주제를 고른 뒤, 그 주제의 현재 수치로 쉬운 문장을 만든다

export type AiLink = { label: string; to: string }
export type AiAnswer = { text: string; links?: AiLink[]; suggestions?: string[] }

export type AiSnapshot = {
  owner: string
  sales: {
    total: string
    count: string
    delta: string
    delivery: string
    deliveryCount: string
    deliveryDelta: string
    aov: string
    aovDelta: string
  }
  peak: { time: string; note: string }
  channels: { name: string; count: number; revenue: number }[]
  menus: { name: string; qty: number; revenue: number }[]
  stock: { name: string; days: number; status: string; incoming?: string }[]
  order: { submittedAt: string | null; items: { name: string; qty: number; unit: string; price: number }[] }
  todos: string[]
  expense: {
    monthLabel: string
    total: number
    sales: number
    diff: number
    items: { name: string; amount: number; share: number }[]
    fixed: { name: string; amount: number; dueText: string; payDay: number }[]
    labor: { amount: number; rate: number; saving: number; quiet: [number, number]; warn: boolean }
  }
  reviews: { avg: number; total: number; positivePct: number; openNegatives: { channel: string; text: string }[] }
  funding: { name: string; limit: string; rate: string; deadlineDays: number | null; instant: boolean }[]
  unreadAlerts: number
}

const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`
const manwon = (n: number) => `${Math.round(Math.abs(n) / 10000).toLocaleString('ko-KR')}만원`

export const STARTER_QUESTIONS = ['오늘 매출 어때?', '지금 부족한 재고 있어?', '이번 달 지출 얼마야?', '받을 수 있는 정책자금 알려줘']

type Intent = { key: string; words: string[] }
// 위에 있을수록 우선 — 구체적인 주제(인건비·배달·순이익)를 넓은 주제(지출·매출)보다 먼저
const INTENTS: Intent[] = [
  { key: 'thanks', words: ['고마', '감사', '땡큐', '최고'] },
  { key: 'labor', words: ['인건비', '알바', '아르바이트', '직원', '시급', '인력', '근무'] },
  { key: 'profit', words: ['순이익', '이익', '남는', '남아', '남을', '수익', '마진', '흑자', '적자'] },
  { key: 'fixed', words: ['고정', '임대료', '월세', '대출이자', '이자', '로열티', '통신비', '납부'] },
  { key: 'expense', words: ['지출', '비용', '나가는', '나간', '쓴돈', '썼', '돈이', '재료비', '발주비'] },
  { key: 'peak', words: ['피크', '바쁜', '바빠', '몰리', '몰려', '붐비', '혼잡', '손님많', '시간대'] },
  { key: 'delivery', words: ['배달', '배민', '쿠팡', '포장주문'] },
  { key: 'aov', words: ['객단가', '평균결제', '1인당', '한명당', '한사람'] },
  { key: 'menu', words: ['메뉴', '잘팔', '잘나가', '인기', '베스트', '많이팔', '1위', '음료'] },
  { key: 'review', words: ['리뷰', '평점', '별점', '후기', '답글', '불만'] },
  { key: 'stock', words: ['재고', '소진', '떨어', '부족', '모자', '남은', '품절'] },
  { key: 'order', words: ['발주', '주문해야', '시켜야', '사야', '추천수량', '입고'] },
  { key: 'funding', words: ['정책자금', '지원금', '자금', '보조금', '대출', '융자', '지원사업'] },
  { key: 'todo', words: ['할일', '해야', '액션', '뭐부터', '우선', '급한', '챙길', '놓친'] },
  { key: 'alert', words: ['알림'] },
  { key: 'sales', words: ['매출', '팔았', '판매', '벌었', '벌어', '장사', '수입', '얼마나팔', '손님'] },
  { key: 'greet', words: ['안녕', '하이', 'hello', 'hi', '반가'] },
  { key: 'help', words: ['뭘물어', '뭐물어', '뭐할수', '뭘할수', '도움', '기능', '할수있', '사용법'] },
]

function detect(question: string): string | null {
  const q = question.replace(/\s+/g, '').toLowerCase()
  let best: { key: string; score: number } | null = null
  for (const it of INTENTS) {
    const score = it.words.filter((w) => q.includes(w)).length
    if (score > 0 && (!best || score > best.score)) best = { key: it.key, score }
  }
  return best?.key ?? null
}

const SUGGEST: Record<string, string[]> = {
  sales: ['피크타임은 언제야?', '제일 잘 팔리는 메뉴는?'],
  peak: ['오늘 매출 어때?', '인건비 줄일 방법 있어?'],
  delivery: ['리뷰 평점은 어때?', '오늘 매출 어때?'],
  aov: ['제일 잘 팔리는 메뉴는?', '오늘 매출 어때?'],
  menu: ['피크타임은 언제야?', '지금 부족한 재고 있어?'],
  stock: ['오늘 발주는 뭐 해야 해?', '오늘 해야 할 일 알려줘'],
  order: ['지금 부족한 재고 있어?', '이번 달 지출 얼마야?'],
  expense: ['이번 달 얼마 남아?', '인건비 줄일 방법 있어?'],
  fixed: ['이번 달 지출 얼마야?', '이번 달 얼마 남아?'],
  labor: ['피크타임은 언제야?', '이번 달 지출 얼마야?'],
  profit: ['이번 달 지출 얼마야?', '받을 수 있는 정책자금 알려줘'],
  review: ['오늘 해야 할 일 알려줘', '배달 매출은 어때?'],
  funding: ['이번 달 얼마 남아?', '오늘 해야 할 일 알려줘'],
  todo: ['지금 부족한 재고 있어?', '리뷰 평점은 어때?'],
}

export function askAI(question: string, s: AiSnapshot): AiAnswer {
  const key = detect(question)
  const e = s.expense
  const top = [...e.items].sort((a, b) => b.amount - a.amount)
  const withSuggest = (a: AiAnswer): AiAnswer => ({ ...a, suggestions: a.suggestions ?? (key ? SUGGEST[key] : undefined) })

  switch (key) {
    case 'greet':
      return {
        text: `안녕하세요 ${s.owner} 사장님! 매출·재고·지출·리뷰·정책자금처럼 매장 운영에 궁금한 걸 편하게 물어보세요.`,
        suggestions: STARTER_QUESTIONS,
      }
    case 'help':
      return {
        text: '지금 매장 데이터를 보고 답해드려요. 이런 걸 물어볼 수 있어요.\n· 오늘 매출, 피크타임, 잘 팔리는 메뉴\n· 부족한 재고와 오늘 발주\n· 이번 달 지출, 인건비, 남는 돈\n· 리뷰 평점과 답글이 필요한 리뷰\n· 받을 수 있는 정책자금',
        suggestions: STARTER_QUESTIONS,
      }
    case 'thanks':
      return { text: '도움이 됐다니 다행이에요! 또 궁금한 게 생기면 언제든 물어보세요 😊', suggestions: STARTER_QUESTIONS }

    case 'sales':
      return withSuggest({
        text: `오늘 지금까지 매출은 ${s.sales.total}(${s.sales.count})이에요. ${s.sales.delta}로 순조로워요.\n· 배달 ${s.sales.delivery} (${s.sales.deliveryCount})\n· 객단가 ${s.sales.aov}\n· 피크타임 ${s.peak.time}`,
        links: [{ label: '매출 리포트 보기', to: '/sales/report' }],
      })
    case 'delivery': {
      const d = s.channels.find((c) => c.name === '배달')
      return withSuggest({
        text: `오늘 배달 매출은 ${s.sales.delivery}(${s.sales.deliveryCount})이에요. ${s.sales.deliveryDelta}로 조금 줄었어요.${
          d ? `\n전체 주문 중 배달은 ${Math.round((d.count / s.channels.reduce((a, c) => a + c.count, 0)) * 100)}%예요.` : ''
        }${s.reviews.openNegatives.length ? `\n배달 리뷰 중 답글이 필요한 부정리뷰가 ${s.reviews.openNegatives.length}건 있어요.` : ''}`,
        links: [{ label: '매출 리포트 보기', to: '/sales/report' }],
      })
    }
    case 'aov':
      return withSuggest({
        text: `오늘 객단가(한 번 결제할 때 평균 금액)는 ${s.sales.aov}이에요. ${s.sales.aovDelta}예요.\n바닐라라떼처럼 값이 조금 더 나가는 음료가 잘 팔리면 객단가가 올라가요.`,
        links: [{ label: '매출 리포트 보기', to: '/sales/report' }],
      })
    case 'peak':
      return withSuggest({
        text: `손님이 가장 몰리는 시간은 ${s.peak.time}이에요 (${s.peak.note}).\n이 시간 전에 얼음·컵·시럽을 미리 채워두고, 계산대와 제조를 나눠 맡으면 대기시간을 줄일 수 있어요.`,
        links: [{ label: '매출 패턴 분석 보기', to: '/sales/pattern' }],
      })
    case 'menu': {
      const [a, b, c] = s.menus
      return withSuggest({
        text: `오늘 가장 많이 팔린 메뉴는 ${a.name}(${a.qty}잔)이에요.\n· 2위 ${b.name} ${b.qty}잔\n· 3위 ${c.name} ${c.qty}잔\n매출 기준으로도 ${a.name}가 ${won(a.revenue)}으로 1위예요.`,
        links: [{ label: '매출 리포트 보기', to: '/sales/report' }],
      })
    }

    case 'stock': {
      const danger = s.stock.filter((r) => r.status === 'danger')
      const warn = s.stock.filter((r) => r.status === 'warn')
      const incoming = s.stock.filter((r) => r.incoming)
      if (!danger.length && !warn.length)
        return withSuggest({
          text: '지금은 부족한 재고가 없어요. 모든 품목이 일주일 넘게 버틸 수 있어요 👍',
          links: [{ label: '재고현황 보기', to: '/inventory' }],
        })
      const list = (rows: typeof danger) => rows.map((r) => `${r.name}(${r.days}일)`).join(', ')
      return withSuggest({
        text: `${danger.length ? `곧 떨어지는 품목이 ${danger.length}개 있어요: ${list(danger)}.` : ''}${
          warn.length ? `\n조금 여유 있지만 챙겨야 할 품목 ${warn.length}개: ${list(warn.slice(0, 4))}${warn.length > 4 ? ' 등' : ''}.` : ''
        }${incoming.length ? `\n입고 예정: ${incoming.map((r) => `${r.name} ${r.incoming}`).join(', ')}.` : ''}`.trim(),
        links: [{ label: '재고현황 보기', to: '/inventory' }, ...(danger[0] ? [{ label: '발주하러 가기', to: '/order' }] : [])],
      })
    }
    case 'order': {
      const total = s.order.items.reduce((a, i) => a + i.qty * i.price, 0)
      if (s.order.submittedAt)
        return withSuggest({
          text: `오늘 발주는 ${s.order.submittedAt}에 이미 전송했어요. ${s.order.items.length}개 품목, 약 ${won(total)}이에요. 입고되면 재고현황에 바로 반영돼요.`,
          links: [{ label: '발주관리 보기', to: '/order' }],
        })
      return withSuggest({
        text: `오늘 발주할 품목은 ${s.order.items.length}개예요 (예상 ${won(total)}).\n${s.order.items
          .slice(0, 4)
          .map((i) => `· ${i.name} ${i.qty}${i.unit}`)
          .join(
            '\n',
          )}${s.order.items.length > 4 ? `\n· 외 ${s.order.items.length - 4}개` : ''}\n수량을 확인하고 발주 시스템으로 전송하면 끝나요.`,
        links: [{ label: '발주하러 가기', to: '/order' }],
      })
    }

    case 'expense':
      return withSuggest({
        text: `${e.monthLabel} 예상지출은 ${won(e.total)}이에요. 지난달보다 ${manwon(e.diff)} ${e.diff >= 0 ? '더' : '덜'} 쓰는 중이에요.\n${top
          .slice(0, 3)
          .map((i) => `· ${i.name} ${won(i.amount)} (${i.share}%)`)
          .join('\n')}`,
        links: [{ label: '지출관리 보기', to: '/funding/expense' }],
      })
    case 'fixed': {
      const sum = e.fixed.reduce((a, f) => a + f.amount, 0)
      // 특정 항목(임대료·대출이자 등)을 물었으면 그 항목부터 답함
      const q = question.replace(/\s+/g, '')
      const asked = e.fixed.find((f) => q.includes(f.name.replace(/\s+/g, '')) || (f.name === '임대료' && q.includes('월세')))
      const lead = asked
        ? `${asked.name} ${won(asked.amount)}은 매달 ${asked.payDay >= 31 ? '말일' : `${asked.payDay}일`}에 나가요. 다음 납부는 ${asked.dueText === '오늘' ? '오늘이에요' : `${asked.dueText}예요`}.\n\n`
        : ''
      return withSuggest({
        text: `${lead}매달 나가는 고정지출은 모두 ${won(sum)}이에요.\n${e.fixed.map((f) => `· ${f.name} ${won(f.amount)} — 매달 ${f.payDay >= 31 ? '말일' : `${f.payDay}일`} (${f.dueText})`).join('\n')}`,
        links: [{ label: '지출관리 보기', to: '/funding/expense' }],
      })
    }
    case 'labor':
      return withSuggest({
        text: `${e.monthLabel} 인건비는 ${won(e.labor.amount)}으로 매출의 ${e.labor.rate}%예요${e.labor.warn ? '. 보통보다 조금 높은 편이에요' : ''}.\n한산한 시간(${e.labor.quiet[0]}~${e.labor.quiet[1]}시)에 혼자 운영하면 한 달에 약 ${manwon(e.labor.saving)}을 아낄 수 있어요.`,
        links: [{ label: '지출관리 보기', to: '/funding/expense' }],
      })
    case 'profit': {
      const left = e.sales - e.total
      return withSuggest({
        text: `${e.monthLabel} 예상 매출 ${won(e.sales)}에서 예상지출 ${won(e.total)}을 빼면 약 ${won(left)}이 남아요 (매출의 ${Math.round((left / e.sales) * 100)}%).\n세금·카드 수수료는 빠지지 않은 금액이에요.`,
        links: [{ label: '지출관리 보기', to: '/funding/expense' }],
      })
    }

    case 'review': {
      const open = s.reviews.openNegatives
      return withSuggest({
        text: `최근 리뷰 ${s.reviews.total}개의 평균 평점은 ${s.reviews.avg.toFixed(1)}점이고, ${s.reviews.positivePct}%가 긍정 리뷰예요.\n${
          open.length
            ? `답글이 필요한 부정리뷰가 ${open.length}건 있어요 (${open.map((r) => r.channel).join(', ')}). AI 답글 초안을 준비해뒀어요.`
            : '부정리뷰에는 모두 답글을 달았어요 👍'
        }`,
        links: [{ label: open.length ? '답글 달러 가기' : '리뷰 분석 보기', to: open.length ? '/review?review=c1' : '/review' }],
      })
    }
    case 'funding': {
      const soon = s.funding.filter((f) => f.deadlineDays !== null).sort((a, b) => a.deadlineDays! - b.deadlineDays!)[0]
      const instant = s.funding.filter((f) => f.instant)
      return withSuggest({
        text: `지금 조건으로 받을 수 있는 정책자금은 ${s.funding.length}개예요.\n${s.funding.map((f) => `· ${f.name} ${f.limit}, ${f.rate}`).join('\n')}\n바로 신청할 수 있는 건 ${instant.length}개${soon ? `, 가장 급한 건 ${soon.name}(마감 D-${soon.deadlineDays})` : ''}이에요.`,
        links: [{ label: '정책자금 보기', to: '/funding/policy' }],
      })
    }
    case 'todo': {
      if (!s.todos.length)
        return withSuggest({
          text: '오늘 해야 할 일은 모두 끝냈어요! 수고 많으셨어요 👏',
          links: [{ label: '오늘의 할 일 보기', to: '/dashboard/action' }],
        })
      return withSuggest({
        text: `오늘 챙길 일이 ${s.todos.length}개 있어요.\n${s.todos.map((t, i) => `${i + 1}. ${t}`).join('\n')}`,
        links: [{ label: '오늘의 할 일 보기', to: '/dashboard/action' }],
      })
    }
    case 'alert':
      return withSuggest({
        text: s.unreadAlerts ? `확인하지 않은 알림이 ${s.unreadAlerts}건 있어요.` : '새로 온 알림은 없어요.',
        links: [{ label: '알림 보기', to: '/dashboard/notifications' }],
        suggestions: ['오늘 해야 할 일 알려줘', '지금 부족한 재고 있어?'],
      })
  }
  return {
    text: '아직 그 질문에는 정확히 답하기 어려워요 😥\n매출·재고·발주·지출·리뷰·정책자금에 대해 물어보시면 지금 매장 데이터로 바로 알려드릴게요.',
    suggestions: STARTER_QUESTIONS,
  }
}
