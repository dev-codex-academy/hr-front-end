import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, Briefcase, Search } from 'lucide-react'
import Swal from 'sweetalert2'
import positionService from '@/services/positionService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { SpinnerOverlay } from '@/components/ui/spinner'
import FormModal from '@/components/common/FormModal'
import { useTablePage } from '@/hooks/useTablePage'
import { Pagination } from '@/components/ui/pagination'

export default function PositionsPage() {
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const { search, setSearch, filters, setFilter, page, setPage, paginate } = useTablePage()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await positionService.getAll()
      setPositions(res.data.results ?? res.data)
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filtered = useMemo(() => {
    let list = positions
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => p.title?.toLowerCase().includes(q))
    }
    if (filters.active === 'active') list = list.filter(p => p.is_active)
    if (filters.active === 'inactive') list = list.filter(p => !p.is_active)
    return list
  }, [positions, search, filters])

  const { rows, totalPages, totalRows } = paginate(filtered)

  const openNew = () => { setEditing(null); reset({}); setModalOpen(true) }
  const openEdit = (pos) => {
    setEditing(pos)
    reset({ title: pos.title, description: pos.description, is_active: pos.is_active })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const payload = { ...data, is_active: data.is_active === true || data.is_active === 'true' }
      if (editing) {
        await positionService.update(editing.id, payload)
      } else {
        await positionService.create(payload)
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Failed to save position.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#4E89BD' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (pos) => {
    const result = await Swal.fire({
      title: 'Delete position?',
      text: `"${pos.title}" will be permanently removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Delete',
    })
    if (result.isConfirmed) {
      try {
        await positionService.remove(pos.id)
        fetchData()
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete position.', confirmButtonColor: '#4E89BD' })
      }
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-header-icon icon-blue">
            <Briefcase strokeWidth={2} />
          </div>
          <div>
            <h2 className="page-title">Positions</h2>
            <p className="page-subtitle">{positions.length} record{positions.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Position
        </Button>
      </div>

      <div className="table-filters">
        <div className="table-filters__search">
          <Search size={15} className="table-filters__search-icon" />
          <input
            className="table-filters__search-input"
            placeholder="Search by title…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="table-filters__select"
          value={filters.active || ''}
          onChange={e => setFilter('active', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <SpinnerOverlay />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className="empty-state">
                        <Briefcase strokeWidth={1.5} />
                        <p className="empty-state-title">
                          {positions.length === 0 ? 'No positions defined' : 'No positions match your filter'}
                        </p>
                        <p className="empty-state-desc">
                          {positions.length === 0
                            ? 'Define positions and salary bands for your organization'
                            : 'Try adjusting your search or filter.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((pos) => (
                    <TableRow key={pos.id}>
                      <TableCell>{pos.title}</TableCell>
                      <TableCell>{pos.description || '—'}</TableCell>
                      <TableCell><StatusBadge status={pos.is_active ? 'active' : 'inactive'} /></TableCell>
                      <TableCell>
                        <div className="row-actions">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(pos)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(pos)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Pagination page={page} totalPages={totalPages} totalRows={totalRows} onPageChange={setPage} />

      <FormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? 'Edit Position' : 'New Position'}
        onSubmit={handleSubmit(onSubmit)}
        loading={saving}
      >
        <div className="form-group">
          <Label>Title *</Label>
          <Input {...register('title', { required: 'Required' })} placeholder="Software Engineer" />
          {errors.title && <p className="form-error">{errors.title.message}</p>}
        </div>
        <div className="form-group">
          <Label>Description</Label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Position description..."
            className="form-textarea"
          />
        </div>
        <div className="form-check">
          <input type="checkbox" id="is_active" {...register('is_active')} className="h-4 w-4" />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </FormModal>
    </div>
  )
}
