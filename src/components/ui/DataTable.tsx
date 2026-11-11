import type { ReactNode } from 'react'

type Column<T> = { key: string; header: string; render: (row: T) => ReactNode }

type Props<T> = {
  columns: Column<T>[]
  rows: T[]
  /** 열 폭 (grid-template-columns) */
  template: string
  rowKey: (row: T) => string
}

/** 회색 머리행 + 구분선 표 (Top5, 채널별 객단가) */
export default function DataTable<T>({ columns, rows, template, rowKey }: Props<T>) {
  return (
    <div role="table" className="text-[14px]">
      <div role="row" className="grid h-[35px] items-center rounded-btn bg-gray-100 pl-[11px] font-semibold text-gray-900" style={{ gridTemplateColumns: template }}>
        {columns.map((c) => (
          <span key={c.key} role="columnheader">
            {c.header}
          </span>
        ))}
      </div>
      {rows.map((row) => (
        <div
          key={rowKey(row)}
          role="row"
          className="grid h-[38px] items-center border-b border-gray-200 pl-[11px] text-gray-800"
          style={{ gridTemplateColumns: template }}
        >
          {columns.map((c) => (
            <span key={c.key} role="cell">
              {c.render(row)}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
