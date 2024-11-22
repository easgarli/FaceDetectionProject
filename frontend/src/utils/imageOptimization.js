/**
 * Utility functions for client-side image optimization
 */

// Maximum dimensions for different use cases
const MAX_DIMENSIONS = {
    thumbnail: { width: 300, height: 300 },
    preview: { width: 800, height: 800 },
    fullscreen: { width: 1920, height: 1080 }
};

// Supported image types
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Compress and resize an image before upload
 * @param {File} file - Original image file
 * @param {Object} options - Optimization options
 * @returns {Promise<Blob>} - Optimized image blob
 */
export const optimizeImage = async (file, options = {}) => {
    const {
        maxWidth = MAX_DIMENSIONS.preview.width,
        maxHeight = MAX_DIMENSIONS.preview.height,
        quality = 0.8,
        format = 'image/jpeg'
    } = options;

    // Validate file type
    if (!SUPPORTED_TYPES.includes(file.type)) {
        throw new Error('Unsupported image type');
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                // Calculate new dimensions
                const { width, height } = calculateDimensions(
                    img.width,
                    img.height,
                    maxWidth,
                    maxHeight
                );

                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                // Draw and compress image
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Image optimization failed'));
                        }
                    },
                    format,
                    quality
                );
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
    });
};

/**
 * Calculate new dimensions maintaining aspect ratio
 */
const calculateDimensions = (width, height, maxWidth, maxHeight) => {
    let newWidth = width;
    let newHeight = height;

    if (width > maxWidth) {
        newWidth = maxWidth;
        newHeight = (height * maxWidth) / width;
    }

    if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = (width * maxHeight) / height;
    }

    return {
        width: Math.round(newWidth),
        height: Math.round(newHeight)
    };
};

/**
 * Create a thumbnail from an image file
 */
export const createThumbnail = async (file) => {
    return optimizeImage(file, {
        maxWidth: MAX_DIMENSIONS.thumbnail.width,
        maxHeight: MAX_DIMENSIONS.thumbnail.height,
        quality: 0.7,
        format: 'image/jpeg'
    });
};

/**
 * Optimize multiple images in parallel
 */
export const optimizeMultipleImages = async (files, options) => {
    const optimizationPromises = Array.from(files).map(file => 
        optimizeImage(file, options)
    );
    return Promise.all(optimizationPromises);
};

/**
 * Convert a blob to a data URL
 */
export const blobToDataURL = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
        reader.readAsDataURL(blob);
    });
};

/**
 * Check if image dimensions exceed maximum allowed
 */
export const validateImageDimensions = async (file) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve({
                width: img.width,
                height: img.height,
                exceedsMax: (
                    img.width > MAX_DIMENSIONS.fullscreen.width ||
                    img.height > MAX_DIMENSIONS.fullscreen.height
                )
            });
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to load image for validation'));
        };

        img.src = objectUrl;
    });
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Usage example:
/*
import { optimizeImage, createThumbnail } from '../utils/imageOptimization';

const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    
    try {
        // Validate file size and dimensions
        if (file.size > 10 * 1024 * 1024) { // 10MB
            throw new Error('File too large');
        }

        const dimensions = await validateImageDimensions(file);
        if (dimensions.exceedsMax) {
            console.warn('Image will be resized');
        }

        // Create thumbnail for preview
        const thumbnail = await createThumbnail(file);
        const thumbnailUrl = URL.createObjectURL(thumbnail);

        // Optimize image for upload
        const optimizedImage = await optimizeImage(file, {
            maxWidth: 1600,
            maxHeight: 1600,
            quality: 0.85
        });

        // Upload optimized image
        const formData = new FormData();
        formData.append('photo', optimizedImage, file.name);
        
        // ... handle upload

    } catch (error) {
        console.error('Image processing failed:', error);
    }
};
*/
