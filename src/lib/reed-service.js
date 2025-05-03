/**
 * Reed generation service
 * Handles API calls for generating interactive reeds
 */

// Default timeout for API calls (30 seconds)
const API_TIMEOUT = 30000;
// Maximum number of retries
const MAX_RETRIES = 2;

/**
 * Generate a reed using the extracted text and selected style
 * @param {string} extractedText - The text extracted from uploaded documents
 * @param {string} style - The teaching style (Socratic or Platonic)
 * @param {number} retryCount - Current retry attempt (used internally)
 * @returns {Promise<Object>} - The generated reed content
 */
export async function generateReed(extractedText, style, retryCount = 0) {
  // Create AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    console.log(`Attempting to generate reed (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
    
    const response = await fetch('/api/generate-reed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        extractedText,
        style,
      }),
      signal: controller.signal
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Reed generation failed');
    }
    
    return data;
  } catch (error) {
    // Clear timeout if it's still active
    clearTimeout(timeoutId);
    
    // Handle timeout errors
    if (error.name === 'AbortError') {
      console.error('Reed generation request timed out');
      error.message = 'Request timed out. The server is taking too long to respond.';
    }
    
    console.error('Error in reed generation service:', error);
    
    // Retry logic for certain errors
    if (retryCount < MAX_RETRIES && 
        (error.name === 'AbortError' || 
         error.message.includes('500') || 
         error.message.includes('503'))) {
      console.log(`Retrying reed generation (${retryCount + 1}/${MAX_RETRIES})...`);
      
      // Exponential backoff: wait longer between each retry
      const backoffTime = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      
      // Try again with incremented retry count
      return generateReed(extractedText, style, retryCount + 1);
    }
    
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