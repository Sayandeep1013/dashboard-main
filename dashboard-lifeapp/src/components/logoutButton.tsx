'use client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('http://152.42.239.141:5000/api/logout', {
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
