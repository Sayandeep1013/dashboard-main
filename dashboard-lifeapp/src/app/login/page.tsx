'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('https://admin-api.life-lab.org/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

      const data = await res.json()

      if (res.ok) {
        sessionStorage.setItem('isLoggedIn', 'true')
        router.push('/')
      } else {
        setError(data.errors?.message || 'Login failed')
      }
    } catch (err) {
      setError('Server error. Please try again.')
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#f5f5f5'
    }}>
      <form
        onSubmit={handleLogin}
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px'
        }}
      >
        <h2 style={{
          textAlign: 'center',
          marginBottom: '24px',
          color: '#333'
        }}>Admin Login</h2>

        <label style={{ marginBottom: '8px', color: '#555' }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          style={{
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            marginBottom: '16px',
            width: '100%'
          }}
        />

        <label style={{ marginBottom: '8px', color: '#555' }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          style={{
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            marginBottom: '24px',
            width: '100%'
          }}
        />

        <button
          type="submit"
          style={{
            backgroundColor: '#0070f3',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            width: '100%',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Login
        </button>

        {error && <p style={{ color: 'red', marginTop: '16px', textAlign: 'center' }}>{error}</p>}
      </form>
    </div>
  )
}