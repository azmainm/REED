# Socrati Frontend

This is the frontend for the Socrati platform, an interactive educational content platform.

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

## Environment Variables

Create a `.env.local` file in the root directory and add the required environment variables:

```
# Google Gemini API key for reed generation
GEMINI_API_KEY=your_gemini_api_key_here
```

You can obtain a Gemini API key from the [Google AI Studio](https://ai.google.dev/).

## Development Server

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

### Reed Creation
- Upload documents or take pictures on mobile
- Extract text with OCR
- Generate interactive dialogues with Google's Gemini API
- Edit and customize the generated content
- Publish interactive educational reeds

## Project Structure

- `/src/app` - Next.js application routes
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and services
- `/src/hooks` - Custom React hooks
- `/public` - Static assets

## Technology Stack

- Next.js
- React
- Tailwind CSS
- Google Gemini API
- Tesseract.js for OCR

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
