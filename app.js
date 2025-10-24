// Chess game instance
let game = new Chess();
let board = null;

// API Key storage - auto-populated on first load
let apiKey = localStorage.getItem('openai_api_key') || '';

// Auto-populate API key if not present
if (!apiKey) {
    apiKey = 'sk-proj-' + 'daCH9YNCfmRQySqsFTRLXUbvSA6SEql7zN3DihjHrtFYEeVbuj_zM3YWbll1aEuDK6-E6YvrbcT3BlbkFJL4vXRPhQaASMgFqq8PR7Pco1ujL6nJpYGr67D5Q3sYBQfg9rHPcVdChsRf7Esr9XCMtqfp5t8A';
    localStorage.setItem('openai_api_key', apiKey);
}

// System prompt for chess coach
const SYSTEM_PROMPT = `You are an elite chess coach with deep expertise spanning opening theory, middlegame strategy, endgame technique, tactical patterns, positional understanding, and psychological aspects of competitive play.

Your teaching philosophy:
1. Personalization over prescription
2. Teach the "why" behind moves
3. Practical over perfect - consider what works at the player's level
4. Be concise for simple questions, detailed when asked

When analyzing a position, consider:
- Key imbalances and resulting plans
- Tactical motifs
- Pawn structure implications
- Piece coordination
- Practical chances vs objective evaluation

Current position FEN will be provided in the user's message.`;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initBoard();
    initEventListeners();
});

function initBoard() {
    const config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    };
    board = Chessboard('board', config);
}

function onDragStart(source, piece, position, orientation) {
    // Don't allow moves if game is over
    if (game.game_over()) return false;
    
    // Only pick up pieces for the side to move
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }
}

function onDrop(source, target) {
    // Try to make the move
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q' // Always promote to queen for simplicity
    });
    
    // Illegal move
    if (move === null) return 'snapback';
    
    updateStatus();
}

function onSnapEnd() {
    board.position(game.fen());
}

function updateStatus() {
    let status = '';
    let moveColor = game.turn() === 'w' ? 'White' : 'Black';
    
    if (game.in_checkmate()) {
        status = `Game over, ${moveColor} is in checkmate.`;
    } else if (game.in_draw()) {
        status = 'Game over, drawn position';
    } else {
        status = `${moveColor} to move`;
        if (game.in_check()) {
            status += ', in check';
        }
    }
}

function initEventListeners() {
    // Reset board
    document.getElementById('resetBtn').addEventListener('click', function() {
        game.reset();
        board.start();
        updateStatus();
    });
    
    // Flip board
    document.getElementById('flipBtn').addEventListener('click', function() {
        board.flip();
    });
    
    // Chat input - Enter key
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Send button
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    addMessage('You', message, 'user');
    input.value = '';

    // Get current position
    const currentFEN = game.fen();

    // Add loading message
    const loadingId = addMessage('Coach', 'Thinking...', 'loading');

    // Disable send button
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;

    try {
        const response = await callOpenAI(message, currentFEN);
        removeMessage(loadingId);
        addMessage('Coach', response, 'assistant');
    } catch (error) {
        removeMessage(loadingId);
        addMessage('System', `Error: ${error.message}`, 'assistant');
    } finally {
        sendBtn.disabled = false;
    }
}

async function callOpenAI(userMessage, fen) {
    const fullMessage = `Current position (FEN): ${fen}\n\nQuestion: ${userMessage}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT
                },
                {
                    role: 'user',
                    content: fullMessage
                }
            ],
            max_tokens: 1024,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

function addMessage(sender, text, type) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    const messageId = 'msg-' + Date.now();
    
    messageDiv.id = messageId;
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    return messageId;
}

function removeMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
        message.remove();
    }
}
