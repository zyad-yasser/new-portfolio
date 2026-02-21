// Firebase Storage bucket
const FIREBASE_STORAGE_BUCKET = "new-portfolio-ce4b7.firebasestorage.app";

// Helper function to generate Firebase Storage URLs
export const getFirebaseStorageUrl = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  // Encode the path for Firebase Storage
  const encodedPath = encodeURIComponent(cleanPath).replace(/%2F/g, "%2F");
  return `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o/${encodedPath}?alt=media`;
};

// For backward compatibility - use empty string and update components to use getFirebaseStorageUrl
export const assetsPrefixUrl = "";

export const apiUrl = "";
