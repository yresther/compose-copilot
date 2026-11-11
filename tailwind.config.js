/** @type {import('tailwindcss').Config} */

// 디자인 토큰 — design/tokens 캡처 + 화면 캡처에서 추출한 값
const text = (size, weight) => [size, { lineHeight: '1.4', letterSpacing: '-0.03em', fontWeight: weight }]

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',
      brown: {
        600: '#3B3835', // 마감 리포트 배너
        700: '#383433', // 다크 영역 위 카드 (피크타임)
        800: '#2F2725',
        900: '#25221E', // 사이드바·다크 헤더·검정 버튼
      },
      yellow: {
        50: '#FFFBEC', // Tip 배경, 선택된 카드
        line: '#FCF1C6', // Tip 테두리
        100: '#FFE590',
        300: '#FFD21F', // 채움 (활성 탭, AI 버튼, 막대)
        500: '#F9B418', // 체크박스, 선택 테두리
        700: '#F49F04', // 강조 글자, 주황 버튼
      },
      gray: {
        100: '#FAFAFA',
        200: '#F5F5F5', // 페이지 배경
        250: '#EAEAEA', // 액션 제안 완료하기 칸
        300: '#E0E0E0',
        400: '#BDBDBD',
        500: '#9E9E9E',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
      },
      // 상태 (semantic)
      danger: { DEFAULT: '#F43A2D', bg: '#FFE2E6' }, // 소진임박·재고부족·마감
      success: { DEFAULT: '#2EA473', bg: '#DCF4EA', soft: '#D1E9DF' }, // 여유·정상·증가
      warning: { DEFAULT: '#F49F04', bg: '#FFF6D3' }, // 주의·긴급
      down: '#EB7E7E', // 감소 표시
      info: '#6D99FF', // 패턴 분석 증가 수치
      positive: '#82D5AA', // 긍정 리뷰 막대
      // 지출관리 항목 색 (막대·왼쪽 색상바 / 막대 위 글자)
      expense: {
        material: { DEFAULT: '#FCEFCD', text: '#A78733' },
        labor: { DEFAULT: '#AAE8FF', text: '#3D788E' },
        rent: { DEFAULT: '#FFBEE9', text: '#B54E92' },
        royalty: { DEFAULT: '#DADADA', text: '#8F8F8F' },
        loan: { DEFAULT: '#ACF0A2', text: '#4E8F45' },
        repair: { DEFAULT: '#D2CDFF', text: '#6B62B8' },
        telecom: { DEFAULT: '#FFD6B9', text: '#B86E3A' },
      },
      negative: '#FCB8B8', // 부정 리뷰 막대
    },
    extend: {
      fontFamily: {
        sans: ['"Pretendard Variable"', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        num: ['"SUIT Variable"', 'SUIT', '"Pretendard Variable"', 'Pretendard', 'sans-serif'],
      },
      fontSize: {
        headline: text('30px', '700'),
        subhead: text('25px', '700'),
        pagetitle: text('20px', '700'),
        heading: text('16px', '600'),
        body1: text('14px', '600'),
        body2: text('14px', '500'),
        body3: text('13px', '400'),
        caption: text('13px', '600'),
        placeholder: text('14px', '400'),
        display: ['32px', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '700' }], // KPI 큰 숫자
      },
      borderRadius: {
        btn: '6px',
        input: '8px',
        card: '12px',
        modal: '20px',
      },
      spacing: {
        sidebar: '180px',
        rail: '60px',
        page: '36px',
        topbar: '80px',
      },
      boxShadow: {
        float: '0 4px 16px rgba(0, 0, 0, 0.08)',
        modal: '0 12px 40px rgba(0, 0, 0, 0.12)',
        side: '6px 0 24px rgba(0, 0, 0, 0.32)', // 홈 사이드바 — 다크 히어로와 분리
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'pop-in': { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'toast-in': { from: { opacity: '0', transform: 'translate(-50%, 12px)' }, to: { opacity: '1', transform: 'translate(-50%, 0)' } },
        'sheet-in': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        // 시작·끝 위치는 사용하는 곳에서 --marquee-from / --marquee-to 로 지정
        marquee: { from: { transform: 'translateX(var(--marquee-from))' }, to: { transform: 'translateX(var(--marquee-to))' } },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'pop-in': 'pop-in 180ms ease-out',
        'toast-in': 'toast-in 200ms ease-out',
        'sheet-in': 'sheet-in 260ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        marquee: 'marquee 40s linear infinite',
      },
    },
  },
  plugins: [],
}
