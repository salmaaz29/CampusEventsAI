import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Platform } from 'react-native'
import { useState, useCallback } from 'react'
import { router, useFocusEffect } from 'expo-router'
import { supabase } from '../../services/supabase'

type Event = {
  id: string
  titre: string
  categorie: string
  date_debut: string
  lieu: string
  inscrits: number
  capacite: number
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      fetchEvents()
    }, [])
  )

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date_debut', { ascending: true })

    if (data) setEvents(data)
    setLoading(false)
  }



  async function handleDelete(id: string) {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Confirmer la suppression ?')
      if (confirmed) {
        const { error } = await supabase.from('events').delete().eq('id', id)
        if (error) alert('Erreur: ' + error.message)
        else fetchEvents()
      }
    } else {
      Alert.alert('Supprimer', 'Confirmer la suppression ?', [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('events').delete().eq('id', id)
            if (error) Alert.alert('Erreur', error.message)
            else fetchEvents()
          }
        }
      ])
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getDate()} avr · ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Événements</Text>
        <Text style={styles.adminBadge}>Admin</Text>
      </View>

      {/* Bouton créer */}
      <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/(admin)/create')}>
        <Text style={styles.createBtnText}>+ Créer un événement</Text>
      </TouchableOpacity>

      {/* Liste */}
      {loading ? (
        <Text style={styles.empty}>Chargement...</Text>
      ) : events.length === 0 ? (
        <Text style={styles.empty}>Aucun événement pour l'instant</Text>
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.titre}</Text>
                <Text style={styles.cardSub}>{item.categorie}</Text>
                <Text style={styles.cardSub}>{formatDate(item.date_debut)} · {item.lieu}</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => router.push({ pathname: '/(admin)/edit', params: { id: item.id } })}
                >
                  <Text style={styles.editBtnText}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteBtnText}>Suppr.</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 56, backgroundColor: '#fff' },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  adminBadge: { backgroundColor: '#2563eb', color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12 },
  createBtn: { margin: 16, backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  card: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 10, padding: 14, alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  cardSub: { color: '#666', fontSize: 12 },
  cardActions: { gap: 6 },
  editBtn: { backgroundColor: '#2563eb', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  editBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  deleteBtn: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  deleteBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 60, color: '#999', fontSize: 16 },
})