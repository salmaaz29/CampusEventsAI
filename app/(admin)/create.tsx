// app/(admin)/create.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { createEvent } from '../../database/events'
import * as Crypto from 'expo-crypto'

const CATEGORIES = ['Talk', 'Workshop', 'Club', 'Exam', 'Other']

export default function CreateEvent() {
  const [title, setTitle] = useState('Workshop Docker & Kubernetes')
  const [category, setCategory] = useState('Workshop')
  const [date, setDate] = useState('2026-04-25')
  const [heure, setHeure] = useState('09:00')
  const [locationName, setLocationName] = useState('Salle Info B14')
  const [organizerName, setOrganizerName] = useState('Club Dev')
  const [capacity, setCapacity] = useState('25')
  const [description, setDescription] = useState('Atelier pratique sur la conteneurisation avec Docker...')

  function handleCreate() {
    if (!title || !date || !heure || !locationName || !description) {
      Alert.alert('Erreur', 'Remplis tous les champs obligatoires (*)')
      return
    }
    if (capacity && (isNaN(parseInt(capacity)) || parseInt(capacity) <= 0)) {
      Alert.alert('Erreur', 'La capacité doit être un entier positif')
      return
    }

    const startDateTime = new Date(`${date}T${heure}:00`).toISOString()

    createEvent({
      id: Crypto.randomUUID(),
      title,
      description,
      category: category as any,
      startDateTime,
      locationName,
      organizerName,
      capacity: capacity ? parseInt(capacity) : undefined,
    })

    router.replace('/(admin)/events')
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {/* Header style maquette */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Admin</Text>
          <Text style={styles.headerSubtitle}>formulaire création</Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Nouvel événement</Text>

        {/* Titre */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Titre *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Workshop Docker & Kubernetes"
            placeholderTextColor="#999"
          />
        </View>

        {/* Catégorie */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Catégorie *</Text>
          <View style={styles.categories}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catBtn, category === cat && styles.catBtnActive]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.catText, category === cat && styles.catTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date + Heure */}
        <View style={styles.row}>
          <View style={[styles.fieldGroup, styles.half]}>
            <Text style={styles.label}>Date début *</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="25 avr 2026"
              placeholderTextColor="#999"
            />
          </View>
          <View style={[styles.fieldGroup, styles.half]}>
            <Text style={styles.label}>Heure *</Text>
            <TextInput
              style={styles.input}
              value={heure}
              onChangeText={setHeure}
              placeholder="09:00"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Lieu */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Lieu *</Text>
          <TextInput
            style={styles.input}
            value={locationName}
            onChangeText={setLocationName}
            placeholder="Ex: Salle Info B14"
            placeholderTextColor="#999"
          />
        </View>

        {/* Organisateur */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Organisateur</Text>
          <TextInput
            style={styles.input}
            value={organizerName}
            onChangeText={setOrganizerName}
            placeholder="Ex: Club Dev"
            placeholderTextColor="#999"
          />
        </View>

        {/* Capacité */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Capacité</Text>
          <TextInput
            style={styles.input}
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="numeric"
            placeholder="25"
            placeholderTextColor="#999"
          />
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Atelier pratique sur la conteneurisation avec Docker..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Bouton Submit */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleCreate}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Créer l'événement</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a'
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 1,
  },

  // Formulaire
  form: {
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },

  // Groupes de champs
  fieldGroup: {
    marginBottom: 4,
  },

  // Labels
  label: {
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 20,
    color: '#444',
    fontSize: 13,
    letterSpacing: 0.3,
  },

  // Inputs
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '400',
  },
  textarea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },

  // Catégories
  categories: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  catBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    backgroundColor: '#fafafa',
  },
  catBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  catText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  catTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  // Row date/heure
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },

  // Bouton créer
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
})