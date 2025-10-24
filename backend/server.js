import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting: 10 requests per minute per IP
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// System prompt for chess coach
const SYSTEM_PROMPT = `You are an elite chess coach. Analyze the position and respond in JSON format.

Always include:
- "explanation": Your main coaching advice (2-4 sentences for simple questions, more for complex analysis)
- "suggestedMoves": Array of 1-3 recommended moves with from/to squares in algebraic notation
- "keySquares": Important squares to highlight (max 5)
- "continuationLine": Best continuation after your suggested move (3-5 moves)

Be concise for simple questions like "what should I do here?" but provide deeper analysis when asked for detailed explanations.

Consider the player's level - practical moves that create problems are often better than computer-perfect moves.`;

// Validate FEN format (basic check)
function isValidFEN(fen) {
    if (!fen || typeof fen !== 'string') return false;
    const parts = fen.split(' ');
    // FEN should have 6 parts (position, turn, castling, en passant, halfmove, fullmove)
    if (parts.length < 4) return false;
    // Basic check for position part
    const rows = parts[0].split('/');
    return rows.length === 8;
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!process.env.OPENAI_API_KEY
    });
});

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, fen, conversationHistory } = req.body;

        // Validate required fields
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required and must be a string' });
        }

        if (!fen || typeof fen !== 'string') {
            return res.status(400).json({ error: 'FEN is required and must be a string' });
        }

        // Validate FEN format
        if (!isValidFEN(fen)) {
            return res.status(400).json({ error: 'Invalid FEN format' });
        }

        // Check if API key is configured
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({ error: 'API key not configured on server' });
        }

        console.log(`Processing chat request - Message: "${message.substring(0, 50)}...", FEN: ${fen}`);

        // Construct the user message with position context
        const userMessage = `Current position (FEN): ${fen}\n\nQuestion: ${message}\n\nPlease respond in JSON format.`;

        // Call OpenAI API with structured output
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ],
            max_tokens: 2048,
            temperature: 0.7
        });

        // Extract the response text
        const responseText = response.choices[0].message.content;

        // Try to parse as JSON
        let structuredResponse;
        try {
            // Remove markdown code blocks if present
            const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            structuredResponse = JSON.parse(jsonText);
        } catch (parseError) {
            // If parsing fails, return a fallback structure
            console.warn('Failed to parse JSON response, using fallback structure');
            structuredResponse = {
                explanation: responseText,
                suggestedMoves: [],
                keySquares: [],
                continuationLine: []
            };
        }

        // Validate and ensure required fields exist
        const validatedResponse = {
            explanation: structuredResponse.explanation || responseText,
            suggestedMoves: Array.isArray(structuredResponse.suggestedMoves)
                ? structuredResponse.suggestedMoves
                : [],
            keySquares: Array.isArray(structuredResponse.keySquares)
                ? structuredResponse.keySquares
                : [],
            continuationLine: Array.isArray(structuredResponse.continuationLine)
                ? structuredResponse.continuationLine
                : []
        };

        console.log('Successfully processed request');
        res.json(validatedResponse);

    } catch (error) {
        console.error('Error processing chat request:', error);

        // Handle OpenAI API specific errors
        if (error.status === 401 || error.code === 'invalid_api_key') {
            return res.status(500).json({ error: 'Invalid API key configuration' });
        }

        if (error.status === 429 || error.code === 'rate_limit_exceeded') {
            return res.status(429).json({ error: 'Rate limit exceeded on AI service' });
        }

        // Generic error response
        res.status(500).json({
            error: 'Failed to process request',
            message: error.message
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Chess Tutor Backend API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API endpoint: http://localhost:${PORT}/api/chat`);

    if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️  WARNING: OPENAI_API_KEY not found in environment variables');
    } else {
        console.log('✓ API key configured');
    }
});
