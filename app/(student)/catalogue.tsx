import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native'
import { useState, useCallback } from 'react'
import { router, useFocusEffect } from 'expo-router'
import { supabase } from '../../services/supabase'

const FILTRES = ['Tous', 'Talk', 'Workshop', 'Club', 'Exam']

type Event = {
  id: string
  titre: string
  categorie: string
  date_debut: string
  lieu: string
  inscrits: number
  capacite: number
  description: string
}

export default function Catalogue() {
  const [events, setEvents] = useState<Event[]>([])
  const [filtre, setFiltre] = useState('Tous')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      fetchEvents()
    }, [])
  )

  async function fetchEvents() {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('date_debut', { ascending: true })
    if (data) setEvents(data)
    setLoading(false)
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getDate()} avr · ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
  }

  const filtered = events.filter(e => {
    const matchFiltre = filtre === 'Tous' || e.categorie === filtre
    const matchSearch = e.titre.toLowerCase().includes(search.toLowerCase())
    return matchFiltre && matchSearch
  })

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Événements</Text>
      </View>

      {/* Recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.search}
          placeholder="🔍 Rechercher un événement..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filtres */}
      <View style={styles.filtres}>
        {FILTRES.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filtreBtn, filtre === f && styles.filtreBtnActive]}
            onPress={() => setFiltre(f)}
          >
            <Text style={[styles.filtreText, filtre === f && styles.filtreTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste */}
      {loading ? (
        <Text style={styles.empty}>Chargement...</Text>
      ) : filtered.length === 0 ? (
        <Text style={styles.empty}>Aucun événement trouvé</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: '/(student)/detail', params: { id: item.id } })}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.categorieBadge}>{item.categorie}</Text>
                <Text style={styles.cardTitle}>{item.titre}</Text>
                <Text style={styles.cardSub}>{formatDate(item.date_debut)} · {item.lieu}</Text>
                <Text style={styles.cardSub}>{item.inscrits}/{item.capacite} inscrits</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIconActive}>📅</Text>
          <Text style={styles.tabLabelActive}>Événements</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/(student)/favoris')}>
          <Text style={styles.tabIcon}>⭐</Text>
          <Text style={styles.tabLabel}>Favoris</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/(student)/inscriptions')}>
          <Text style={styles.tabIcon}>✅</Text>
          <Text style={styles.tabLabel}>Inscriptions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/(student)/assistant')}>
          <Text style={styles.tabIcon}>🤖</Text>
          <Text style={styles.tabLabel}>Assistant</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, paddingTop: 56, backgroundColor: '#fff' },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  searchContainer: { padding: 12, backgroundColor: '#fff' },
  search: { backgroundColor: '#f0f0f0', borderRadius: 10, padding: 10, fontSize: 15 },
  filtres: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  filtreBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f0f0f0' },
  filtreBtnActive: { backgroundColor: '#2563eb' },
  filtreText: { color: '#666', fontSize: 13 },
  filtreTextActive: { color: '#fff', fontWeight: 'bold' },
  card: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 10, borderRadius: 10, padding: 14, alignItems: 'center' },
  cardLeft: { flex: 1 },
  categorieBadge: { color: '#2563eb', fontSize: 11, fontWeight: 'bold', marginBottom: 4 },
  cardTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  cardSub: { color: '#666', fontSize: 12 },
  arrow: { fontSize: 20, color: '#ccc' },
  empty: { textAlign: 'center', marginTop: 60, color: '#999', fontSize: 16 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', paddingBottom: 20 },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 10 },
  tabIcon: { fontSize: 20 },
  tabIconActive: { fontSize: 20 },
  tabLabel: { fontSize: 11, color: '#999', marginTop: 2 },
  tabLabelActive: { fontSize: 11, color: '#2563eb', fontWeight: 'bold', marginTop: 2 },
})