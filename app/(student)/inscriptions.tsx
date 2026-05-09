// app/(student)/inscriptions.tsx
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Platform } from 'react-native'
import { useState, useCallback } from 'react'
import { router, useFocusEffect } from 'expo-router'
import { getUserRegistrations, cancelRegistration } from '../../database/registrations'
import { getEventById, Event } from '../../database/events'
import { useAuth } from '../../context/AuthContext'

type InscriptionItem = {
  registration: { id: string; eventId: string; status: string }
  event: Event
}

export default function Inscriptions() {
  const { user } = useAuth()
  const [items, setItems] = useState<InscriptionItem[]>([])

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [])
  )

  function loadData() {
    if (!user) return
    const regs = getUserRegistrations(user.email)
    const data = regs
      .map(r => {
        const event = getEventById(r.eventId)
        if (!event) return null
        return { registration: r, event }
      })
      .filter(Boolean) as InscriptionItem[]
    setItems(data)
  }

  function handleCancel(eventId: string) {
    if (!user) return
    Alert.alert('Annuler', 'Voulez-vous vraiment annuler votre inscription ?', [
      { text: 'Non', style: 'cancel' },
      {
        text: 'Oui, annuler',
        style: 'destructive',
        onPress: () => {
          cancelRegistration(eventId, user.email)
          loadData()
        }
      }
    ])
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getDate()} avr · ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Étudiant</Text>
        <Text style={styles.headerSubtitle}>inscriptions</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Aucune inscription</Text>
          <Text style={styles.emptySubtitle}>Inscrivez-vous à des événements pour les retrouver ici</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.registration.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isPast = new Date(item.event.startDateTime) < new Date()
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push({ pathname: '/(student)/detail', params: { id: item.event.id } })}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, isPast && styles.statusBadgePast]}>
                      <Text style={[styles.statusText, isPast && styles.statusTextPast]}>
                        {isPast ? 'Terminé' : 'Confirmé'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitle}>{item.event.title}</Text>

                  <View style={styles.cardInfo}>
                    <Text style={styles.cardInfoText}>
                      📅 {formatDate(item.event.startDateTime)}
                    </Text>
                    <Text style={styles.cardInfoText}>
                      📍 {item.event.locationName}
                    </Text>
                  </View>

                  {!isPast && (
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => handleCancel(item.event.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancelBtnText}>Annuler l'inscription</Text>
                    </TouchableOpacity>
                  )}
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
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/(student)/favoris')}>
          <Text style={styles.tabIcon}>⭐</Text>
          <Text style={styles.tabLabel}>Favoris</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIconActive}>✅</Text>
          <Text style={styles.tabLabelActive}>Inscriptions</Text>
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
    borderLeftColor: '#059669',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgePast: {
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  statusTextPast: {
    color: '#9ca3af',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  cardInfo: {
    gap: 4,
    marginBottom: 14,
  },
  cardInfoText: {
    fontSize: 13,
    color: '#666',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cancelBtnText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
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