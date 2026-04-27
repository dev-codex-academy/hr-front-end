import { PAGE_SIZE } from '@/hooks/useTablePage'

function getPageNums(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total]
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '…', current - 1, current, current + 1, '…', total]
}

export function Pagination({ page, totalPages, totalRows, pageSize = PAGE_SIZE, onPageChange }) {
  if (totalPages <= 1) return null
  const nums = getPageNums(page, totalPages)
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalRows)

  return (
    <div className="pagination-bar">
      <span className="pagination-info">{from}–{to} of {totalRows}</span>
      <div className="pagination">
        <button
          className="pagination__btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >←</button>
        {nums.map((n, i) =>
          n === '…'
            ? <span key={`e${i}`} className="pagination__ellipsis">…</span>
            : <button
                key={n}
                className={`pagination__btn${n === page ? ' pagination__btn--active' : ''}`}
                onClick={() => onPageChange(n)}
              >{n}</button>
        )}
        <button
          className="pagination__btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >→</button>
      </div>
    </div>
  )
}
