// Storage utility functions for handling file operations and temporary storage

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  expiresAt: Date;
}

export interface ProcessedFile {
  originalId: string;
  processedPath: string;
  downloadUrl: string;
  expiresAt: Date;
}

// Local storage utilities for client-side state management
export class LocalStorageManager {
  private static readonly UPLOAD_HISTORY_KEY = 'viddonloader_upload_history';
  private static readonly PROCESSING_JOBS_KEY = 'viddonloader_processing_jobs';
  private static readonly USER_PREFERENCES_KEY = 'viddonloader_preferences';

  static saveUploadHistory(file: FileMetadata): void {
    try {
      const history = this.getUploadHistory();
      history.unshift(file);
      
      // Keep only last 10 uploads
      const trimmedHistory = history.slice(0, 10);
      
      localStorage.setItem(
        this.UPLOAD_HISTORY_KEY, 
        JSON.stringify(trimmedHistory)
      );
    } catch (error) {
      console.warn('Failed to save upload history:', error);
    }
  }

  static getUploadHistory(): FileMetadata[] {
    try {
      const history = localStorage.getItem(this.UPLOAD_HISTORY_KEY);
      if (!history) return [];
      
      const parsed = JSON.parse(history);
      return parsed.map((item: any) => ({
        ...item,
        uploadedAt: new Date(item.uploadedAt),
        expiresAt: new Date(item.expiresAt),
      }));
    } catch (error) {
      console.warn('Failed to load upload history:', error);
      return [];
    }
  }

  static clearUploadHistory(): void {
    try {
      localStorage.removeItem(this.UPLOAD_HISTORY_KEY);
    } catch (error) {
      console.warn('Failed to clear upload history:', error);
    }
  }

  static saveProcessingJob(jobId: string, metadata: any): void {
    try {
      const jobs = this.getProcessingJobs();
      jobs[jobId] = {
        ...metadata,
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem(
        this.PROCESSING_JOBS_KEY,
        JSON.stringify(jobs)
      );
    } catch (error) {
      console.warn('Failed to save processing job:', error);
    }
  }

  static getProcessingJobs(): Record<string, any> {
    try {
      const jobs = localStorage.getItem(this.PROCESSING_JOBS_KEY);
      return jobs ? JSON.parse(jobs) : {};
    } catch (error) {
      console.warn('Failed to load processing jobs:', error);
      return {};
    }
  }

  static removeProcessingJob(jobId: string): void {
    try {
      const jobs = this.getProcessingJobs();
      delete jobs[jobId];
      
      localStorage.setItem(
        this.PROCESSING_JOBS_KEY,
        JSON.stringify(jobs)
      );
    } catch (error) {
      console.warn('Failed to remove processing job:', error);
    }
  }

  static saveUserPreferences(preferences: Record<string, any>): void {
    try {
      const currentPrefs = this.getUserPreferences();
      const updatedPrefs = { ...currentPrefs, ...preferences };
      
      localStorage.setItem(
        this.USER_PREFERENCES_KEY,
        JSON.stringify(updatedPrefs)
      );
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  }

  static getUserPreferences(): Record<string, any> {
    try {
      const prefs = localStorage.getItem(this.USER_PREFERENCES_KEY);
      return prefs ? JSON.parse(prefs) : {};
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
      return {};
    }
  }
}

// File validation utilities
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = [
    'video/mp4',
    'video/avi',
    'video/quicktime',
    'video/x-msvideo'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only MP4, AVI, and MOV files are supported.'
    };
  }
  
  // Check file size (500MB limit)
  const maxSize = 500 * 1024 * 1024; // 500MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds the 500MB limit.'
    };
  }
  
  // Check for minimum file size (avoid empty files)
  const minSize = 1024; // 1KB
  if (file.size < minSize) {
    return {
      valid: false,
      error: 'File is too small or corrupted.'
    };
  }
  
  return { valid: true };
}

// File name sanitization
export function sanitizeFileName(fileName: string): string {
  // Remove dangerous characters and limit length
  const sanitized = fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100);
  
  // Ensure file has an extension
  if (!sanitized.includes('.')) {
    return sanitized + '.mp4';
  }
  
  return sanitized;
}

// Generate unique file identifiers
export function generateFileId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}`;
}

// Calculate file expiration (12 hours from now)
export function calculateExpirationTime(): Date {
  const now = new Date();
  return new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours
}

// Check if file has expired
export function isFileExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

// Format time remaining until expiration
export function formatTimeRemaining(expiresAt: Date): string {
  const now = new Date();
  const remaining = expiresAt.getTime() - now.getTime();
  
  if (remaining <= 0) {
    return 'Expired';
  }
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

// Create download blob URL for processed files
export function createDownloadUrl(blob: Blob, fileName: string): string {
  const url = URL.createObjectURL(blob);
  
  // Clean up URL after 1 hour to prevent memory leaks
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60 * 60 * 1000);
  
  return url;
}

// Download file helper
export function downloadFile(url: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
}

// Calculate compression ratio
export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}

// Estimate upload time based on file size and connection speed
export function estimateUploadTime(fileSize: number, connectionSpeedMbps: number = 10): number {
  const fileSizeMb = fileSize / (1024 * 1024);
  const uploadTimeSeconds = (fileSizeMb * 8) / connectionSpeedMbps; // Convert to bits and divide by speed
  return Math.ceil(uploadTimeSeconds);
}

// Clean up expired files from local storage
export function cleanupExpiredFiles(): void {
  try {
    const history = LocalStorageManager.getUploadHistory();
    const validHistory = history.filter(file => !isFileExpired(file.expiresAt));
    
    if (validHistory.length !== history.length) {
      localStorage.setItem(
        'viddonloader_upload_history',
        JSON.stringify(validHistory)
      );
    }
    
    // Clean up expired processing jobs
    const jobs = LocalStorageManager.getProcessingJobs();
    const validJobs: Record<string, any> = {};
    
    Object.entries(jobs).forEach(([jobId, job]) => {
      const createdAt = new Date(job.createdAt);
      const expiresAt = new Date(createdAt.getTime() + 12 * 60 * 60 * 1000);
      
      if (!isFileExpired(expiresAt)) {
        validJobs[jobId] = job;
      }
    });
    
    if (Object.keys(validJobs).length !== Object.keys(jobs).length) {
      localStorage.setItem(
        'viddonloader_processing_jobs',
        JSON.stringify(validJobs)
      );
    }
  } catch (error) {
    console.warn('Failed to cleanup expired files:', error);
  }
}

// Initialize storage cleanup on app start
export function initializeStorageCleanup(): void {
  // Clean up immediately
  cleanupExpiredFiles();
  
  // Set up periodic cleanup every 30 minutes
  setInterval(cleanupExpiredFiles, 30 * 60 * 1000);
}
