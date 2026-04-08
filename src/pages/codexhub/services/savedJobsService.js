import { safeParseJSON } from '../utils/storage'

const savedJobsService = {
  getSavedJobsLocal: () => {
    const raw = localStorage.getItem('savedJobs')
    const parsed = safeParseJSON(raw, [])
    return Array.isArray(parsed) ? parsed : []
  },
}

export default savedJobsService
