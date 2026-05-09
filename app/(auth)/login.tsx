// app/login.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [role, setRole] = useState<'admin' | 'student'>('student')
  const [email, setEmail] = useState('etudiant@campus.ma')
  const [password, setPassword] = useState('etudiant123')
  const { signIn } = useAuth()

  function handleRoleSwitch(r: 'admin' | 'student') {
    setRole(r)
    if (r === 'admin') {
      setEmail('admin@campus.ma')
      setPassword('admin123')
    } else {
      setEmail('etudiant@campus.ma')
      setPassword('etudiant123')
    }
  }

  function handleLogin() {
    const success = signIn(email, password)
    if (!success) {
      Alert.alert('Erreur', 'Email ou mot de passe incorrect')
      return
    }
    if (role === 'admin') {
      router.replace('/(admin)/events')
    } else {
      router.replace('/(student)/catalogue')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Connexion</Text>
      <Text style={styles.title}>CampusEvents AI</Text>
      <Text style={styles.subtitle}>Université Abdelmalek Essaâdi</Text>

      {/* Onglets Admin / Étudiant */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, role === 'student' && styles.tabActive]}
          onPress={() => handleRoleSwitch('student')}
        >
          <Text style={[styles.tabText, role === 'student' && styles.tabTextActive]}>
            Étudiant
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, role === 'admin' && styles.tabActive]}
          onPress={() => handleRoleSwitch('admin')}
        >
          <Text style={[styles.tabText, role === 'admin' && styles.tabTextActive]}>
            Admin - gestion événements
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="admin@campus.ma"
      />

      <Text style={styles.label}>Mot de passe</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="••••••••"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  header: { fontSize: 32, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '600', color: '#2563eb', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 32 },
  tabs: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 10, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { color: '#999', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#2563eb', fontWeight: 'bold' },
  label: { fontSize: 13, color: '#444', marginBottom: 6, marginTop: 8, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 4, fontSize: 15, backgroundColor: '#fafafa' },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
})