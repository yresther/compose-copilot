import type { ButtonHTMLAttributes } from 'react'

const VARIANTS = {
  dark: 'bg-brown-900 text-white hover:bg-brown-700 disabled:bg-gray-300 disabled:text-white',
  accent: 'bg-yellow-700 text-white hover:brightness-105',
  outline: 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-100',
  'outline-dark': 'border border-gray-500 text-white hover:bg-white/5', // 다크 배경 위 (미리보기)
  ghost: 'text-gray-600 hover:text-gray-900',
}

const SIZES = {
  sm: 'h-8 rounded-btn px-[14px] text-[13px] font-semibold gap-1.5', // 카드 안 (발주시스템으로 전송)
  md: 'h-11 rounded-input px-5 text-[16px] font-semibold gap-2',
  lg: 'h-12 rounded-input px-8 text-[17px] font-medium gap-2', // 모달 (전송하기)
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
}

export default function Button({ variant = 'dark', size = 'md', className = '', type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center whitespace-nowrap transition disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    />
  )
}
