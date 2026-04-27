import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function FormModal({
  open,
  onOpenChange,
  title,
  onSubmit,
  loading,
  children,
  submitLabel = 'Save',
}) {
  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onOpenChange(false) }}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={() => onOpenChange(false)} type="button">
            <X size={15} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="modal-body">
            {children}
          </div>
          <div className="modal-footer">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Spinner /> Saving...</> : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
