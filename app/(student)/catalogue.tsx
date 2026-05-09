// app/(student)/catalogue.tsx
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Platform } from 'react-native'
import { useState, useCallback } from 'react'
import { router, useFocusEffect } from 'expo-router'
import { getAllEvents, Event } from '../../database/events'

const FILTRES = ['Tous', 'Talk', 'Workshop', 'Club', 'Exam', 'Other']

export default function Catalogue() {
  const [events, setEvents] = useState<Event[]>([])
  const [filtre, setFiltre] = useState('Tous')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      const data = getAllEvents()
      setEvents(data)
      setLoading(false)
    }, [])
  )

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getDate()} avr · ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
  }

  function getCategoryStyle(category: string) {
    switch(category?.toLowerCase()) {
      case 'workshop': return { bg: '#d1fae5', text: '#059669' }
      case 'talk': return { bg: '#dbeafe', text: '#2563eb' }
      case 'club': return { bg: '#fef3c7', text: '#d97706' }
      case 'exam': return { bg: '#fce7f3', text: '#db2777' }
      default: return { bg: '#f0f0f0', text: '#666' }
    }
  }

  const filtered = events.filter(e => {
    const matchFiltre = filtre === 'Tous' || e.category === filtre
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase())
    return matchFiltre && matchSearch
  })

  return (
    <View style={styles.container}>
      {/* Header style maquette */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Étudiant</Text>
        <Text style={styles.headerSubtitle}>catalogue</Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Rechercher un événement..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filtres */}
      <View style={styles.filtresContainer}>
        <FlatList
          horizontal
          data={FILTRES}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filtresList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filtreBtn, filtre === item && styles.filtreBtnActive]}
              onPress={() => setFiltre(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filtreText, filtre === item && styles.filtreTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Liste des événements */}
      {loading ? (
        <Text style={styles.empty}>Chargement...</Text>
      ) : filtered.length === 0 ? (
        <Text style={styles.empty}>Aucun événement trouvé</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const catStyle = getCategoryStyle(item.category)
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push({ pathname: '/(student)/detail', params: { id: item.id } })}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
                      <Text style={[styles.categoryText, { color: catStyle.text }]}>
                        {item.category}
                      </Text>
                    </View>
                    <Text style={styles.cardDate}>{formatDate(item.startDateTime)}</Text>
                  </View>

                  <Text style={styles.cardTitle}>{item.title}</Text>

                  <View style={styles.cardInfo}>
                    <Text style={styles.cardLocation}>📍 {item.locationName}</Text>
                    <Text style={styles.cardOrganizer}>{item.organizerName}</Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.placesBadge}>
                      <Text style={styles.placesText}>
                        {item.registeredCount}/{item.capacity ?? '∞'} inscrits
                      </Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          }}
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
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

  // Recherche
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    paddingLeft: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    color: '#1a1a1a',
  },

  // Filtres
  filtresContainer: {
    backgroundColor: '#fff',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filtresList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filtreBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filtreBtnActive: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filtreText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  filtreTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  // Liste
  listContainer: {
    padding: 20,
    gap: 12,
  },

  // Carte événement
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardDate: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 20,
  },
  cardInfo: {
    gap: 4,
    marginBottom: 12,
  },
  cardLocation: {
    fontSize: 13,
    color: '#666',
  },
  cardOrganizer: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placesBadge: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  placesText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  arrow: {
    fontSize: 18,
    color: '#059669',
    fontWeight: '700',
  },

  // État vide
  empty: {
    textAlign: 'center',
    marginTop: 60,
    color: '#999',
    fontSize: 16
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabIconActive: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  tabLabelActive: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '700',
  },
})