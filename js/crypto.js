/**
 * CryptoManager
 * Handles encryption/decryption for securing messages in the UnwrapLater app
 */
const CryptoManager = (() => {
    // Check for Web Crypto API support
    if (!window.crypto || !window.crypto.subtle) {
        console.error('Web Crypto API not supported in this browser');
        alert('Your browser does not support the security features required by this app. Please use a modern browser.');
        return null;
    }

    // Constants for encryption
    const ALGORITHM = 'AES-GCM';
    const KEY_LENGTH = 256;
    const SALT_LENGTH = 16;
    const IV_LENGTH = 12;

    /**
     * Generate a secure key from a password
     * @param {string} password - Password to derive key from
     * @param {Uint8Array} salt - Salt for key derivation
     * @returns {Promise<CryptoKey>} Derived key
     */
    const deriveKey = async (password, salt) => {
        // Convert password to buffer
        const passwordBuffer = new TextEncoder().encode(password);
        
        // Import as base key material
        const baseKey = await window.crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );
        
        // Derive the key using PBKDF2
        return window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            baseKey,
            { name: ALGORITHM, length: KEY_LENGTH },
            false,
            ['encrypt', 'decrypt']
        );
    };

    /**
     * Encrypt message with password
     * @param {string} message - Message to encrypt
     * @param {string} password - Password for encryption
     * @returns {Promise<string>} Base64 encoded encrypted data
     */
    const encryptMessage = async (message, password) => {
        try {
            // Generate random salt and IV
            const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
            const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
            
            // Derive key from password
            const key = await deriveKey(password, salt);
            
            // Encrypt the message
            const messageBuffer = new TextEncoder().encode(message);
            const encryptedBuffer = await window.crypto.subtle.encrypt(
                {
                    name: ALGORITHM,
                    iv: iv
                },
                key,
                messageBuffer
            );
            
            // Combine salt, IV, and encrypted data into one buffer
            const resultBuffer = new Uint8Array(SALT_LENGTH + IV_LENGTH + encryptedBuffer.byteLength);
            resultBuffer.set(salt, 0);
            resultBuffer.set(iv, SALT_LENGTH);
            resultBuffer.set(new Uint8Array(encryptedBuffer), SALT_LENGTH + IV_LENGTH);
            
            // Convert to Base64 string for storage
            return btoa(String.fromCharCode.apply(null, resultBuffer));
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Failed to encrypt message');
        }
    };

    /**
     * Decrypt message with password
     * @param {string} encryptedData - Base64 encoded encrypted data
     * @param {string} password - Password for decryption
     * @returns {Promise<string>} Decrypted message
     */
    const decryptMessage = async (encryptedData, password) => {
        try {
            // Convert from Base64 to buffer
            const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
            
            // Extract salt, IV, and encrypted data
            const salt = encryptedBuffer.slice(0, SALT_LENGTH);
            const iv = encryptedBuffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
            const data = encryptedBuffer.slice(SALT_LENGTH + IV_LENGTH);
            
            // Derive key from password
            const key = await deriveKey(password, salt);
            
            // Decrypt the message
            const decryptedBuffer = await window.crypto.subtle.decrypt(
                {
                    name: ALGORITHM,
                    iv: iv
                },
                key,
                data
            );
            
            // Convert decrypted buffer to string
            return new TextDecoder().decode(decryptedBuffer);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Failed to decrypt message: Incorrect password or corrupted data');
        }
    };

    /**
     * Generate a random password
     * @param {number} length - Length of password to generate
     * @returns {string} Random password
     */
    const generateRandomPassword = (length = 12) => {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
        let password = '';
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        
        for (let i = 0; i < length; i++) {
            password += charset[array[i] % charset.length];
        }
        
        return password;
    };

    // Public API
    return {
        encryptMessage,
        decryptMessage,
        generateRandomPassword
    };
})();

/**
 * Cryptography utilities for UnwrapLater
 * Simple encryption/decryption tools for securing time capsule content
 */
const CryptoUtil = (() => {
    /**
     * Encrypt data with a passphrase
     * @param {string} data - Data to encrypt
     * @param {string} passphrase - Passphrase for encryption
     * @returns {string} - Encrypted data
     */
    const encrypt = (data, passphrase) => {
        if (!data || !passphrase) {
            return data;
        }
        
        try {
            // For demo purposes, we're using a simple base64 encoding with the passphrase as a prefix
            // In a real app, you'd use a proper crypto library with stronger encryption
            const encodedData = btoa(data);
            const encodedPassphrase = btoa(passphrase);
            const prefix = encodedPassphrase.substring(0, 8);
            
            return `${prefix}:${encodedData}`;
        } catch (e) {
            console.error('Encryption error:', e);
            return data;
        }
    };
    
    /**
     * Decrypt data with a passphrase
     * @param {string} encryptedData - Encrypted data
     * @param {string} passphrase - Passphrase for decryption
     * @returns {string|null} - Decrypted data or null if decryption failed
     */
    const decrypt = (encryptedData, passphrase) => {
        if (!encryptedData || !passphrase) {
            return null;
        }
        
        try {
            // Parse encrypted data
            const [prefix, encodedData] = encryptedData.split(':');
            const encodedPassphrase = btoa(passphrase);
            
            // Verify passphrase
            if (encodedPassphrase.substring(0, 8) !== prefix) {
                return null; // Invalid passphrase
            }
            
            // Decrypt (in this case, just decode from base64)
            return atob(encodedData);
        } catch (e) {
            console.error('Decryption error:', e);
            return null;
        }
    };
    
    /**
     * Simple hash function for generating IDs
     * @param {string} input - String to hash
     * @returns {string} - Hash string
     */
    const hash = (input) => {
        let hash = 0;
        if (!input.length) return hash.toString(36);
        
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        // Combine with timestamp for uniqueness
        const timestamp = Date.now().toString(36);
        return Math.abs(hash).toString(36) + timestamp;
    };
    
    /**
     * Generate a random ID
     * @param {number} length - Length of ID (default: 16)
     * @returns {string} - Random ID
     */
    const generateId = (length = 16) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        // Get cryptographically strong random values if available
        if (window.crypto && window.crypto.getRandomValues) {
            const values = new Uint32Array(length);
            window.crypto.getRandomValues(values);
            
            for (let i = 0; i < length; i++) {
                result += chars[values[i] % chars.length];
            }
        } else {
            // Fall back to Math.random() if crypto API not available
            for (let i = 0; i < length; i++) {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        
        return result;
    };
    
    // Public API
    return {
        encrypt,
        decrypt,
        hash,
        generateId
    };
})();
