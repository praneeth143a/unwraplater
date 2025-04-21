/**
 * Cryptography Manager
 * Handles encryption/decryption using Web Crypto API
 */

class CryptoManager {
    constructor() {
        // Check if Web Crypto API is available
        if (!window.crypto || !window.crypto.subtle) {
            console.error('Web Crypto API is not supported in this browser.');
        }
    }
    
    /**
     * Generate a key from a passphrase
     * @param {string} passphrase - User-provided passphrase
     * @returns {Promise<CryptoKey>} - Derived key
     */
    async generateKeyFromPassphrase(passphrase) {
        try {
            // Convert passphrase to ArrayBuffer
            const encoder = new TextEncoder();
            const passphraseBuffer = encoder.encode(passphrase);
            
            // Generate a key using PBKDF2
            const salt = encoder.encode('UnwrapLater Salt'); // Fixed salt for simplicity
            const keyMaterial = await window.crypto.subtle.importKey(
                'raw',
                passphraseBuffer,
                { name: 'PBKDF2' },
                false,
                ['deriveKey']
            );
            
            // Derive the actual key
            return window.crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt', 'decrypt']
            );
        } catch (error) {
            console.error('Error generating key from passphrase:', error);
            throw error;
        }
    }
    
    /**
     * Encrypt a message with a passphrase
     * @param {string} message - Message to encrypt
     * @param {string} passphrase - Passphrase to use for encryption
     * @returns {Promise<string>} - Base64-encoded encrypted data
     */
    async encryptMessage(message, passphrase) {
        try {
            // Generate key from passphrase
            const key = await this.generateKeyFromPassphrase(passphrase);
            
            // Generate initialization vector (IV)
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            
            // Encrypt the message
            const encoder = new TextEncoder();
            const messageBuffer = encoder.encode(message);
            
            const encryptedBuffer = await window.crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                messageBuffer
            );
            
            // Combine IV and encrypted data
            const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
            combined.set(iv, 0);
            combined.set(new Uint8Array(encryptedBuffer), iv.length);
            
            // Convert to Base64
            return this.arrayBufferToBase64(combined.buffer);
        } catch (error) {
            console.error('Error encrypting message:', error);
            throw error;
        }
    }
    
    /**
     * Decrypt an encrypted message with a passphrase
     * @param {string} encryptedBase64 - Base64-encoded encrypted data
     * @param {string} passphrase - Passphrase to use for decryption
     * @returns {Promise<string>} - Decrypted message
     */
    async decryptMessage(encryptedBase64, passphrase) {
        try {
            // Convert Base64 to ArrayBuffer
            const encryptedBuffer = this.base64ToArrayBuffer(encryptedBase64);
            
            // Extract IV and encrypted data
            const iv = encryptedBuffer.slice(0, 12);
            const encryptedData = encryptedBuffer.slice(12);
            
            // Generate key from passphrase
            const key = await this.generateKeyFromPassphrase(passphrase);
            
            // Decrypt the message
            const decryptedBuffer = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                encryptedData
            );
            
            // Convert to string
            const decoder = new TextDecoder();
            return decoder.decode(decryptedBuffer);
        } catch (error) {
            console.error('Error decrypting message:', error);
            throw new Error('Invalid passphrase or corrupted data');
        }
    }
    
    /**
     * Convert ArrayBuffer to Base64 string
     * @param {ArrayBuffer} buffer - Buffer to convert
     * @returns {string} - Base64 string
     */
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
    
    /**
     * Convert Base64 string to ArrayBuffer
     * @param {string} base64 - Base64 string to convert
     * @returns {ArrayBuffer} - Converted ArrayBuffer
     */
    base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
    
    /**
     * Generate a compact link-friendly hash for sharing
     * @param {string} data - Data to hash (usually the full capsule JSON)
     * @returns {Promise<string>} - Short hash for use in URL fragment
     */
    async generateShortHash(data) {
        try {
            // Use SHA-256 for hashing
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);
            
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
            
            // Convert to Base64 and shorten
            const base64 = this.arrayBufferToBase64(hashBuffer);
            
            // Use first 12 characters for a reasonably short hash
            // This is not for security, just for creating short links
            return base64.substring(0, 12).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        } catch (error) {
            console.error('Error generating short hash:', error);
            throw error;
        }
    }
}

// Create and export crypto manager
const cryptoManager = new CryptoManager();
window.cryptoManager = cryptoManager; 