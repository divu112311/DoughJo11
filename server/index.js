import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Database setup
const db = new Database(join(__dirname, 'luxefi.db'));

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    age_range TEXT,
    income_range TEXT,
    financial_goals TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    badges TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    account_type TEXT NOT NULL,
    account_name TEXT NOT NULL,
    balance REAL NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (account_id) REFERENCES accounts (id)
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    is_user BOOLEAN NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    target_amount REAL NOT NULL,
    current_amount REAL DEFAULT 0,
    target_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

// Create demo user if it doesn't exist
const createDemoUser = async () => {
  const existingDemo = db.prepare('SELECT * FROM users WHERE email = ?').get('demo@luxefi.com');
  if (!existingDemo) {
    const hashedPassword = await bcrypt.hash('demo123', 12);
    const userId = uuidv4();
    
    db.prepare('INSERT INTO users (id, email, password, name, age_range, income_range, financial_goals, xp, level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      userId, 'demo@luxefi.com', hashedPassword, 'Demo User', '25-30', '75k-100k', 'Build emergency fund and invest for future', 150, 2
    );
    
    generateMockData(userId);
    console.log('Demo user created successfully');
  }
};

// OpenAI setup (will use environment variable or mock)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'luxefi-secret-key';

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate mock data
const generateMockData = (userId) => {
  // Create mock accounts
  const accounts = [
    { id: uuidv4(), user_id: userId, account_type: 'checking', account_name: 'Chase Checking', balance: 2450.75 },
    { id: uuidv4(), user_id: userId, account_type: 'savings', account_name: 'High Yield Savings', balance: 8200.00 },
    { id: uuidv4(), user_id: userId, account_type: 'credit', account_name: 'Chase Sapphire', balance: -850.25 },
    { id: uuidv4(), user_id: userId, account_type: 'investment', account_name: 'Robinhood', balance: 3750.50 }
  ];

  accounts.forEach(account => {
    db.prepare('INSERT OR REPLACE INTO accounts (id, user_id, account_type, account_name, balance) VALUES (?, ?, ?, ?, ?)').run(
      account.id, account.user_id, account.account_type, account.account_name, account.balance
    );
  });

  // Create mock transactions
  const categories = ['Food & Dining', 'Shopping', 'Transportation', 'Entertainment', 'Bills & Utilities', 'Transfer'];
  const descriptions = [
    'Starbucks Coffee', 'Whole Foods Market', 'Uber Ride', 'Netflix Subscription',
    'Electric Bill', 'Savings Transfer', 'Target Purchase', 'Gas Station',
    'Restaurant Dinner', 'Amazon Purchase'
  ];

  for (let i = 0; i < 20; i++) {
    const accountId = accounts[Math.floor(Math.random() * accounts.length)].id;
    const amount = (Math.random() * 200 - 100).toFixed(2);
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    db.prepare('INSERT OR IGNORE INTO transactions (id, user_id, account_id, amount, description, category, date) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      uuidv4(), userId, accountId, amount, description, category, date
    );
  }

  // Create mock goals
  const goals = [
    { id: uuidv4(), user_id: userId, title: 'Emergency Fund', target_amount: 10000, current_amount: 3200, target_date: '2024-12-31' },
    { id: uuidv4(), user_id: userId, title: 'Vacation to Japan', target_amount: 5000, current_amount: 1250, target_date: '2024-08-15' },
    { id: uuidv4(), user_id: userId, title: 'Investment Portfolio', target_amount: 25000, current_amount: 3750, target_date: '2025-12-31' }
  ];

  goals.forEach(goal => {
    db.prepare('INSERT OR REPLACE INTO goals (id, user_id, title, target_amount, current_amount, target_date) VALUES (?, ?, ?, ?, ?, ?)').run(
      goal.id, goal.user_id, goal.title, goal.target_amount, goal.current_amount, goal.target_date
    );
  });
};

