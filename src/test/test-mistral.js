// Test script for Mistral API integration
require('dotenv').config({ path: '.env.local' });
const { OpenAI } = require('openai');

async function testMistralAPI() {
  try {
    console.log('Testing Mistral API integration...');

    if (!process.env.MISTRAL_API_KEY) {
      console.error('MISTRAL_API_KEY environment variable is missing');
      throw new Error('API key configuration is missing. Please add MISTRAL_API_KEY to your environment variables');
    }

    // Sample educational text for testing
    const testText = `
      Photosynthesis is the process by which green plants, algae, and certain bacteria convert light energy, 
      usually from the sun, into chemical energy in the form of carbohydrates. During photosynthesis, 
      organisms take in carbon dioxide and water, using the energy from sunlight to convert them into glucose and oxygen.
      The chemical equation for photosynthesis is: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2.
    `;

    // Create a prompt for educational dialogue in Socratic style
    const prompt = `
      You are creating an interactive educational dialogue in the Socratic style between a teacher and a student.
      The dialogue should be about the following content:
      
      """
      ${testText}
      """
      
      Create a conversation with the following characteristics:
      1. Start with a friendly greeting between teacher and student
      2. The teacher should guide the student through a series of questions that help them discover the key concepts themselves
      3. Follow the Socratic method where questions lead to critical thinking and insight
      4. Structure the dialogue as a back-and-forth conversation with clear speaker labels
      5. Include 5-7 exchanges that cover the main points from the text
      6. Conclude with a friendly goodbye
      7. Format the dialogue with clear speaker identifiers (Teacher: / Student:)
      
      The dialogue should feel natural and engaging.
      IMPORTANT: Return ONLY the dialogue content, with no additional text or commentary.
    `;

    // Initialize Mistral client
    const mistralClient = new OpenAI({
      baseURL: "https://api.mistral.ai/v1",
      apiKey: process.env.MISTRAL_API_KEY,
    });

    console.log('Sending request to Mistral API...');

    // Call Mistral API
    const completion = await mistralClient.chat.completions.create({
      model: "mistral-large-latest",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    // Extract the generated content
    const generatedText = completion.choices[0].message.content;
    
    console.log('\n=== Generated Dialogue ===\n');
    console.log(generatedText);
    console.log('\n==========================\n');
    
    console.log('API test completed successfully');
    
    // Parse the dialogue to verify format
    const lines = generatedText.trim().split('\n');
    const speakers = lines
      .filter(line => line.trim().startsWith('Teacher:') || line.trim().startsWith('Student:'))
      .map(line => line.split(':')[0].trim());
    
    console.log(`Found ${speakers.length} dialogue exchanges`);
    console.log('Format validation:', speakers.length > 0 ? 'PASSED' : 'FAILED');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMistralAPI(); 