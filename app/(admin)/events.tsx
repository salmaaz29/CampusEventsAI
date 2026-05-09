// app/(admin)/events.tsx
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Platform } from 'react-native'
import { useState, useCallback } from 'react'
import { router, useFocusEffect } from 'expo-router'
import { getAllEvents, deleteEvent, Event } from '../../database/events'
import { useAuth } from '../../context/AuthContext'

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const { signOut } = useAuth()

  useFocusEffect(
    useCallback(() => {
      fetchEvents()
    }, [])
  )

  function fetchEvents() {
    const data = getAllEvents()
    setEvents(data)
    setLoading(false)
  }

  function handleDelete(id: string) {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Confirmer la suppression ?')
      if (confirmed) {
        deleteEvent(id)
        fetchEvents()
      }
    } else {
      Alert.alert('Supprimer', 'Confirmer la suppression ?', [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive',
          onPress: () => {
            deleteEvent(id)
            fetchEvents()
          }
        }
      ])
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getDate()} avr · ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
  }

  function getCategoryStyle(category: string) {
    switch(category?.toLowerCase()) {
      case 'workshop': return { bg: '#d1fae5', text: '#059669' }
      case 'conférence':
      case 'talk': return { bg: '#dbeafe', text: '#2563eb' }
      case 'club': return { bg: '#fef3c7', text: '#d97706' }
      default: return { bg: '#f0f0f0', text: '#666' }
    }
  }

  return (
    <View style={styles.container}>
      {/* Header - Style maquette */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Admin</Text>
          <Text style={styles.headerSubtitle}>gestion événements</Text>
        </View>
        <TouchableOpacity onPress={() => { signOut(); router.replace('/(auth)/login') }}>
          <Text style={styles.logoutIcon}>↪</Text>
        </TouchableOpacity>
      </View>

      {/* Bouton créer - Style maquette */}
      <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/(admin)/create')}>
        <View style={styles.createBtnContent}>
          <View style={styles.createIcon}>
            <Text style={styles.plusIcon}>+</Text>
          </View>
          <Text style={styles.createBtnText}>Nouvel événement</Text>
        </View>
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
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const catStyle = getCategoryStyle(item.category)
            return (
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  {/* Badge catégorie */}
                  <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
                    <Text style={[styles.categoryText, { color: catStyle.text }]}>
                      {item.category}
                    </Text>
                  </View>

                  {/* Titre */}
                  <Text style={styles.cardTitle}>{item.title}</Text>

                  {/* Date et lieu */}
                  <View style={styles.infoRow}>
                    <Text style={styles.dateIcon}>📅</Text>
                    <Text style={styles.infoText}>
                      {formatDate(item.startDateTime)} · {item.locationName}
                    </Text>
                  </View>

                  {/* Places */}
                  <View style={styles.placesRow}>
                    <View style={styles.placesBadge}>
                      <Text style={styles.placesText}>
                        {item.registeredCount}/{item.capacity ?? '∞'} inscrits
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => router.push({ pathname: '/(admin)/edit', params: { id: item.id } })}
                  >
                    <Text style={styles.editBtnText}>✎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Text style={styles.deleteBtnText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },

  // Header style maquette
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    gap: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a'
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400'
  },
  logoutIcon: {
    fontSize: 24,
    color: '#666'
  },

  // Bouton créer
  createBtn: {
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
  },
  createBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  createIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },

  // Liste
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12
  },

  // Carte événement
  card: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  cardLeft: {
    flex: 1,
    gap: 8
  },

  // Badge catégorie
  categoryBadge: {
    alignSelf: 'flex-start',
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

  // Titre
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 20,
  },

  // Info date/lieu
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateIcon: {
    fontSize: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },

  // Places
  placesRow: {
    flexDirection: 'row',
    marginTop: 2,
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

  // Actions
  cardActions: {
    justifyContent: 'center',
    gap: 8,
    marginLeft: 12,
  },
  editBtn: {
    backgroundColor: '#2563eb',
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 16
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 16
  },

  // État vide
  empty: {
    textAlign: 'center',
    marginTop: 60,
    color: '#999',
    fontSize: 16
  },
})