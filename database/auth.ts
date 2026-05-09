// Comptes préconfigurés — pas de backend
const USERS = [
  { email: 'admin@campus.ma', password: 'admin123', role: 'admin' },
  { email: 'etudiant@campus.ma', password: 'etudiant123', role: 'student' },
]

export type User = {
  email: string
  role: 'admin' | 'student'
}

export function login(email: string, password: string): User | null {
  const user = USERS.find(u => u.email === email && u.password === password)
  if (!user) return null
  return { email: user.email, role: user.role as 'admin' | 'student' }
}