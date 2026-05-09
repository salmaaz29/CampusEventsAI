import { useEffect, useState } from 'react'
import { Slot, router } from 'expo-router'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { initDatabase } from '../database/init'

// Initialiser la DB immédiatement au chargement du module
initDatabase()

function RootLayoutNav() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/(auth)/login')
    } else if (user.role === 'admin') {
      router.replace('/(admin)/events')
    } else {
      router.replace('/(student)/catalogue')
    }
  }, [user, loading])

  return <Slot />
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  )
}