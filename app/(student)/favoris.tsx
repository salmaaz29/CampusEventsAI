// app/(student)/favoris.tsx
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Platform } from 'react-native'
import { useState, useCallback } from 'react'
import { router, useFocusEffect } from 'expo-router'
import { getUserFavorites } from '../../database/favorites'
import { getEventById, Event } from '../../database/events'
import { useAuth } from '../../context/AuthContext'

export default function Favoris() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])

  useFocusEffect(
    useCallback(() => {
      if (!user) return
      const ids = getUserFavorites(user.email)
      const data = ids.map(id => getEventById(id)).filter(Boolean) as Event[]
      setEvents(data)
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
      default: return { bg: '#f0f0f0', text: '#666' }
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Étudiant</Text>
        <Text style={styles.headerSubtitle}>favoris</Text>
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyTitle}>Aucun favori</Text>
          <Text style={styles.emptySubtitle}>Ajoutez des événements à vos favoris pour les retrouver ici</Text>
        </View>
      ) : (
        <FlatList
          data={events}
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
                    <Text style={styles.starIcon}>★</Text>
                  </View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardInfo}>
                    📅 {formatDate(item.startDateTime)} · 📍 {item.locationName}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          }}
        />
      )}

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/(student)/catalogue')}>
          <Text style={styles.tabIcon}>📅</Text>
          <Text style={styles.tabLabel}>Événements</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIconActive}>⭐</Text>
          <Text style={styles.tabLabelActive}>Favoris</Text>
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
  listContainer: {
    padding: 20,
    gap: 12,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  starIcon: {
    fontSize: 18,
    color: '#f59e0b',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  cardInfo: {
    fontSize: 13,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
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