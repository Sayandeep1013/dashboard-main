'use client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('http://admin-api.life-lab.org/api/logout', {
        method: 'POST',
      })
      sessionStorage.removeItem('isLoggedIn')
      router.push('/login')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  return <button onClick={handleLogout}>Logout</button>
}