// Helper function to build AI context
const buildAIContext = (userId) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const accounts = db.prepare('SELECT * FROM accounts WHERE user_id = ?').all(userId);
  const recentTransactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 10').all(userId);
  const goals = db.prepare('SELECT * FROM goals WHERE user_id = ?').all(userId);
  const recentChats = db.prepare('SELECT * FROM chat_messages WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10').all(userId);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const monthlySpending = recentTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    user: {
      name: user.name,
      ageRange: user.age_range,
      incomeRange: user.income_range,
      financialGoals: user.financial_goals,
      xp: user.xp,
      level: user.level
    },
    accounts,
    totalBalance: totalBalance.toFixed(2),
    monthlySpending: monthlySpending.toFixed(2),
    recentTransactions: recentTransactions.slice(0, 5),
    goals,
    recentChats: recentChats.reverse()
  };
};

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const userId = uuidv4();
    db.prepare('INSERT INTO users (id, email, password, name, xp) VALUES (?, ?, ?, ?, ?)').run(
      userId, email, hashedPassword, name, 100
    );

    // Generate mock data
    generateMockData(userId);

    // Create token
    const token = jwt.sign({ userId, email }, JWT_SECRET);

    res.json({ token, user: { id: userId, email, name, xp: 100, level: 1 } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        age_range: user.age_range,
        income_range: user.income_range,
        financial_goals: user.financial_goals,
        xp: user.xp, 
        level: user.level,
        badges: JSON.parse(user.badges || '[]')
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/dashboard', authenticateToken, (req, res) => {
  try {
    const context = buildAIContext(req.user.userId);
    res.json(context);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId;

    // Save user message
    db.prepare('INSERT INTO chat_messages (id, user_id, message, is_user) VALUES (?, ?, ?, ?)').run(
      uuidv4(), userId, message, true
    );

    // Build context for AI
    const context = buildAIContext(userId);
    
    let aiResponse;
    
    if (openai) {
      // Use real OpenAI API
      const systemPrompt = `You are LuxeBot, a sophisticated AI financial concierge for LuxeFi, a premium personal finance app for young professionals.

User Context:
- Name: ${context.user.name}
- Age Range: ${context.user.ageRange || 'Not specified'}
- Income Range: ${context.user.incomeRange || 'Not specified'}
- Financial Goals: ${context.user.financialGoals || 'Not specified'}
- Current Level: ${context.user.level} (XP: ${context.user.xp})
- Net Worth: $${context.totalBalance}
- Recent Monthly Spending: $${context.monthlySpending}

Recent Transactions:
${context.recentTransactions.map(t => `${t.date}: ${t.description} - $${t.amount} (${t.category})`).join('\n')}

Goals:
${context.goals.map(g => `${g.title}: $${g.current_amount}/$${g.target_amount} (${((g.current_amount/g.target_amount)*100).toFixed(1)}%)`).join('\n')}

Recent Chat History:
${context.recentChats.map(c => `${c.is_user ? 'User' : 'LuxeBot'}: ${c.message}`).join('\n')}

Guidelines:
- Be conversational, friendly, and sophisticated
- Provide actionable financial advice
- Explain complex concepts simply
- Suggest specific next steps
- Reference their actual data when relevant
- Keep responses concise but helpful
- Use their name occasionally
- If they achieve something, congratulate them and mention XP earned`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      aiResponse = completion.choices[0].message.content;
    } else {
      // Mock AI response for development
      const responses = [
        `Hi ${context.user.name}! I see you have a net worth of $${context.totalBalance}. That's great progress! How can I help you optimize your finances today?`,
        `Based on your recent spending of $${context.monthlySpending} this month, I'd suggest reviewing your ${context.recentTransactions[0]?.category || 'dining'} expenses. Want me to analyze your spending patterns?`,
        `I notice you're ${((context.goals[0]?.current_amount / context.goals[0]?.target_amount) * 100).toFixed(1) || '0'}% of the way to your first goal! Keep up the great work. Consider automating your savings to reach it faster.`,
        `Your investment account is performing well at $${context.accounts.find(a => a.account_type === 'investment')?.balance || '0'}. Have you considered diversifying further or increasing your monthly contributions?`,
        `Great question! Let me help you with that. Based on your profile and current financial situation, I'd recommend focusing on building your emergency fund first before aggressive investing.`
      ];
      aiResponse = responses[Math.floor(Math.random() * responses.length)];
    }

    // Save AI response
    db.prepare('INSERT INTO chat_messages (id, user_id, message, is_user) VALUES (?, ?, ?, ?)').run(
      uuidv4(), userId, aiResponse, false
    );

    // Award XP for chat interaction
    const currentUser = db.prepare('SELECT xp FROM users WHERE id = ?').get(userId);
    const newXP = currentUser.xp + 5;
    const newLevel = Math.floor(newXP / 100) + 1;
    
    db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?').run(newXP, newLevel, userId);

    res.json({ 
      message: aiResponse, 
      xpEarned: 5,
      newXP,
      newLevel: newLevel > Math.floor(currentUser.xp / 100) + 1 ? newLevel : null
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

app.get('/api/chat-history', authenticateToken, (req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM chat_messages WHERE user_id = ? ORDER BY timestamp ASC').all(req.user.userId);
    res.json(messages);
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

app.post('/api/onboarding', authenticateToken, (req, res) => {
  try {
    const { ageRange, incomeRange, financialGoals } = req.body;
    
    db.prepare('UPDATE users SET age_range = ?, income_range = ?, financial_goals = ?, xp = xp + 50 WHERE id = ?').run(
      ageRange, incomeRange, financialGoals, req.user.userId
    );

    res.json({ success: true, xpEarned: 50 });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Failed to save onboarding data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize demo user and start server
createDemoUser().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 LuxeFi server running on port ${PORT}`);
    console.log(`📊 Database initialized with demo data`);
    console.log(`🤖 AI integration: ${openai ? 'OpenAI API' : 'Mock responses'}`);
  });
});