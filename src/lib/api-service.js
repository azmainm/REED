/**
 * API Service for Socrati
 * Handles all backend API calls and data processing
 */

import { firestore } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Backend API base URL - can be configured based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Default timeout for API calls (30 seconds)
const API_TIMEOUT = 30000;
// Maximum number of retries
const MAX_RETRIES = 2;
// Maximum image dimension (width or height) for cover images
const MAX_IMAGE_DIMENSION = 800;

/**
 * Compress an image by reducing its dimensions and quality
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
 * Extract text from a PDF file
 * @param {File} file - The PDF file to extract text from
 * @returns {Promise<Object>} - The extraction result
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
 * Generate a reed using the extracted text and selected style
 * @param {string} extractedText - The text extracted from uploaded documents
 * @param {string} style - The style of reed to generate (Socratic or Platonic)
 * @param {number} retryCount - Current retry attempt (used internally)
 * @returns {Promise<Object>} - The generated reed
 */
export async function generateReed(extractedText, style, retryCount = 0) {
  try {
    
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
 * @param {string} extractedText - The text extracted from uploaded documents
 * @param {string} style - The style of reed to generate (Socratic or Platonic)
 * @returns {Promise<Object>} - The LLM generated reed
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
 * Format the raw dialogue into a more structured format for the application
 * @param {string} dialogueText - The raw dialogue text from the LLM
 * @returns {Object} - Structured dialogue object
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
 * @param {Object} formattedDialogue - The formatted dialogue object
 * @returns {string} - JSON string of the dialogue
 */
export function dialogueToJsonString(formattedDialogue) {
  return JSON.stringify(formattedDialogue, null, 2);
}

/**
 * Save a completed reed to Firestore directly from the frontend
 * @param {Object} reedData - The reed data to save
 * @returns {Promise<Object>} - The save result
 */
export async function saveReedToFirestore(reedData) {
  try {
    let coverImageUrl = reedData.coverImageUrl;
    
    // If we have a base64 image, compress it before saving to Firestore
    // This helps avoid exceeding Firestore's document size limit (1MB)
    if (coverImageUrl && coverImageUrl.startsWith('data:image')) {
      try {
        // Compress the image to reduce size
        coverImageUrl = await compressImage(coverImageUrl);
      } catch (error) {
        console.error("Error compressing image:", error);
        // Continue with the original image if compression fails
      }
    }
    
    // Create reed document with all relevant fields
    const firestoreData = {
      title: reedData.title,
      description: reedData.description,
      category: reedData.category,
      dialogues: reedData.dialogues,
      userName: reedData.userName,
      authorName: reedData.authorName || reedData.userName, // Use provided authorName or fallback to userName
      userId: reedData.userId, // Store userId for easier querying
      coverImageUrl: coverImageUrl, // Store the base64 string directly
      postedOn: serverTimestamp(),
      lastUpdated: serverTimestamp(),
      likes: 0,
      views: 0,
      totalDialogues: reedData.dialogues.length,
      isPublished: true,
      tags: [reedData.category.toLowerCase()], // Add tags for filtering
    };
    
    // Save to Firestore directly
    const docRef = await addDoc(collection(firestore, 'reeds'), firestoreData);
    
    // Return success response with document ID
    return {
      success: true,
      reedId: docRef.id,
      message: 'Reed saved successfully'
    };
  } catch (error) {
    console.error('Error saving reed to Firestore:', error);
    throw error;
  }
}

/**
 * Additional API methods can be added here
 */ 