import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, Users, Search } from 'lucide-react'
import Swal from 'sweetalert2'
import employeeService from '@/services/employeeService'
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

const STATUS_OPTIONS = ['active', 'inactive', 'terminated']
const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contractor', 'intern']

const label = (s) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
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
      const [empRes, posRes] = await Promise.all([employeeService.getAll(), positionService.getAll()])
      setEmployees(empRes.data.results ?? empRes.data)
      setPositions(posRes.data.results ?? posRes.data)
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filtered = useMemo(() => {
    let list = employees
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(e =>
        (e.full_name || `${e.first_name} ${e.last_name}`).toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.employee_code?.toLowerCase().includes(q)
      )
    }
    if (filters.status) list = list.filter(e => e.status === filters.status)
    if (filters.employment_type) list = list.filter(e => e.employment_type === filters.employment_type)
    return list
  }, [employees, search, filters])

  const { rows, totalPages, totalRows } = paginate(filtered)

  const openNew = () => { setEditing(null); reset({}); setModalOpen(true) }
  const openEdit = (emp) => {
    setEditing(emp)
    reset({
      employee_code: emp.employee_code,
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      phone: emp.phone,
      position: emp.position,
      status: emp.status,
      employment_type: emp.employment_type,
      hire_date: emp.hire_date,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (editing) {
        await employeeService.update(editing.id, data)
      } else {
        await employeeService.create(data)
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Failed to save employee.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#4E89BD' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (emp) => {
    const result = await Swal.fire({
      title: 'Delete employee?',
      text: `${emp.full_name || emp.email} will be permanently removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Delete',
    })
    if (result.isConfirmed) {
      try {
        await employeeService.remove(emp.id)
        fetchData()
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete employee.', confirmButtonColor: '#4E89BD' })
      }
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-header-icon icon-blue">
            <Users strokeWidth={2} />
          </div>
          <div>
            <h2 className="page-title">Employees</h2>
            <p className="page-subtitle">{employees.length} record{employees.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Employee
        </Button>
      </div>

      <div className="table-filters">
        <div className="table-filters__search">
          <Search size={15} className="table-filters__search-icon" />
          <input
            className="table-filters__search-input"
            placeholder="Search by name, email, or code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="table-filters__select"
          value={filters.status || ''}
          onChange={e => setFilter('status', e.target.value)}
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        <select
          className="table-filters__select"
          value={filters.employment_type || ''}
          onChange={e => setFilter('employment_type', e.target.value)}
        >
          <option value="">All Types</option>
          {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{label(t)}</option>)}
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
                  <TableHead>Code</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <div className="empty-state">
                        <Users strokeWidth={1.5} />
                        <p className="empty-state-title">
                          {employees.length === 0 ? 'No employees yet' : 'No employees match your filter'}
                        </p>
                        <p className="empty-state-desc">
                          {employees.length === 0
                            ? 'Add your first employee to get started'
                            : 'Try adjusting your search or filter.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>{emp.employee_code || '—'}</TableCell>
                      <TableCell>{emp.full_name || `${emp.first_name} ${emp.last_name}`}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.position_title || '—'}</TableCell>
                      <TableCell><StatusBadge status={emp.status} /></TableCell>
                      <TableCell>{emp.employment_type ? label(emp.employment_type) : '—'}</TableCell>
                      <TableCell>{emp.hire_date || '—'}</TableCell>
                      <TableCell>
                        <div className="row-actions">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(emp)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(emp)}>
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
        title={editing ? 'Edit Employee' : 'New Employee'}
        onSubmit={handleSubmit(onSubmit)}
        loading={saving}
      >
        <div className="form-grid-2">
          <div className="form-group">
            <Label>First Name *</Label>
            <Input {...register('first_name', { required: 'Required' })} placeholder="Jane" />
            {errors.first_name && <p className="form-error">{errors.first_name.message}</p>}
          </div>
          <div className="form-group">
            <Label>Last Name *</Label>
            <Input {...register('last_name', { required: 'Required' })} placeholder="Doe" />
            {errors.last_name && <p className="form-error">{errors.last_name.message}</p>}
          </div>
        </div>
        <div className="form-group">
          <Label>Email *</Label>
          <Input type="email" {...register('email', { required: 'Required' })} placeholder="jane.doe@company.com" />
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <Label>Phone</Label>
            <Input {...register('phone')} placeholder="+1 555 000 0000" />
          </div>
          <div className="form-group">
            <Label>Employee Code</Label>
            <Input {...register('employee_code')} placeholder="EMP-001" />
          </div>
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <Label>Status</Label>
            <select {...register('status')} className="form-select">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{label(s)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <Label>Employment Type</Label>
            <select {...register('employment_type')} className="form-select">
              {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{label(t)}</option>)}
            </select>
          </div>
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <Label>Position</Label>
            <select {...register('position')} className="form-select">
              <option value="">— None —</option>
              {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <div className="form-group">
            <Label>Hire Date</Label>
            <Input type="date" {...register('hire_date')} />
          </div>
        </div>
      </FormModal>
    </div>
  )
}
