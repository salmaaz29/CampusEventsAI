import { db } from './init'

export type Registration = {
  id: string
  eventId: string
  userId: string
  createdAt: string
  status: 'confirmed' | 'cancelled'
}

export function getUserRegistrations(userId: string): Registration[] {
  return db.getAllSync(
    'SELECT * FROM registrations WHERE userId = ? AND status = ?',
    [userId, 'confirmed']
  ) as Registration[]
}

export function isRegistered(eventId: string, userId: string): boolean {
  const row = db.getFirstSync(
    'SELECT id FROM registrations WHERE eventId = ? AND userId = ?',
    [eventId, userId]
  )
  return !!row
}

export function registerEvent(id: string, eventId: string, userId: string) {
  db.runSync(
    'INSERT INTO registrations (id, eventId, userId, createdAt, status) VALUES (?, ?, ?, ?, ?)',
    [id, eventId, userId, new Date().toISOString(), 'confirmed']
  )
  db.runSync(
    'UPDATE events SET registeredCount = registeredCount + 1 WHERE id = ?',
    [eventId]
  )
}

export function cancelRegistration(eventId: string, userId: string) {
  db.runSync(
    'UPDATE registrations SET status = ? WHERE eventId = ? AND userId = ?',
    ['cancelled', eventId, userId]
  )
  db.runSync(
    'UPDATE events SET registeredCount = MAX(0, registeredCount - 1) WHERE id = ?',
    [eventId]
  )
}