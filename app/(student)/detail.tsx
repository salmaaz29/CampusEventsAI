// app/(student)/detail.tsx
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native'
import { useState, useEffect } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { getEventById, Event } from '../../database/events'
import { isRegistered, registerEvent, cancelRegistration } from '../../database/registrations'
import { isFavorite, addFavorite, removeFavorite } from '../../database/favorites'
import { useAuth } from '../../context/AuthContext'
import * as Crypto from 'expo-crypto'

export default function DetailEvent() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [registered, setRegistered] = useState(false)
  const [favorite, setFavorite] = useState(false)

  useEffect(() => {
    const e = getEventById(id)
    setEvent(e)
    if (e && user) {
      setRegistered(isRegistered(e.id, user.email))
      setFavorite(isFavorite(e.id, user.email))
    }
  }, [])

  function handleRegister() {
    if (!event || !user) return
    if (registered) {
      Alert.alert('Annuler', 'Annuler votre inscription ?', [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui', style: 'destructive',
          onPress: () => {
            cancelRegistration(event.id, user.email)
            setRegistered(false)
            setEvent(getEventById(id))
          }
        }
      ])
    } else {
      if (event.capacity && event.registeredCount >= event.capacity) {
        Alert.alert('Complet', 'Cet événement est complet.')
        return
      }
      registerEvent(Crypto.randomUUID(), event.id, user.email)
      setRegistered(true)
      setEvent(getEventById(id))
    }
  }

  function handleFavorite() {
    if (!event || !user) return
    if (favorite) {
      removeFavorite(event.id, user.email)
      setFavorite(false)
    } else {
      addFavorite(event.id, user.email)
      setFavorite(true)
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getDate()} avr · ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
  }

  if (!event) return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.empty}>Événement introuvable</Text>
    </View>
  )

  const isPast = new Date(event.startDateTime) < new Date()
  const isFull = event.capacity ? event.registeredCount >= event.capacity : false

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header style maquette */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Étudiant</Text>
          <Text style={styles.headerSubtitle}>détail événement</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Type et titre */}
        <View style={styles.typeContainer}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{event.category}</Text>
          </View>
          <TouchableOpacity onPress={handleFavorite} style={styles.favoriteIcon}>
            <Text style={[styles.favoriteText, favorite && styles.favoriteActive]}>
              {favorite ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{event.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{event.description}</Text>

        {/* Détails */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(event.startDateTime)}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Lieu</Text>
            <Text style={styles.detailValue}>{event.locationName}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Places</Text>
            <Text style={styles.detailValue}>
              {event.registeredCount}/{event.capacity ?? '∞'}
            </Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Organisateur</Text>
            <Text style={styles.detailValue}>{event.organizerName}</Text>
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.registerBtn,
              registered && styles.registerBtnCancel,
              (isPast || isFull) && !registered && styles.registerBtnDisabled
            ]}
            onPress={handleRegister}
            disabled={isPast || (isFull && !registered)}
            activeOpacity={0.8}
          >
            <Text style={styles.registerBtnText}>
              {registered ? 'Se désinscrire' : isPast ? 'Terminé' : isFull ? 'Complet' : "S'inscrire"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: '#2563eb',
    fontWeight: '600',
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

  // Content
  content: {
    padding: 20,
  },

  // Type et favori
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  favoriteIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteText: {
    fontSize: 22,
    color: '#ccc',
  },
  favoriteActive: {
    color: '#f59e0b',
  },

  // Titre
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    lineHeight: 30,
  },

  // Description
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },

  // Détails card
  detailsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
  },

  // Actions
  actions: {
    marginTop: 8,
  },
  registerBtn: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerBtnCancel: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  registerBtnDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
    elevation: 0,
  },
  registerBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  empty: {
    textAlign: 'center',
    marginTop: 100,
    color: '#999',
    fontSize: 16,
  },
})