import type { Genre } from './genres'

export interface Draft {
  id: string
  title: string
  genre: Genre
  content: string
  createdAt: number
  updatedAt: number
}

const DB_NAME = 'oriz-muse'
const STORE = 'drafts'
const VERSION = 1

function hasIDB(): boolean {
  return typeof indexedDB !== 'undefined'
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode)
        const req = fn(t.objectStore(STORE))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
      }),
  )
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `d_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export async function listDrafts(): Promise<Draft[]> {
  if (!hasIDB()) return []
  const all = await tx<Draft[]>('readonly', (s) => s.getAll())
  return (all ?? []).sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function saveDraft(d: Draft): Promise<Draft> {
  if (!hasIDB()) return d
  const now = Date.now()
  const rec: Draft = { ...d, updatedAt: now, createdAt: d.createdAt || now }
  await tx('readwrite', (s) => s.put(rec))
  return rec
}

export async function deleteDraft(id: string): Promise<void> {
  if (!hasIDB()) return
  await tx('readwrite', (s) => s.delete(id))
}

/** Derive a title from content — first non-empty line, trimmed. Pure. */
export function deriveTitle(content: string, fallback = 'Untitled'): string {
  const line = content
    .split('\n')
    .map((l) => l.replace(/^#+\s*/, '').trim())
    .find((l) => l.length > 0)
  if (!line) return fallback
  return line.length > 60 ? `${line.slice(0, 57)}…` : line
}
