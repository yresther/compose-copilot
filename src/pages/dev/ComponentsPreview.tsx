import { useState } from 'react'
import ActionCard, { type ActionCardData } from '../../components/ui/ActionCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import KpiCard, { type KpiCardData } from '../../components/ui/KpiCard'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import actionsData from '../../data/actions.json'
import kpiData from '../../data/kpi.json'

// 개발 모드 전용 공통 컴포넌트 확인 페이지 (배포 빌드에는 포함되지 않음)
const kpis = kpiData.today as KpiCardData[]
const actions = actionsData as ActionCardData[]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-heading text-gray-600">{title}</h2>
      {children}
    </section>
  )
}

export default function ComponentsPreview() {
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="px-page pb-32 pt-6">
      <h1 className="text-pagetitle">공통 컴포넌트</h1>

      <Section title="KPI 카드 (다크 배경 위)">
        <div className="grid grid-cols-[425fr_411fr_207fr_207fr] gap-4 rounded-card bg-brown-900 p-9">
          {kpis.map((k) => (
            <KpiCard key={k.title} {...k} />
          ))}
        </div>
      </Section>

      <Section title="액션 카드 (대시보드 홈)">
        <div className="grid grid-cols-3 items-start gap-4">
          {actions.map((a) => (
            <ActionCard key={a.id} data={a} onAction={(d) => toast.show(`${d.title}: ${d.cta}`)} />
          ))}
        </div>
      </Section>

      <Section title="배지">
        <div className="flex flex-wrap items-center gap-3 rounded-card bg-white p-6">
          <Badge tone="danger">소진임박</Badge>
          <Badge tone="neutral">미확인 리뷰 2건</Badge>
          <Badge tone="danger" size="sm">소진임박</Badge>
          <Badge tone="warning" size="sm">주의</Badge>
          <Badge tone="success" size="sm">여유</Badge>
          <Badge tone="success" size="sm">정상소진</Badge>
          <Badge tone="danger" size="sm">재고부족</Badge>
        </div>
      </Section>

      <Section title="버튼 · 모달 · 토스트">
        <div className="flex flex-wrap items-center gap-3 rounded-card bg-white p-6">
          <Button onClick={() => setModalOpen(true)}>모달 열기</Button>
          <Button variant="accent" onClick={() => toast.show('리포트를 전송했어요')}>
            토스트 띄우기
          </Button>
          <Button variant="outline">테두리 버튼</Button>
          <Button size="lg" disabled>
            비활성
          </Button>
          <div className="rounded-input bg-brown-900 p-3">
            <Button variant="outline-dark">미리보기</Button>
          </div>
        </div>
      </Section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="px-12 pb-10 pt-14">
          <h2 className="text-[28px] font-bold">모달 제목</h2>
          <p className="mt-3 text-[18px] text-gray-600">공통 모달 레이아웃 확인용 예시예요.</p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Button size="lg" className="w-[244px]" onClick={() => setModalOpen(false)}>
              확인
            </Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              닫기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
