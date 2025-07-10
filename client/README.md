# Recipe App Frontend

React frontend for the Recipe Social Media App.

## Features

- User authentication and profiles
- Recipe post sharing with images
- Real-time messaging
- Recipe search and AI ingredient detection
- Like and comment system
- Responsive design with Tailwind CSS

## Tech Stack

- React 18 with JSX
- React Router for navigation
- React Query for data fetching
- Tailwind CSS for styling
- Supabase for backend services
- React Hook Form for forms
- React Hot Toast for notifications

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the client directory:
```env
REACT_APP_API_URL=http://localhost:5002/api
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_GOOGLE_VISION_API_KEY=your_google_vision_api_key
REACT_APP_SPOONACULAR_API_KEY=your_spoonacular_api_key
```

3. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── feed/           # Feed-related components
│   ├── profile/        # Profile components
│   ├── post/           # Post components
│   ├── messaging/      # Messaging components
│   ├── recipe/         # Recipe components
│   ├── ui/             # Generic UI components
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API and external services
├── context/            # React context providers
├── utils/              # Utility functions
├── types/              # Type definitions
└── assets/             # Static assets
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Development Guidelines

- Use functional components with hooks
- Follow the component naming convention: PascalCase
- Use Tailwind CSS for styling
- Implement proper error handling
- Add loading states for better UX
- Use React Query for data fetching and caching 