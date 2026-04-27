import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, Video, Search } from 'lucide-react'
import Swal from 'sweetalert2'
import interviewService from '@/services/interviewService'
import jobApplicationService from '@/services/jobApplicationService'
import employeeService from '@/services/employeeService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { SpinnerOverlay } from '@/components/ui/spinner'
import FormModal from '@/components/common/FormModal'
import { useTablePage } from '@/hooks/useTablePage'
import { Pagination } from '@/components/ui/pagination'

const INTERVIEW_TYPES = ['phone_screen', 'video', 'technical', 'panel', 'on_site', 'final']
const OUTCOMES = ['pending', 'passed', 'failed', 'no_show', 'rescheduled']

const OUTCOME_COLORS = {
  pending: 'pending',
  passed: 'approved',
  failed: 'rejected',
  no_show: 'danger',
  rescheduled: 'warning',
}

const label = (s) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const formatDateTime = (dt) => {
  if (!dt) return '—'
  return new Date(dt).toLocaleString()
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([])
  const [applications, setApplications] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const { search, setSearch, filters, setFilter, page, setPage, paginate } = useTablePage()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [intRes, appRes, empRes] = await Promise.all([
        interviewService.getAll(),
        jobApplicationService.getAll(),
        employeeService.getAll(),
      ])
      setInterviews(intRes.data.results ?? intRes.data)
      setApplications(appRes.data.results ?? appRes.data)
      setEmployees(empRes.data.results ?? empRes.data)
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filtered = useMemo(() => {
    let list = interviews
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.applicant_name?.toLowerCase().includes(q) ||
        i.job_title?.toLowerCase().includes(q)
      )
    }
    if (filters.interview_type) list = list.filter(i => i.interview_type === filters.interview_type)
    if (filters.outcome) list = list.filter(i => i.outcome === filters.outcome)
    return list
  }, [interviews, search, filters])

  const { rows, totalPages, totalRows } = paginate(filtered)

  const openNew = () => { setEditing(null); reset({}); setModalOpen(true) }
  const openEdit = (item) => {
    setEditing(item)
    reset({
      application: item.application,
      interview_type: item.interview_type,
      scheduled_at: item.scheduled_at ? item.scheduled_at.slice(0, 16) : '',
      interviewer: item.interviewer,
      outcome: item.outcome,
      comments: item.comments,
      results: item.results,
    })
    setModalOpen(true)
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      if (editing) {
        await interviewService.update(editing.id, data)
      } else {
        await interviewService.create(data)
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(' ')
        : 'Failed to save interview.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#4E89BD' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: 'Delete interview?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Delete',
    })
    if (result.isConfirmed) {
      try {
        await interviewService.remove(item.id)
        fetchData()
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Could not delete interview.', confirmButtonColor: '#4E89BD' })
      }
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-header-icon icon-rose">
            <Video strokeWidth={2} />
          </div>
          <div>
            <h2 className="page-title">Interviews</h2>
            <p className="page-subtitle">{interviews.length} record{interviews.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Interview
        </Button>
      </div>

      <div className="table-filters">
        <div className="table-filters__search">
          <Search size={15} className="table-filters__search-icon" />
          <input
            className="table-filters__search-input"
            placeholder="Search by applicant or job…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="table-filters__select"
          value={filters.interview_type || ''}
          onChange={e => setFilter('interview_type', e.target.value)}
        >
          <option value="">All Types</option>
          {INTERVIEW_TYPES.map(t => <option key={t} value={t}>{label(t)}</option>)}
        </select>
        <select
          className="table-filters__select"
          value={filters.outcome || ''}
          onChange={e => setFilter('outcome', e.target.value)}
        >
          <option value="">All Outcomes</option>
          {OUTCOMES.map(o => <option key={o} value={o}>{label(o)}</option>)}
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
                  <TableHead>Applicant</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Scheduled At</TableHead>
                  <TableHead>Interviewer</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="empty-state">
                        <Video strokeWidth={1.5} />
                        <p className="empty-state-title">
                          {interviews.length === 0 ? 'No interviews scheduled' : 'No interviews match your filter'}
                        </p>
                        <p className="empty-state-desc">
                          {interviews.length === 0
                            ? 'Schedule your first interview to get started'
                            : 'Try adjusting your search or filter.'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.applicant_name || '—'}</TableCell>
                      <TableCell>{item.job_title || '—'}</TableCell>
                      <TableCell>{item.interview_type ? label(item.interview_type) : '—'}</TableCell>
                      <TableCell>{formatDateTime(item.scheduled_at)}</TableCell>
                      <TableCell>{item.interviewer_name || '—'}</TableCell>
                      <TableCell>
                        {item.outcome
                          ? <Badge variant={OUTCOME_COLORS[item.outcome] || 'default'}>{label(item.outcome)}</Badge>
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="row-actions">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item)}>
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
        title={editing ? 'Edit Interview' : 'New Interview'}
        onSubmit={handleSubmit(onSubmit)}
        loading={saving}
      >
        <div className="form-group">
          <Label>Job Application *</Label>
          <select {...register('application', { required: 'Required' })} className="form-select">
            <option value="">— Select Application —</option>
            {applications.map(a => (
              <option key={a.id} value={a.id}>{a.applicant_name} — {a.job_title}</option>
            ))}
          </select>
          {errors.application && <p className="form-error">{errors.application.message}</p>}
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <Label>Interview Type *</Label>
            <select {...register('interview_type', { required: 'Required' })} className="form-select">
              {INTERVIEW_TYPES.map(t => <option key={t} value={t}>{label(t)}</option>)}
            </select>
            {errors.interview_type && <p className="form-error">{errors.interview_type.message}</p>}
          </div>
          <div className="form-group">
            <Label>Outcome</Label>
            <select {...register('outcome')} className="form-select">
              {OUTCOMES.map(o => <option key={o} value={o}>{label(o)}</option>)}
            </select>
          </div>
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <Label>Scheduled At *</Label>
            <Input type="datetime-local" {...register('scheduled_at', { required: 'Required' })} />
            {errors.scheduled_at && <p className="form-error">{errors.scheduled_at.message}</p>}
          </div>
          <div className="form-group">
            <Label>Interviewer (Employee)</Label>
            <select {...register('interviewer')} className="form-select">
              <option value="">— None —</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.full_name || `${e.first_name} ${e.last_name}`}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <Label>Comments</Label>
          <textarea {...register('comments')} rows={3} placeholder="Interview notes, prep questions..." className="form-textarea" />
        </div>
        <div className="form-group">
          <Label>Results</Label>
          <textarea {...register('results')} rows={3} placeholder="Outcome summary, feedback..." className="form-textarea" />
        </div>
      </FormModal>
    </div>
  )
}
