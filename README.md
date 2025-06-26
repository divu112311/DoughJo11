# LuxeFi - AI-Native Personal Finance Concierge

A sophisticated AI-powered personal finance application designed for young professionals in the US, featuring conversational UI, real-time financial insights, and gamification.

## Features

### 🤖 AI-Native Experience
- **Conversational Interface**: Primary interaction through natural language chat with LuxeBot
- **Context-Aware AI**: OpenAI GPT-4 integration with full financial context and chat history
- **Dynamic Responses**: Personalized advice based on user profile, spending patterns, and goals

### 💰 Financial Management
- **Goal Tracking**: Visual progress tracking for financial objectives
- **Smart Insights**: AI-generated spending analysis and recommendations
- **User Profiles**: Comprehensive user management with XP and badges

### 🎮 Gamification
- **XP System**: Earn experience points for financial interactions
- **Level Progression**: Advance through levels based on engagement
- **Achievement Badges**: Unlock rewards for reaching milestones
- **Progress Visualization**: Beautiful progress bars and achievement animations

### 🎨 Luxury Design
- **Premium Aesthetics**: Apple-level design with cream/linen background
- **Sophisticated Typography**: Playfair Display headlines with Inter body text
- **Micro-interactions**: Smooth animations and hover states throughout
- **Responsive Layout**: Mobile-first design that scales beautifully

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Supabase (Database + Auth + Edge Functions)
- **AI**: OpenAI GPT-4 API via Supabase Edge Functions
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd luxefi-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values:
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the migrations in the `supabase/migrations` folder
   - Deploy the Edge Function in `supabase/functions/chat-ai`
   - Add your OpenAI API key to Supabase Edge Function secrets

5. Start the development server:
```bash
npm run dev
```

### Supabase Setup

1. **Create Project**: Go to [supabase.com](https://supabase.com) and create a new project
2. **Get Credentials**: Copy your project URL and anon key from Settings > API
3. **Run Migrations**: The database schema is already defined in the migrations folder
4. **Deploy Edge Function**: Deploy the chat-ai function for OpenAI integration
5. **Set Secrets**: Add your OpenAI API key as a secret in Supabase

### Environment Variables

Required environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `OPENAI_API_KEY`: Your OpenAI API key (for Edge Function)

## Architecture

### Frontend Structure
```
src/
├── components/
│   ├── LoginForm.tsx          # Authentication interface
│   ├── ChatInterface.tsx      # AI chat with LuxeBot
│   ├── Dashboard.tsx          # Financial overview & charts
│   └── OnboardingFlow.tsx     # User profiling wizard
├── hooks/
│   ├── useAuth.ts            # Authentication logic
│   ├── useChat.ts            # Chat functionality
│   ├── useGoals.ts           # Goals management
│   └── useUserProfile.ts     # User profile & XP
├── lib/
│   └── supabase.ts           # Supabase client configuration
└── App.tsx                   # Main application component
```

### Database Schema
- **users**: User profiles and authentication
- **goals**: Financial goal tracking
- **chat_logs**: Complete conversation history
- **xp**: Gamification system (points and badges)

### Edge Functions
- **chat-ai**: Handles OpenAI API integration with user context

## Key Features Explained

### Conversational AI
The core of LuxeFi is the conversational interface where users interact with LuxeBot through natural language. The AI has access to:
- Complete user financial profile
- Real-time goal progress
- Full conversation history for context
- User XP and achievement data

### Context-Aware Responses
Every AI response is generated with full context including:
- User demographics and preferences
- Current financial goals and progress
- XP level and badges earned
- Previous conversations

### Gamification System
Users earn XP for various actions:
- Completing registration: +100 XP
- Each chat interaction: +5 XP
- Setting up goals: +50 XP
- Reaching milestones: Variable XP

Levels increase every 100 XP, with visual feedback throughout the interface.

## Deployment

### Netlify Deployment
The app is configured for easy Netlify deployment:

```bash
npm run build
```

The build output in `dist/` can be deployed to any static hosting service.

### Environment Variables for Production
Make sure to set these environment variables in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The OpenAI API key should be set in your Supabase Edge Function secrets, not as a client-side environment variable.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.