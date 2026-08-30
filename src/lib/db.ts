import { SAMPLE_CHUNKS, SAMPLE_LESSON } from "../data/sampleLesson";
import { generateSyncCode } from "./syncCode";
import type { SyncDocument } from "./types";

const DB_NAME = "radio-paper";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("doc")) db.createObjectStore("doc");
      if (!db.objectStoreNames.contains("files")) db.createObjectStore("files");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function emptyDoc(): SyncDocument {
  return {
    syncCode: generateSyncCode(),
    lessons: [SAMPLE_LESSON],
    chunks: SAMPLE_CHUNKS,
    updatedAt: Date.now(),
  };
}

export async function loadLocal(): Promise<SyncDocument> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction("doc").objectStore("doc").get("current");
    req.onsuccess = () => resolve((req.result as SyncDocument | undefined) ?? emptyDoc());
    req.onerror = () => reject(req.error);
  });
}

export async function saveLocal(doc: SyncDocument): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const req = db.transaction("doc", "readwrite").objectStore("doc").put(doc, "current");
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function rememberFile(lessonId: string, file: File): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const req = db.transaction("files", "readwrite").objectStore("files").put(file, lessonId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getFile(lessonId: string): Promise<File | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction("files").objectStore("files").get(lessonId);
    req.onsuccess = () => resolve(req.result as File | undefined);
    req.onerror = () => reject(req.error);
  });
}
