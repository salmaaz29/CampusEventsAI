import { db } from './init'

export type Event = {
  id: string
  title: string
  description: string
  category: 'Talk' | 'Workshop' | 'Club' | 'Exam' | 'Other'
  startDateTime: string
  endDateTime?: string
  locationName: string
  locationAddress?: string
  organizerName: string
  capacity?: number
  registeredCount: number
  imageUrl?: string
  tags?: string[]
  createdAt: string
}

export function getAllEvents(): Event[] {
  const rows = db.getAllSync('SELECT * FROM events ORDER BY startDateTime ASC')
  return rows.map((r: any) => ({
    ...r,
    tags: r.tags ? JSON.parse(r.tags) : [],
  }))
}

export function getEventById(id: string): Event | null {
  const row = db.getFirstSync('SELECT * FROM events WHERE id = ?', [id]) as any
  if (!row) return null
  return { ...row, tags: row.tags ? JSON.parse(row.tags) : [] }
}

export function createEvent(event: Omit<Event, 'registeredCount' | 'createdAt'>) {
  db.runSync(
    `INSERT INTO events (id, title, description, category, startDateTime, endDateTime, locationName, locationAddress, organizerName, capacity, registeredCount, imageUrl, tags, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    [
      event.id,
      event.title,
      event.description,
      event.category,
      event.startDateTime,
      event.endDateTime ?? null,
      event.locationName,
      event.locationAddress ?? null,
      event.organizerName,
      event.capacity ?? null,
      event.imageUrl ?? null,
      event.tags ? JSON.stringify(event.tags) : null,
      new Date().toISOString(),
    ]
  )
}

export function updateEvent(id: string, event: Partial<Event>) {
  db.runSync(
    `UPDATE events SET title=?, description=?, category=?, startDateTime=?, endDateTime=?, locationName=?, locationAddress=?, organizerName=?, capacity=?, tags=?
     WHERE id=?`,
    [
      event.title ?? '',
      event.description ?? '',
      event.category ?? 'Other',
      event.startDateTime ?? '',
      event.endDateTime ?? null,
      event.locationName ?? '',
      event.locationAddress ?? null,
      event.organizerName ?? '',
      event.capacity ?? null,
      event.tags ? JSON.stringify(event.tags) : null,
      id,
    ]
  )
}

export function deleteEvent(id: string) {
  db.runSync('DELETE FROM registrations WHERE eventId = ?', [id])
  db.runSync('DELETE FROM favorites WHERE eventId = ?', [id])
  db.runSync('DELETE FROM events WHERE id = ?', [id])
}