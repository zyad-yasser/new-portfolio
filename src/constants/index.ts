const FIREBASE_STORAGE_BUCKET = "new-portfolio-ce4b7.firebasestorage.app";

export const getFirebaseStorageUrl = (path: string): string => {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const encodedPath = encodeURIComponent(cleanPath).replace(/%2F/g, "%2F");
  return `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o/${encodedPath}?alt=media`;
};

export const assetsPrefixUrl = "";

export const apiUrl = "";
