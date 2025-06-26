# LuxeFi - AI-Native Personal Finance Concierge

A sophisticated AI-powered personal finance application designed for young professionals in the US, featuring conversational UI, real-time financial insights, and gamification.

## Features

### 🤖 AI-Native Experience
- **Conversational Interface**: Primary interaction through natural language chat with LuxeBot
- **Context-Aware AI**: GPT-4 integration with full financial context and chat history
- **Dynamic Responses**: Personalized advice based on user profile, spending patterns, and goals

### 💰 Financial Management
- **Account Linking**: Simulated banking integration with multiple account types
- **Transaction Categorization**: Automatic spending categorization and analysis
- **Goal Tracking**: Visual progress tracking for financial objectives
- **Smart Insights**: AI-generated spending analysis and recommendations

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
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **AI**: OpenAI GPT-4 API
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- OpenAI API key (optional - falls back to mock responses)

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

3. Set up environment variables (optional):
```bash
# Create .env file in the root directory
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_jwt_secret_here
```

4. Start the development servers:
```bash
npm run dev
```

This will start both the React client (port 5173) and Express server (port 3001) concurrently.

### Demo Account
- **Email**: demo@luxefi.com
- **Password**: demo123

## Architecture

### Frontend Structure
```
src/
├── components/
│   ├── LoginForm.tsx          # Authentication interface
│   ├── ChatInterface.tsx      # AI chat with LuxeBot
│   ├── Dashboard.tsx          # Financial overview & charts
│   └── OnboardingFlow.tsx     # User profiling wizard
├── types/
│   └── index.ts              # TypeScript interfaces
└── App.tsx                   # Main application component
```

### Backend Structure
```
server/
├── index.js                  # Express server with all routes
└── luxefi.db                # SQLite database (auto-created)
```

### Database Schema
- **users**: User profiles, XP, levels, badges
- **accounts**: Bank/investment account information
- **transactions**: Financial transaction history
- **goals**: User-defined financial objectives
- **chat_messages**: Complete conversation history

## Key Features Explained

### Conversational AI
The core of LuxeFi is the conversational interface where users interact with LuxeBot through natural language. The AI has access to:
- Complete user financial profile
- Real-time account balances and transactions
- Goal progress and targets
- Full conversation history for context

### Context-Aware Responses
Every AI response is generated with full context including:
- User demographics and preferences
- Current financial situation
- Recent spending patterns
- Progress toward goals
- Previous conversations

### Gamification System
Users earn XP for various actions:
- Completing onboarding: +100 XP
- Each chat interaction: +5 XP
- Setting up goals: +50 XP
- Account connections: +25 XP (simulated)

Levels increase every 100 XP, with visual feedback throughout the interface.

### Data Flow
1. User interacts through chat interface
2. Frontend sends message to backend API
3. Backend compiles full user context from database
4. Context + message sent to OpenAI API (or mock response)
5. AI response saved to database and returned to frontend
6. XP awarded and UI updated with response

## Customization

### Adding New Account Types
Modify the `generateMockData` function in `server/index.js` to include additional account types.

### Extending AI Capabilities
Update the system prompt in the `/api/chat` endpoint to modify LuxeBot's personality and capabilities.

### UI Theming
Colors and styling can be customized in `tailwind.config.js` and the component-level Tailwind classes.

## Production Considerations

For production deployment, consider:
- Replace SQLite with PostgreSQL or similar production database
- Implement proper Plaid integration for real banking data
- Add comprehensive error handling and logging
- Implement rate limiting and security measures
- Set up proper environment variable management
- Add comprehensive testing suite
- Implement caching for AI responses

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.