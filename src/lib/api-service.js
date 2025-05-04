/**
 * API Service for Socrati
 * Handles all backend API calls and data processing
 * @module api-service
 */

import { firestore } from './firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';

// Configuration constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = 30000;
const MAX_RETRIES = 2;
const MAX_IMAGE_DIMENSION = 800;

/**
 * Compress an image by reducing its dimensions and quality
 * @private
 * @param {string} base64Image - The base64 encoded image data
 * @returns {Promise<string>} - Compressed base64 image
 */
async function compressImage(base64Image) {
  return new Promise((resolve, reject) => {
    try {
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
        reject(new Error('Failed to load image for compression'));
      };
      
      img.src = base64Image;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Extract text from a PDF file using the backend extraction service
 * @public
 * @param {File} file - The PDF file to extract text from
 * @returns {Promise<Object>} - The extraction result containing success status and extracted text
 * @throws {Error} If the extraction process fails
 */
export async function extractPdfText(file) {
  try {
    // Create form data to send the file
    const formData = new FormData();
    formData.append('file', file);
    
    // Make the API call
    const response = await fetch(`${API_BASE_URL}/extraction/pdf`, {
      method: 'POST',
      body: formData,
    });
    
    // Parse the response
    const result = await response.json();
    
    // Check if the extraction was successful
    if (!result.success) {
      throw new Error(result.error || 'PDF extraction failed');
    }
    
    return result;
  } catch (error) {
    console.error('Error in PDF extraction API call:', error);
    throw error;
  }
}

/**
 * Generate a reed using the extracted text and selected teaching style
 * @public
 * @param {string} extractedText - The text extracted from uploaded documents
 * @param {string} style - The style of reed to generate (Socratic or Platonic)
 * @param {number} [retryCount=0] - Current retry attempt (used internally)
 * @returns {Promise<Object>} - The generated reed with success status and content
 */
export async function generateReed(extractedText, style, retryCount = 0) {
  try {
    console.log(`Attempting to generate reed with style: ${style} (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
    
    // Call our backend API for LLM generation
    const result = await generateReedWithLLM(extractedText, style);
    
    return {
      success: true,
      generatedText: result.generatedText,
      style: result.style
    };
    
  } catch (error) {
    console.error('Error in reed generation service:', error);
    
    // Retry logic for certain errors
    if (retryCount < MAX_RETRIES && 
        (error.message.includes('timeout') || 
         error.message.includes('500') || 
         error.message.includes('503'))) {
      console.log(`Retrying reed generation (${retryCount + 1}/${MAX_RETRIES})...`);
      
      // Exponential backoff: wait longer between each retry
      const backoffTime = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      
      // Try again with incremented retry count
      return generateReed(extractedText, style, retryCount + 1);
    }
    
    return {
      success: false,
      error: error.message || 'Failed to generate reed'
    };
  }
}

/**
 * Backend API call to generate reed with LLM
 * @private
 * @param {string} extractedText - The text extracted from uploaded documents
 * @param {string} style - The style of reed to generate (Socratic or Platonic)
 * @returns {Promise<Object>} - The LLM generated reed
 * @throws {Error} If the LLM generation fails
 */
export async function generateReedWithLLM(extractedText, style) {
  try {
    const response = await fetch(`${API_BASE_URL}/llm/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        extractedText,
        style
      }),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Reed generation failed');
    }
    
    return result;
  } catch (error) {
    console.error('Error generating reed with LLM:', error);
    throw error;
  }
}

/**
 * Format the raw dialogue text into a structured format for the application
 * @public
 * @param {string} dialogueText - The raw dialogue text from the LLM
 * @returns {Object} - Structured dialogue object with title, description, and dialogue array
 */
export function formatDialogue(dialogueText) {
  const lines = dialogueText.trim().split('\n');
  const formattedDialogue = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if this is a speaker line
    if (line.startsWith('Teacher:') || line.startsWith('Student:')) {
      const [speaker, ...contentParts] = line.split(':');
      let content = contentParts.join(':').trim();
      
      // Handle multi-line content
      while (i + 1 < lines.length && 
             !lines[i + 1].trim().startsWith('Teacher:') && 
             !lines[i + 1].trim().startsWith('Student:')) {
        content += '\n' + lines[i + 1].trim();
        i++;
      }
      
      formattedDialogue.push({
        speaker: speaker.toLowerCase(),
        content: content
      });
    }
  }
  
  // Fallback in case no valid dialogue format was found
  if (formattedDialogue.length === 0 && dialogueText.trim()) {
    // If there's text but no proper format, create a basic structure
    formattedDialogue.push({
      speaker: "teacher",
      content: "Let me share what I've learned about this topic."
    });
    formattedDialogue.push({
      speaker: "student",
      content: "I'd like to know more!"
    });
    formattedDialogue.push({
      speaker: "teacher",
      content: dialogueText.trim()
    });
  }
  
  return {
    title: "Interactive Dialogue",
    description: "A conversation based on the extracted text",
    dialogues: formattedDialogue
  };
}

/**
 * Convert the formatted dialogue to a JSON string representation
 * @public
 * @param {Object} formattedDialogue - The formatted dialogue object
 * @returns {string} - JSON string of the dialogue with proper indentation
 */
export function dialogueToJsonString(formattedDialogue) {
  return JSON.stringify(formattedDialogue, null, 2);
}

/**
 * Save a completed reed to Firestore directly from the frontend
 * @public
 * @param {Object} reedData - The reed data to save
 * @param {string} reedData.title - The title of the reed
 * @param {string} reedData.description - Description of the reed content
 * @param {string} reedData.category - Category of the reed
 * @param {Array} reedData.dialogues - Array of dialogue exchanges
 * @param {string} reedData.authorName - Name of the content author
 * @param {string} [reedData.coverImageUrl] - Base64 or URL of the cover image
 * @returns {Promise<Object>} - The save result with the new document ID
 * @throws {Error} If the save operation fails
 */
export async function saveReedToFirestore(reedData) {
  try {
    // Process cover image if provided (compress it)
    let coverImageUrl = reedData.coverImageUrl;
    if (coverImageUrl && coverImageUrl.startsWith('data:')) {
      try {
        coverImageUrl = await compressImage(coverImageUrl);
      } catch (error) {
        console.warn('Failed to compress cover image:', error);
        // Continue with the original image if compression fails
      }
    }
    
    // Prepare the complete data object for Firestore
    const completeReedData = {
      ...reedData,
      coverImageUrl,
      postedOn: serverTimestamp(),
      updatedOn: serverTimestamp(),
      views: 0,
      likes: 0,
      isPublished: true
    };
    
    // Add the document to Firestore
    const docRef = await addDoc(collection(firestore, "reeds"), completeReedData);
    
    console.log("Reed published with ID:", docRef.id);
    
    return {
      success: true,
      reedId: docRef.id
    };
  } catch (error) {
    console.error("Error saving reed to Firestore:", error);
    throw new Error("Failed to save reed: " + error.message);
  }
}

/**
 * Additional API methods can be added here
 */ 