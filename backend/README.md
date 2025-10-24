# Chess Tutor Backend API

Node.js + Express backend for the Chess Tutor application. Provides AI-powered chess coaching through the OpenAI GPT-4 API.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-proj-your-key-here
   ```

3. **Run the server:**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### Health Check
```
GET /health
```

Returns server status and configuration info.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-24T02:00:00.000Z",
  "apiKeyConfigured": true
}
```

### Chat Endpoint
```
POST /api/chat
```

Analyzes a chess position and provides coaching advice.

**Request Body:**
```json
{
  "message": "What should I do in this position?",
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "explanation": "Natural language coaching advice...",
  "suggestedMoves": [
    {
      "move": "Nf3",
      "from": "g1",
      "to": "f3",
      "explanation": "Develops the knight and controls the center",
      "evaluation": "+0.2"
    }
  ],
  "keySquares": ["e4", "d5", "f3"],
  "continuationLine": ["Nf3", "Nc6", "d4", "d5", "e3"]
}
```

## Features

- ✅ Rate limiting (10 requests/minute per IP)
- ✅ CORS enabled
- ✅ Request logging
- ✅ Error handling with proper HTTP status codes
- ✅ FEN validation
- ✅ Structured JSON responses from AI

## Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **OpenAI SDK** - GPT-4 AI integration
- **express-rate-limit** - Rate limiting
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
