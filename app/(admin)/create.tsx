import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { supabase } from '../../services/supabase'

const CATEGORIES = ['Talk', 'Workshop', 'Club', 'Exam']

export default function CreateEvent() {
  const [titre, setTitre] = useState('')
  const [categorie, setCategorie] = useState('Workshop')
  const [date, setDate] = useState('')
  const [heure, setHeure] = useState('')
  const [lieu, setLieu] = useState('')
  const [organisateur, setOrganisateur] = useState('')
  const [capacite, setCapacite] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!titre || !date || !heure || !lieu || !organisateur || !capacite) {
      Alert.alert('Erreur', 'Remplis tous les champs obligatoires')
      return
    }

    setLoading(true)
    const dateDebut = new Date(`${date}T${heure}:00`)

    const { error } = await supabase.from('events').insert({
      titre,
      categorie,
      date_debut: dateDebut.toISOString(),
      lieu,
      organisateur,
      capacite: parseInt(capacite),
      description,
    })

    if (error) {
          Alert.alert('Erreur', error.message)
        } else {
          router.replace('/(admin)/events')
        }
    setLoading(false)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouvel événement</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Titre *</Text>
        <TextInput style={styles.input} value={titre} onChangeText={setTitre} placeholder="Ex: Workshop Docker" />

        <Text style={styles.label}>Catégorie *</Text>
        <View style={styles.categories}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catBtn, categorie === cat && styles.catBtnActive]}
              onPress={() => setCategorie(cat)}
            >
              <Text style={[styles.catText, categorie === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Date * (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-04-25" />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Heure * (HH:MM)</Text>
            <TextInput style={styles.input} value={heure} onChangeText={setHeure} placeholder="09:00" />
          </View>
        </View>

        <Text style={styles.label}>Lieu *</Text>
        <TextInput style={styles.input} value={lieu} onChangeText={setLieu} placeholder="Ex: Salle B14" />

        <Text style={styles.label}>Organisateur *</Text>
        <TextInput style={styles.input} value={organisateur} onChangeText={setOrganisateur} placeholder="Ex: Club Dev" />

        <Text style={styles.label}>Capacité *</Text>
        <TextInput style={styles.input} value={capacite} onChangeText={setCapacite} keyboardType="numeric" placeholder="25" />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Description de l'événement..."
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.button} onPress={handleCreate} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, paddingTop: 56, backgroundColor: '#fff' },
  back: { color: '#2563eb', fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  form: { padding: 16 },
  label: { fontWeight: '600', marginBottom: 6, marginTop: 12, color: '#333' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 15 },
  textarea: { height: 100, textAlignVertical: 'top' },
  categories: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  catBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  catBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  catText: { color: '#666' },
  catTextActive: { color: '#fff', fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
})