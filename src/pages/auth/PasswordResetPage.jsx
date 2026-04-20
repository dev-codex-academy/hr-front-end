import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import authService from '@/services/authService'
import { Spinner } from '@/components/ui/spinner'

const fieldStyle = {
  width: '100%',
  height: '44px',
  borderRadius: '10px',
  border: '2px solid #e2e8f0',
  padding: '0 14px',
  fontSize: '15px',
  color: '#1e293b',
  background: '#f8fafc',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '8px',
}

export default function PasswordResetPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setError('')
    setLoading(true)
    try {
      await authService.passwordReset(data.email)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const field = (name, opts = {}) => ({
    ...register(name, opts),
    style: {
      ...fieldStyle,
      border: errors[name] ? '2px solid #dc2626' : fieldStyle.border,
    },
    onFocus: e => (e.target.style.borderColor = '#4E89BD'),
    onBlur: e => (e.target.style.borderColor = errors[name] ? '#dc2626' : '#e2e8f0'),
  })

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-brandline">
          <div className="auth-register-heading">
            <h2 className="auth-register-title">Forgot your password?</h2>
            <p className="auth-register-sub">
              Enter the email tied to your CodeX Hub account and we&apos;ll send you a reset link.
            </p>
          </div>
        </div>

        {success ? (
          <div>
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '14px 16px',
              marginTop: '10px',
              color: '#166534',
              fontSize: '14px',
            }}>
              <p style={{ fontWeight: 700, margin: 0 }}>Check your inbox</p>
              <p style={{ margin: '6px 0 0' }}>
                If an account with that email exists, you&apos;ll receive a password reset link shortly.
              </p>
            </div>

            <p style={{ textAlign: 'center', marginTop: '22px', fontSize: '14px', color: '#64748b' }}>
              Remembered it?{' '}
              <Link to="/login" style={{ color: '#4E89BD', fontWeight: '700', textDecoration: 'none' }}>
                Back to sign in
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: '28px' }}>
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '24px',
                color: '#dc2626',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '22px' }}>
              <label htmlFor="email" style={labelStyle}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="jane.doe@example.com"
                {...field('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                })}
              />
              {errors.email && (
                <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '6px' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                background: loading ? '#93b8d8' : 'linear-gradient(135deg, #4E89BD, #61AFEE)',
                color: 'white',
                fontWeight: '700',
                fontSize: '16px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(78,137,189,0.40)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Sending link...
                </>
              ) : (
                'Send reset link'
              )}
            </button>

            <p style={{ textAlign: 'center', marginTop: '22px', fontSize: '14px', color: '#64748b' }}>
              Back to{' '}
              <Link to="/login" style={{ color: '#4E89BD', fontWeight: '700', textDecoration: 'none' }}>
                sign in
              </Link>
            </p>
          </form>
        )}
      </section>
    </main>
  )
}
