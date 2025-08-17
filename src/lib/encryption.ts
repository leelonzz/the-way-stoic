import { AES, enc } from 'crypto-js'

// Get encryption key from environment or generate a default one
// In production, this should be a proper secret key from environment variables
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY || 'stoic-zenith-default-key-change-in-production'

export function encryptData(data: string): string {
  try {
    return AES.encrypt(data, ENCRYPTION_KEY).toString()
  } catch (error) {
    return data // Fallback to unencrypted data if encryption fails
  }
}

export function decryptData(encryptedData: string): string {
  try {
    const decrypted = AES.decrypt(encryptedData, ENCRYPTION_KEY)
    return decrypted.toString(enc.Utf8)
  } catch (error) {
    return encryptedData // Fallback to original data if decryption fails
  }
}

// Secure localStorage wrapper
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      const encryptedValue = encryptData(value)
      localStorage.setItem(key, encryptedValue)
    } catch (error) {
      // Fallback to regular localStorage
      localStorage.setItem(key, value)
    }
  },

  getItem: (key: string): string | null => {
    try {
      const encryptedValue = localStorage.getItem(key)
      if (!encryptedValue) return null
      
      // Try to decrypt, if it fails, assume it's unencrypted legacy data
      const decrypted = decryptData(encryptedValue)
      
      // If decryption returns empty string, return null
      if (!decrypted) return null
      
      return decrypted
    } catch (error) {
      return localStorage.getItem(key) // Fallback to regular retrieval
    }
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key)
  },

  clear: (): void => {
    localStorage.clear()
  }
}

// User-specific storage keys
export function getUserStorageKey(userId: string, key: string): string {
  return `user:${userId}:${key}`
}