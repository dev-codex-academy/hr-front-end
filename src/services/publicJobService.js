import api from './api'

const publicJobService = {
  getAll: (params) => api.get('/public/jobs/', { params }),
  getById: (id) => api.get(`/public/jobs/${id}/`),
}

export default publicJobService
