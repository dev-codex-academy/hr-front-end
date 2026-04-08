import api from './api'

const applicantService = {
  getAll: (params) => api.get('/applicants/', { params }),
  getById: (id) => api.get(`/applicants/${id}/`),
  create: (data) => api.post('/applicants/', data),
  update: (id, data) => api.patch(`/applicants/${id}/`, data),
  remove: (id) => api.delete(`/applicants/${id}/`),

  uploadPhoto: (id, file) => {
    const formData = new FormData()
    formData.append('photo', file)
    return api.post(`/applicants/${id}/upload-photo/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadCV: (id, file) => {
    const formData = new FormData()
    formData.append('cv', file)
    return api.post(`/applicants/${id}/upload-cv/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Returns { download_url, expires_in } — redirect user to download_url
  downloadCV: (id) =>
    api.get(`/applicants/${id}/cv-download/`),

  // Self-service: logged-in applicant's own profile
  // Backend does not expose /applicants/my-profile/, so resolve via /me/ + applicants search.
  getMyProfile: async () => {
    const cachedProfile = localStorage.getItem('applicantProfile')
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile)
        if (parsed?.id) {
          return { data: parsed }
        }
      } catch {
        // ignore invalid cache
      }
    }

    const storedId = localStorage.getItem('applicantId')
    if (storedId) {
      try {
        return await api.get(`/applicants/${storedId}/`)
      } catch (error) {
        if (![403, 404].includes(error?.response?.status)) {
          throw error
        }
      }
    }

    const meRes = await api.get('/me/')
    const username = meRes.data?.username
    const email = meRes.data?.email
    if (!username && !email) {
      const err = new Error('Unable to resolve current user.')
      err.response = { status: 404 }
      throw err
    }

    const listRes = await api.get('/applicants/', {
      params: { search: username || email },
    })
    let list = listRes.data?.results ?? listRes.data ?? []
    let match =
      list.find((item) => item.username === username) ||
      list.find((item) => item.email === email) ||
      list[0]

    if (!match && email) {
      const emailRes = await api.get('/applicants/', { params: { search: email } })
      list = emailRes.data?.results ?? emailRes.data ?? []
      match = list.find((item) => item.email === email) || list[0]
    }

    if (!match?.id) {
      const err = new Error('Applicant profile not found.')
      err.response = { status: 404 }
      throw err
    }

    localStorage.setItem('applicantId', match.id)
    localStorage.setItem('applicantProfile', JSON.stringify(match))

    if (match.work_experiences) {
      return { ...listRes, data: match }
    }

    return api.get(`/applicants/${match.id}/`)
  },
  updateMyProfile: async (data) => {
    const storedId = localStorage.getItem('applicantId')
    if (storedId) {
      return api.patch(`/applicants/${storedId}/`, data)
    }
    const profileRes = await applicantService.getMyProfile()
    const id = profileRes?.data?.id
    if (!id) {
      const err = new Error('Applicant profile not found.')
      err.response = { status: 404 }
      throw err
    }
    return api.patch(`/applicants/${id}/`, data)
  },

  uploadMyPhoto: (id, file) => {
    const formData = new FormData()
    formData.append('photo', file)
    return api.post(`/applicants/${id}/upload-photo/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadMyCV: (id, file) => {
    const formData = new FormData()
    formData.append('cv', file)
    return api.post(`/applicants/${id}/upload-cv/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default applicantService
