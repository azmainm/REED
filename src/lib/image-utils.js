/**
 * Image Utility Functions
 * A collection of utilities for processing, managing, and optimizing images
 * @module image-utils
 */

// Constants
const MAX_IMAGE_DIMENSION = 300;

/**
 * Compress an image by reducing its dimensions and quality
 * This function handles both base64 string images and File objects
 * 
 * @public
 * @param {string|File} input - The input image (either a base64 string or a File object)
 * @returns {Promise<string>} - Compressed base64 image with reduced dimensions and quality
 */
export async function compressImage(input) {
  return new Promise(async (resolve, reject) => {
    try {
      // Convert File to base64 if needed
      let base64Image = input;
      if (input instanceof File) {
        base64Image = await fileToBase64(input);
      }

      // Create an image element to load the base64 data
      const img = new Image();
      
      img.onload = () => {
        // Create a canvas to draw the resized image
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize the image if it's too large
        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          if (width > height) {
            height = Math.round((height / width) * MAX_IMAGE_DIMENSION);
            width = MAX_IMAGE_DIMENSION;
          } else {
            width = Math.round((width / height) * MAX_IMAGE_DIMENSION);
            height = MAX_IMAGE_DIMENSION;
          }
        }
        
        // Set canvas dimensions and draw the resized image
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert canvas to a lower quality JPEG base64 string
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };
      
      img.onerror = () => {
        console.error('Failed to load image for compression');
        // Return the original image if compression fails
        resolve(base64Image);
      };
      
      img.src = base64Image;
    } catch (error) {
      console.error('Error in image compression:', error);
      // Return the original input if there's an error
      if (input instanceof File) {
        fileToBase64(input).then(resolve).catch(() => reject(error));
      } else {
        resolve(input);
      }
    }
  });
}

/**
 * Convert a File object to a base64 string representation
 * 
 * @public
 * @param {File} file - The file to convert to base64
 * @returns {Promise<string>} - Base64 string representation of the file
 * @throws {Error} If there's an error reading the file
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

/**
 * Calculate the dimensions for resizing an image while maintaining aspect ratio
 * 
 * @public
 * @param {number} originalWidth - Original width of the image
 * @param {number} originalHeight - Original height of the image
 * @param {number} maxDimension - Maximum dimension (width or height) allowed
 * @returns {Object} - Object containing the new width and height
 */
export function calculateResizedDimensions(originalWidth, originalHeight, maxDimension = MAX_IMAGE_DIMENSION) {
  let width = originalWidth;
  let height = originalHeight;
  
  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height / width) * maxDimension);
      width = maxDimension;
    } else {
      width = Math.round((width / height) * maxDimension);
      height = maxDimension;
    }
  }
  
  return { width, height };
}