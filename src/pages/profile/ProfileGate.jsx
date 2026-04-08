import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import ProfilePage from '@/pages/profile/ProfilePage'
import CodexHubProfilePage from '@/pages/codexhub/CodexHubProfilePage'

export default function ProfileGate() {
  const { user, loading } = useAuth()

  if (loading) return null

  const isApplicant = user && !user.is_staff && (!user.groups || user.groups.length === 0)

  if (isApplicant) {
    return <CodexHubProfilePage />
  }

  if (user) {
    return <ProfilePage />
  }

  return <Navigate to="/login" replace />
}
