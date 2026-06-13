import {
  collection, doc, getDoc, setDoc, updateDoc, onSnapshot,
  query, where, serverTimestamp, Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Trip, PackingList, UserId, ListStatus, PackingItem } from '@/types'

// ─── Trips ───────────────────────────────────────────────────────────────────

export async function createTrip(trip: Omit<Trip, 'id' | 'createdAt'>): Promise<string> {
  const ref = doc(collection(db, 'trips'))
  await setDoc(ref, { ...trip, id: ref.id, createdAt: new Date().toISOString() })
  return ref.id
}

export async function getTrip(tripId: string): Promise<Trip | null> {
  const snap = await getDoc(doc(db, 'trips', tripId))
  return snap.exists() ? (snap.data() as Trip) : null
}

export function subscribeToTrip(tripId: string, cb: (t: Trip | null) => void): Unsubscribe {
  return onSnapshot(doc(db, 'trips', tripId), snap =>
    cb(snap.exists() ? (snap.data() as Trip) : null)
  )
}

// ─── Packing Lists ────────────────────────────────────────────────────────────

export async function createPackingList(list: Omit<PackingList, 'id' | 'updatedAt'>): Promise<string> {
  const ref = doc(collection(db, 'packingLists'))
  await setDoc(ref, { ...list, id: ref.id, updatedAt: new Date().toISOString() })
  return ref.id
}

export function subscribeToList(listId: string, cb: (l: PackingList | null) => void): Unsubscribe {
  return onSnapshot(doc(db, 'packingLists', listId), snap =>
    cb(snap.exists() ? (snap.data() as PackingList) : null)
  )
}

export function subscribeToUserLists(
  tripId: string,
  userId: UserId,
  cb: (lists: PackingList[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'packingLists'),
    where('tripId', '==', tripId),
    where('userId', '==', userId)
  )
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => d.data() as PackingList))
  )
}

export function subscribeToTripLists(
  tripId: string,
  cb: (lists: PackingList[]) => void
): Unsubscribe {
  const q = query(collection(db, 'packingLists'), where('tripId', '==', tripId))
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => d.data() as PackingList))
  )
}

export async function updateListStatus(listId: string, status: ListStatus): Promise<void> {
  await updateDoc(doc(db, 'packingLists', listId), {
    status,
    updatedAt: new Date().toISOString(),
  })
}

export async function updateListItems(listId: string, items: PackingItem[]): Promise<void> {
  await updateDoc(doc(db, 'packingLists', listId), {
    items,
    updatedAt: new Date().toISOString(),
  })
}

export async function incrementPackedQuantity(
  listId: string,
  itemId: string,
  items: PackingItem[]
): Promise<void> {
  const updated = items.map(item =>
    item.id === itemId && item.packedQuantity < item.targetQuantity
      ? { ...item, packedQuantity: item.packedQuantity + 1 }
      : item
  )
  await updateListItems(listId, updated)
}

export async function pushListToApproved(listIds: string[]): Promise<void> {
  await Promise.all(listIds.map(id => updateListStatus(id, 'approved')))
}
