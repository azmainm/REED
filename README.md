# Socrati Frontend

Socrati is a modern interactive educational platform that transforms static content into engaging dialogue-based learning experiences. The frontend is built with Next.js and provides an intuitive UI for both content creators and readers.

## Features

### For Creators
- **Document Processing**: Upload PDFs, text files, or take photos to extract content
- **OCR Integration**: Extract text from images using Tesseract.js
- **AI-Powered Dialogue Generation**: Transform text into interactive dialogues using advanced LLMs
- **Multiple Teaching Styles**: Choose between Socratic, Platonic, or Story dialogue formats
- **Content Management**: Edit, preview, and publish interactive educational content
- **User Profiles**: Track created content, stats, and manage user settings

### Teaching Styles

- **Socratic**: Question-based approach that guides learners to discover answers through reflection
- **Platonic**: Traditional dialogue format with clear explanations and guided learning
- **Story**: Narrative approach where concepts are explained through engaging stories and examples

### For Readers
- **Interactive Learning**: Engage with content through conversation-based interfaces
- **Content Discovery**: Browse reeds by category and search functionality
- **Personalization**: Save favorites, track reading progress, and earn XP
- **Responsive Design**: Optimized for both desktop and mobile experiences
- **User Avatars**: Customize your learning experience with selectable avatars

## Tech Stack

- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS with custom theming
- **State Management**: React Context API
- **Authentication**: Firebase Authentication with Google Sign-in
- **Database**: Firebase Firestore for data persistence
- **Storage**: Firebase Storage for file uploads
- **OCR Technology**: Tesseract.js for image-to-text extraction
- **AI Integration**: Backend API for dialogue generation

## Project Structure

```
socrati-fe/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── dashboard/        # User dashboard and reed management
│   │   ├── login/            # Authentication pages
│   │   └── api/              # API routes
│   ├── components/           # Reusable React components
│   ├── contexts/             # React Context providers
│   │   └── AuthContext.js    # Authentication state management
│   ├── lib/                  # Utility functions and services
│   │   ├── api-service.js    # Backend API integration
│   │   ├── firebase.js       # Firebase configuration
│   │   ├── image-utils.js    # Image processing utilities
│   │   └── utils.js          # Common utility functions
│   ├── hooks/                # Custom React hooks
│   └── assets/               # Static assets and images
├── public/                   # Public assets
└── tailwind.config.js        # Tailwind CSS configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Firebase project with Authentication, Firestore, and Storage enabled

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Optional: Analytics
NEXT_PUBLIC_MEASUREMENT_ID=your_ga_measurement_id
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/socrati-fe.git
   cd socrati-fe
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Workflow

- Use the provided utility functions in `src/lib` for common operations
- Follow the established code patterns with proper JSDoc documentation
- Components should have clear prop interfaces and documentation
- Maintain proper error handling throughout the application

## Building for Production

```bash
npm run build
# or
yarn build
```

## Deployment

The application is configured for easy deployment on Vercel:

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy with default settings

For other platforms, build the application and serve the output from the `.next` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
