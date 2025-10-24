# Chess Tutor

A chess coaching application with an interactive chessboard and AI-powered coaching through Claude. Features a secure backend API and structured responses with move suggestions, analysis, and key squares.

## What's Included

- **Interactive chessboard** - Drag and drop pieces, legal move validation
- **AI Chess Coach** - Powered by Claude with structured analysis
- **Secure Backend** - Node.js API that protects your API key
- **Structured Responses** - Get move suggestions, continuations, and key squares
- **Clean UI** - Dark mode, responsive two-panel layout

## Setup

### 1. Backend Setup

First, set up and start the backend server:

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Start the backend server:
```bash
npm start
```

The server will run on `http://localhost:3001`

### 2. Frontend Setup

1. **Open `index.html` in your browser**
   - Just double-click the file or serve it with any local server
   - The frontend will connect to the backend API automatically

2. **Set up a position**
   - Drag pieces on the board to create your position
   - OR start from the default starting position

3. **Ask questions**
   - Type in the chat: "What's the best move here?"
   - The coach analyzes the current board position
   - Get structured responses with move suggestions and analysis

## Example Questions

- "What should I do in this position?"
- "What are the key ideas for White here?"
- "How should I defend this position?"
- "Explain the pawn structure"
- "What's the plan for Black?"

## Project Structure

```
Chess/
├── backend/
│   ├── server.js          # Express API server
│   ├── package.json       # Backend dependencies
│   ├── .env              # API keys (git-ignored)
│   └── README.md         # Backend documentation
├── index.html            # Main HTML structure
├── style.css            # All styling
├── app.js               # Chess logic and API integration
└── README.md            # This file
```

## Tech Stack

**Frontend:**
- **Chessboard.js** - Board UI
- **Chess.js** - Move validation and game logic
- Vanilla JS, no build tools needed

**Backend:**
- **Node.js + Express** - API server
- **Anthropic SDK** - Claude AI integration
- **express-rate-limit** - Request throttling
- **CORS** - Cross-origin support

## Features

✅ **Structured AI Responses** - Get move suggestions with explanations
✅ **Key Squares** - Highlights important squares in the position
✅ **Continuation Lines** - See the best follow-up moves
✅ **Secure API** - Backend protects your API key
✅ **Rate Limiting** - 10 requests per minute per IP
✅ **FEN Validation** - Ensures valid chess positions

## Next Steps to Build On

Here are some ideas for enhancements:

1. **Arrow Rendering** - Visualize suggested moves on the board
2. **Variation Explorer** - Let users click through different lines
3. **Move History** - Show the game's move list
4. **Analysis Board Mode** - Make moves without affecting the main position
5. **Conversation History** - Multi-turn conversations with context
6. **Position Database** - Save and load interesting positions
7. **User Authentication** - Personal coaching sessions

## License

Do whatever you want with this code!
