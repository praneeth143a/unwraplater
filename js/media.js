/**
 * Media utilities for UnwrapLater
 * Handles media upload, preview, and processing
 */
const MediaUtil = (() => {
    // Allowed media types
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
    const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    /**
     * Check if a file is a valid image or video
     * @param {File} file - File to check
     * @returns {boolean} - Whether the file is a valid media type
     */
    const isValidMediaFile = (file) => {
        if (!file) return false;
        
        // Check file type
        const isAllowedType = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].includes(file.type);
        
        // Check file size
        const isUnderSizeLimit = file.size <= MAX_FILE_SIZE;
        
        return isAllowedType && isUnderSizeLimit;
    };
    
    /**
     * Create a preview element for a media file
     * @param {File} file - Media file
     * @returns {Promise<HTMLElement>} - Promise that resolves to the preview element
     */
    const createMediaPreview = (file) => {
        return new Promise((resolve, reject) => {
            if (!isValidMediaFile(file)) {
                reject(new Error('Invalid media file'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                let previewElement;
                
                if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
                    // Create image preview
                    previewElement = document.createElement('img');
                    previewElement.src = e.target.result;
                    previewElement.alt = 'Image preview';
                } else if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
                    // Create video preview
                    previewElement = document.createElement('video');
                    previewElement.src = e.target.result;
                    previewElement.controls = true;
                    previewElement.muted = true;
                    previewElement.style.maxWidth = '100%';
                } else {
                    reject(new Error('Unsupported media type'));
                    return;
                }
                
                resolve(previewElement);
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsDataURL(file);
        });
    };
    
    /**
     * Convert a media file to a data URL
     * @param {File} file - Media file to convert
     * @returns {Promise<string>} - Promise that resolves to the data URL
     */
    const fileToDataUrl = (file) => {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file provided'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to convert file to data URL'));
            };
            
            reader.readAsDataURL(file);
        });
    };
    
    /**
     * Compress an image file
     * @param {File} file - Image file to compress
     * @param {Object} options - Compression options
     * @param {number} options.maxWidth - Maximum width (default: 800)
     * @param {number} options.maxHeight - Maximum height (default: 800)
     * @param {number} options.quality - JPEG quality (0-1, default: 0.8)
     * @returns {Promise<Blob>} - Promise that resolves to the compressed image blob
     */
    const compressImage = (file, options = {}) => {
        const {
            maxWidth = 800,
            maxHeight = 800,
            quality = 0.8
        } = options;
        
        return new Promise((resolve, reject) => {
            if (!file || !ALLOWED_IMAGE_TYPES.includes(file.type)) {
                reject(new Error('Invalid image file'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    // Calculate new dimensions
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > maxWidth || height > maxHeight) {
                        const ratio = Math.min(maxWidth / width, maxHeight / height);
                        width *= ratio;
                        height *= ratio;
                    }
                    
                    // Create canvas for compression
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw image on canvas
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to blob
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(blob);
                            } else {
                                reject(new Error('Failed to compress image'));
                            }
                        },
                        'image/jpeg',
                        quality
                    );
                };
                
                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsDataURL(file);
        });
    };
    
    /**
     * Initialize media upload listeners for a form
     * @param {HTMLInputElement} fileInput - File input element
     * @param {HTMLElement} previewContainer - Container for preview
     * @param {HTMLButtonElement} removeButton - Button to remove media
     * @param {Function} onMediaChange - Callback when media changes
     */
    const initMediaUpload = (fileInput, previewContainer, removeButton, onMediaChange) => {
        if (!fileInput || !previewContainer || !removeButton) {
            console.error('Missing required elements for media upload');
            return;
        }
        
        // File change handler
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            
            if (!file) {
                previewContainer.innerHTML = '';
                previewContainer.classList.add('hidden');
                removeButton.classList.add('hidden');
                
                if (typeof onMediaChange === 'function') {
                    onMediaChange(null);
                }
                
                return;
            }
            
            if (!isValidMediaFile(file)) {
                alert('Invalid file. Please select a valid image or video file under 10MB.');
                fileInput.value = '';
                
                if (typeof onMediaChange === 'function') {
                    onMediaChange(null);
                }
                
                return;
            }
            
            try {
                // Create and show preview
                previewContainer.innerHTML = '';
                const previewElement = await createMediaPreview(file);
                previewContainer.appendChild(previewElement);
                previewContainer.classList.remove('hidden');
                removeButton.classList.remove('hidden');
                
                if (typeof onMediaChange === 'function') {
                    onMediaChange(file);
                }
            } catch (error) {
                console.error('Failed to create media preview:', error);
                alert('Failed to preview media. Please try another file.');
                fileInput.value = '';
                
                if (typeof onMediaChange === 'function') {
                    onMediaChange(null);
                }
            }
        });
        
        // Remove button handler
        removeButton.addEventListener('click', () => {
            fileInput.value = '';
            previewContainer.innerHTML = '';
            previewContainer.classList.add('hidden');
            removeButton.classList.add('hidden');
            
            if (typeof onMediaChange === 'function') {
                onMediaChange(null);
            }
        });
    };
    
    // Public API
    return {
        isValidMediaFile,
        createMediaPreview,
        fileToDataUrl,
        compressImage,
        initMediaUpload,
        ALLOWED_IMAGE_TYPES,
        ALLOWED_VIDEO_TYPES,
        MAX_FILE_SIZE
    };
})();
