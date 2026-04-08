import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import authService from '@/services/authService'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/ui/spinner'
import Swal from 'sweetalert2'

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

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setError('')
    setLoading(true)
    try {
      const res = await authService.register(data)
      const applicant = res?.data?.applicant
      if (applicant?.id) {
        localStorage.setItem('applicantId', applicant.id)
        localStorage.setItem('applicantProfile', JSON.stringify(applicant))
        localStorage.setItem('username', data.username)
      }
      await login(data.username, data.password)
      await Swal.fire({
        icon: 'success',
        title: 'Account created!',
        text: 'Welcome to CodeX Hub.',
        confirmButtonColor: '#4E89BD',
        timer: 1200,
        showConfirmButton: false,
      })
      navigate('/codexhub/students')
    } catch (err) {
      const resData = err.response?.data
      if (resData && typeof resData === 'object') {
        const messages = Object.entries(resData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('\n')
        setError(messages)
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const field = (name, opts = {}) => ({
    ...register(name, opts),
    style: fieldStyle,
    onFocus: e => (e.target.style.borderColor = '#4E89BD'),
    onBlur: e => (e.target.style.borderColor = errors[name] ? '#dc2626' : '#e2e8f0'),
  })

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brandline">
          <img className="auth-brand-logo" src="/codeX-logo.png" alt="CodeX logo" />
          <div>
            <p className="auth-app">CodeX Academy</p>
            {/* TODO change line to be more HR  */}
            <p className="auth-tag">Join the next cohort and get matched with mentors, projects, and career support.</p>
          </div>
        </div>

        {/* <div className="auth-form-header">
          <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.3em', color: '#E06C75', textTransform: 'uppercase', margin: 0 }}>
            CodeX Academy
          </p>
          <h2>Start your application</h2>
          <p>Join the next cohort and get matched with mentors, projects, and career support.</p>
        </div> */}

        <form onSubmit={handleSubmit(onSubmit)}>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
                padding: '12px 16px', marginBottom: '20px', color: '#dc2626',
                fontSize: '14px', whiteSpace: 'pre-line',
              }}>{error}</div>
            )}

            {/* First + Last name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input placeholder="Jane" {...field('first_name', { required: 'Required' })} />
                {errors.first_name && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.first_name.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input placeholder="Doe" {...field('last_name', { required: 'Required' })} />
                {errors.last_name && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.last_name.message}</p>}
              </div>
            </div>

            {/* Username */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Username</label>
              <input placeholder="jdoe" {...field('username', { required: 'Username is required' })} />
              {errors.username && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.username.message}</p>}
            </div>

            {/* Password row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <div>
                <label style={labelStyle}>Password</label>
                <input type="password" placeholder="Create a password"
                  {...field('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Min 8 characters' }
                  })} />
                {errors.password && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.password.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>Confirm password</label>
                <input type="password" placeholder="Confirm password"
                  {...field('password_confirm', {
                    required: 'Required',
                    validate: val => val === password || 'Passwords do not match',
                  })} />
                {errors.password_confirm && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.password_confirm.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email address</label>
              <input type="email" placeholder="jane.doe@example.com"
                {...field('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' }
                })} />
              {errors.email && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Phone <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span></label>
              <input type="tel" placeholder="+1 (555) 000-0000" {...field('phone')} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: '48px', borderRadius: '12px',
                background: loading ? '#93b8d8' : 'linear-gradient(135deg, #4E89BD, #61AFEE)',
                color: 'white', fontWeight: '700', fontSize: '16px',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(78,137,189,0.40)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {loading ? <><Spinner size="sm" /> Creating account...</> : 'Create account'}
            </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#4E89BD', fontWeight: '700', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
