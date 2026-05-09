import { db } from './init'

export type Favorite = {
  eventId: string
  userId: string
  createdAt: string
}

export function getUserFavorites(userId: string): string[] {
  const rows = db.getAllSync(
    'SELECT eventId FROM favorites WHERE userId = ?',
    [userId]
  ) as { eventId: string }[]
  return rows.map(r => r.eventId)
}

export function isFavorite(eventId: string, userId: string): boolean {
  const row = db.getFirstSync(
    'SELECT eventId FROM favorites WHERE eventId = ? AND userId = ?',
    [eventId, userId]
  )
  return !!row
}

export function addFavorite(eventId: string, userId: string) {
  db.runSync(
    'INSERT OR IGNORE INTO favorites (eventId, userId, createdAt) VALUES (?, ?, ?)',
    [eventId, userId, new Date().toISOString()]
  )
}

export function removeFavorite(eventId: string, userId: string) {
  db.runSync(
    'DELETE FROM favorites WHERE eventId = ? AND userId = ?',
    [eventId, userId]
  )
}