const DATABASE_NAME = "e-learning-assessment-attempt";
const DATABASE_VERSION = 1;
const STORE_NAME = "session-credentials";

interface StoredSessionCredential {
  key: string;
  activeSessionId: string;
  updatedAt: number;
}

function openCredentialDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(new Error("ATTEMPT_SESSION_STORAGE_UNAVAILABLE"));
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("ATTEMPT_SESSION_STORAGE_FAILED"));
    request.onblocked = () => reject(new Error("ATTEMPT_SESSION_STORAGE_BLOCKED"));
  });
}

function readCredential(db: IDBDatabase, key: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(key) as IDBRequest<StoredSessionCredential | undefined>;

    request.onsuccess = () => resolve(request.result?.activeSessionId);
    request.onerror = () => reject(request.error ?? new Error("ATTEMPT_SESSION_STORAGE_READ_FAILED"));
    transaction.onabort = () => reject(transaction.error ?? new Error("ATTEMPT_SESSION_STORAGE_READ_FAILED"));
  });
}

function writeCredential(db: IDBDatabase, value: StoredSessionCredential): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(value);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("ATTEMPT_SESSION_STORAGE_WRITE_FAILED"));
    transaction.onabort = () => reject(transaction.error ?? new Error("ATTEMPT_SESSION_STORAGE_WRITE_FAILED"));
  });
}

/**
 * Returns the stable logical credential for this authenticated Student/Assignment pair.
 * Call only after acquiring the exclusive Web Lock. Store-before-request makes an uncertain
 * network result retryable without creating a different logical session.
 */
export async function getOrCreateAttemptSessionCredential(
  studentId: number,
  assignmentId: number,
): Promise<string> {
  if (!Number.isSafeInteger(studentId) || studentId <= 0) {
    throw new Error("ATTEMPT_SESSION_STUDENT_ID_INVALID");
  }
  if (!Number.isSafeInteger(assignmentId) || assignmentId <= 0) {
    throw new Error("ATTEMPT_SESSION_ASSIGNMENT_ID_INVALID");
  }
  if (!globalThis.crypto?.randomUUID) {
    throw new Error("ATTEMPT_SESSION_CRYPTO_UNAVAILABLE");
  }

  const key = `student:${studentId}:assignment:${assignmentId}`;
  const db = await openCredentialDatabase();

  try {
    const existing = await readCredential(db, key);
    if (existing && isUuid(existing)) return existing;

    const activeSessionId = globalThis.crypto.randomUUID();
    await writeCredential(db, { key, activeSessionId, updatedAt: Date.now() });
    return activeSessionId;
  } finally {
    db.close();
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
