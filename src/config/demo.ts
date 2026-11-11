// 데모 동작 설정 — 값만 바꿔서 화면 동작을 비교해볼 수 있다

/**
 * 액션 제안 페이지에서 '완료된 카드' 오른쪽 완료하기 칸을 어떻게 보여줄지
 * - 'hide': 칸을 숨김 (자리는 유지해 카드 폭이 바뀌지 않음)
 * - 'disabled': 칸은 보이되 누를 수 없음
 * - 'undo': '완료 취소' 버튼으로 바뀌어 다시 미완료로 되돌릴 수 있음
 */
export const COMPLETED_SIDE_BUTTON: 'hide' | 'disabled' | 'undo' = 'undo'
