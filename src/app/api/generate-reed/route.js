import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Set a reasonable timeout for the API call
const API_TIMEOUT = 60000; // 60 seconds

export async function POST(request) {
  try {
    const { extractedText, style } = await request.json();
    
    if (!extractedText || extractedText.trim() === '') {
      throw new Error('No text provided for reed generation');
    }
    
    if (!process.env.MISTRAL_API_KEY) {
      console.error('MISTRAL_API_KEY environment variable is missing');
      throw new Error('API key configuration is missing. Please add MISTRAL_API_KEY to your environment variables');
    }
    
    // Construct appropriate prompt based on style
    let prompt = '';
    if (style === 'Socratic') {
      prompt = constructSocraticPrompt(extractedText);
    } else {
      // Default to Platonic style
      prompt = constructPlatonicPrompt(extractedText);
    }
    
    
    try {
      // Initialize OpenAI client with Mistral configuration
      const mistralClient = new OpenAI({
        baseURL: "https://api.mistral.ai/v1",
        apiKey: process.env.MISTRAL_API_KEY,
      });

      // Set up timeout for the API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      try {
        // Call Mistral API using the OpenAI SDK
        const completion = await mistralClient.chat.completions.create({
          model: "mistral-large-latest",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          signal: controller.signal
        });

        // Clear timeout
        clearTimeout(timeoutId);
        
        // Extract the generated content
        const generatedText = completion.choices[0].message.content;
        
        if (!generatedText || generatedText.trim() === '') {
          throw new Error('Mistral API returned empty content');
        }
        
        return NextResponse.json({ 
          success: true, 
          generatedText 
        });
      } catch (err) {
        // Clear timeout if it's still active
        clearTimeout(timeoutId);
        
        // Handle abort error separately
        if (err.name === 'AbortError') {
          throw new Error('Request to Mistral API timed out after 60 seconds');
        }
        throw err;
      }
    } catch (fetchError) {
      console.error('Mistral API error:', fetchError);
      throw new Error(`Mistral API error: ${fetchError.message}`);
    }
  } catch (error) {
    console.error('Error generating reed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An unknown error occurred during reed generation'
      },
      { status: 500 }
    );
  }
}

// Construct a prompt for the Socratic-style dialogue (question-based approach)
function constructSocraticPrompt(extractedText) {
  return `
You are creating an interactive educational dialogue in the Socratic style between a teacher and a student. 
The dialogue should be about the following content extracted from a document:

"""
${extractedText}
"""

Create a conversation with the following characteristics:
1. Start with a friendly greeting between teacher and student
2. The teacher should guide the student through a series of questions that help them discover the key concepts themselves
3. Follow the Socratic method where questions lead to critical thinking and insight
4. Structure the dialogue as a back-and-forth conversation with clear speaker labels
5. Include 10-15 exchanges that cover the main points from the document
6. Conclude with a friendly goodbye and a summary of what was learned
7. Format the dialogue with clear speaker identifiers (Teacher: / Student:)

The dialogue should feel natural and engaging, with proper greetings and farewells.
IMPORTANT: Return ONLY the dialogue content, with no additional text, explanation, or commentary.
`;
}

// Construct a prompt for the Platonic-style dialogue (traditional format)
function constructPlatonicPrompt(extractedText) {
  return `
You are creating an interactive educational dialogue in the Platonic style between a teacher and a student.
The dialogue should be about the following content extracted from a document:

"""
${extractedText}
"""

Create a conversation with the following characteristics:
1. Start with a friendly greeting between teacher and student
2. The teacher explains concepts directly and clearly in a traditional teaching format
3. The student asks clarifying questions and demonstrates understanding gradually
4. Structure the dialogue as a back-and-forth conversation with clear speaker labels
5. Include 10-15 exchanges that cover the main points from the document
6. Conclude with a friendly goodbye and a summary of what was learned
7. Format the dialogue with clear speaker identifiers (Teacher: / Student:)

The dialogue should feel natural and engaging, with proper greetings and farewells.
IMPORTANT: Return ONLY the dialogue content, with no additional text, explanation, or commentary.
`;
} 