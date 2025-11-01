import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from './config';

// Upload a file to Firebase Storage
export const uploadFile = async (file, path, onProgress = null) => {
  const storageRef = ref(storage, path);
  
  if (onProgress) {
    // Use resumable upload with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ url: downloadURL, ref: storageRef });
        }
      );
    });
  } else {
    // Simple upload without progress
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { url: downloadURL, ref: storageRef };
  }
};

// Upload context files (slides, CSV, etc.) for a session
export const uploadContextFile = async (sessionId, file, onProgress = null) => {
  const path = `sessions/${sessionId}/context/${file.name}`;
  return uploadFile(file, path, onProgress);
};

// Get download URL for a file
export const getFileURL = async (path) => {
  const fileRef = ref(storage, path);
  return await getDownloadURL(fileRef);
};

// Delete a file
export const deleteFile = async (path) => {
  const fileRef = ref(storage, path);
  await deleteObject(fileRef);
};

// Supported file types for context upload
export const SUPPORTED_FILE_TYPES = {
  PDF: 'application/pdf',
  PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  PPT: 'application/vnd.ms-powerpoint',
  CSV: 'text/csv',
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  XLS: 'application/vnd.ms-excel',
  TXT: 'text/plain',
  MD: 'text/markdown'
};

export const isFileTypeSupported = (fileType) => {
  return Object.values(SUPPORTED_FILE_TYPES).includes(fileType);
};

