import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import * as SecureStore from 'expo-secure-store'
import { User, login } from '../database/auth'

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => boolean
  signOut: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    SecureStore.getItemAsync('user').then(data => {
      if (data) setUser(JSON.parse(data))
      setLoading(false)
    })
  }, [])

  function signIn(email: string, password: string): boolean {
    const u = login(email, password)
    if (u) {
      setUser(u)
      SecureStore.setItemAsync('user', JSON.stringify(u))
      return true
    }
    return false
  }

  function signOut() {
    setUser(null)
    SecureStore.deleteItemAsync('user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)