// Chess game instance
let game = new Chess();
let board = null;

// API Key storage
let apiKey = localStorage.getItem('anthropic_api_key') || '';

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
    loadApiKey();
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
    
    // Save API key
    document.getElementById('saveKeyBtn').addEventListener('click', saveApiKey);
    
    // Load existing API key
    if (apiKey) {
        document.getElementById('apiKey').value = apiKey;
    }
}

function saveApiKey() {
    const key = document.getElementById('apiKey').value.trim();
    if (key) {
        apiKey = key;
        localStorage.setItem('anthropic_api_key', key);
        addMessage('System', 'API key saved successfully', 'assistant');
    }
}

function loadApiKey() {
    if (apiKey) {
        document.getElementById('apiKey').value = apiKey;
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    if (!apiKey) {
        alert('Please enter your Anthropic API key first');
        return;
    }
    
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
        const response = await callClaude(message, currentFEN);
        removeMessage(loadingId);
        addMessage('Coach', response, 'assistant');
    } catch (error) {
        removeMessage(loadingId);
        addMessage('System', `Error: ${error.message}`, 'assistant');
    } finally {
        sendBtn.disabled = false;
    }
}

async function callClaude(userMessage, fen) {
    const fullMessage = `Current position (FEN): ${fen}\n\nQuestion: ${userMessage}`;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: [{
                role: 'user',
                content: fullMessage
            }]
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
    }
    
    const data = await response.json();
    return data.content[0].text;
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
