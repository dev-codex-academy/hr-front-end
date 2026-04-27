import { useState, useEffect } from 'react'

export const PAGE_SIZE = 15

export function useTablePage(pageSize = PAGE_SIZE) {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})
  const [page, setPage] = useState(1)

  useEffect(() => { setPage(1) }, [search, filters])

  function setFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  function paginate(filtered) {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const safePage = Math.min(page, totalPages)
    return {
      rows: filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
      totalPages,
      totalRows: filtered.length,
    }
  }

  return { search, setSearch, filters, setFilter, page, setPage, paginate }
}
