import { existsSync, readFileSync } from "fs";
import { isAbsolute, resolve } from "path";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

const DATABASE_ID = process.env.FIREBASE_DATABASE_ID || "vapelizer";
const STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "vapelizer-store.firebasestorage.app";

function resolveCredentialPath(filePath: string) {
  return isAbsolute(filePath) ? filePath : resolve(process.cwd(), filePath);
}

function loadCredential() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) return cert(JSON.parse(json));

  const configured = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (configured) {
    const absolute = resolveCredentialPath(configured);
    if (existsSync(absolute)) {
      return cert(JSON.parse(readFileSync(absolute, "utf8")));
    }
  }

  const fallback = resolveCredentialPath("service-account.json");
  if (existsSync(fallback)) {
    return cert(JSON.parse(readFileSync(fallback, "utf8")));
  }

  return undefined;
}

function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const credential = loadCredential();
  if (!credential) {
    throw new Error(
      "Firebase Admin is not configured. Add service-account.json or FIREBASE_SERVICE_ACCOUNT_JSON.",
    );
  }

  return initializeApp({
    credential,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "vapelizer-store",
    storageBucket: STORAGE_BUCKET,
  });
}

export function adminConfigured() {
  try {
    return Boolean(loadCredential());
  } catch {
    return false;
  }
}

export function db(): Firestore {
  return getFirestore(getAdminApp(), DATABASE_ID);
}

export function storage(): Storage {
  return getStorage(getAdminApp());
}

export function storageBucketName() {
  return STORAGE_BUCKET;
}

export function missingDatabaseMessage() {
  return "Firebase Admin is not configured. Add service-account.json for local use, or deploy with App Hosting credentials.";
}
