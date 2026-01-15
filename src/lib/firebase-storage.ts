import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import app from './firebase';

// Initialize Firebase Storage
export const storage = getStorage(app);

// Types
interface UploadSettings {
  folder: string;
  maxSize: number;
  recommendedSize: string;
  acceptedTypes: string[];
}

/**
 * Upload image to Firebase Storage
 */
export async function uploadImage(file: File, folder: string = 'images', fileName: string | null = null): Promise<string> {
  try {
    // No authentication required for ai-web-builder uploads (public access like Firestore)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload a valid image file (JPG, PNG, GIF, WebP)');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('Image file size must be less than 5MB');
    }

    // Generate unique filename if not provided
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const fileExtension = file.name.split('.').pop();
    const finalFileName = fileName || `${timestamp}_${randomString}.${fileExtension}`;

    // Create storage reference
    const storageRef = ref(storage, `ai-web-builder/${folder}/${finalFileName}`);

    // Upload file
    console.log(`Uploading image to: ai-web-builder/${folder}/${finalFileName}`);
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Image uploaded successfully:', downloadURL);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Upload PDF document to Firebase Storage
 */
export async function uploadPDF(file: File, folder: string = 'documents', fileName: string | null = null): Promise<string> {
  try {
    // No authentication required for ai-web-builder uploads (public access like Firestore)

    // Validate file type
    if (file.type !== 'application/pdf') {
      throw new Error('Please upload a valid PDF file');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('PDF file size must be less than 10MB');
    }

    // Generate unique filename if not provided
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const finalFileName = fileName || `${timestamp}_${randomString}.pdf`;

    // Create storage reference
    const storageRef = ref(storage, `ai-web-builder/${folder}/${finalFileName}`);

    // Upload file
    console.log(`Uploading PDF to: ai-web-builder/${folder}/${finalFileName}`);
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('PDF uploaded successfully:', downloadURL);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
}

/**
 * Delete file from Firebase Storage
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    // No authentication required for ai-web-builder uploads (public access like Firestore)

    // Extract path from URL
    const httpsReference = ref(storage, url);
    
    // Delete the file
    await deleteObject(httpsReference);
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Get optimized image upload settings
 */
export function getImageUploadSettings(type: string): UploadSettings {
  const settings: Record<string, UploadSettings> = {
    logo: {
      folder: 'logos',
      maxSize: 2 * 1024 * 1024, // 2MB
      recommendedSize: '500x500px',
      acceptedTypes: ['image/png', 'image/jpeg', 'image/svg+xml']
    },
    product: {
      folder: 'products',
      maxSize: 5 * 1024 * 1024, // 5MB
      recommendedSize: '1200x800px',
      acceptedTypes: ['image/jpeg', 'image/png', 'image/webp']
    },
    certificate: {
      folder: 'certificates',
      maxSize: 5 * 1024 * 1024, // 5MB
      recommendedSize: '1200x900px',
      acceptedTypes: ['image/jpeg', 'image/png']
    },
    team: {
      folder: 'team',
      maxSize: 2 * 1024 * 1024, // 2MB
      recommendedSize: '400x400px',
      acceptedTypes: ['image/jpeg', 'image/png']
    },
    document: {
      folder: 'documents',
      maxSize: 10 * 1024 * 1024, // 10MB
      recommendedSize: 'Any size',
      acceptedTypes: ['application/pdf']
    }
  };

  return settings[type] || settings.product;
}