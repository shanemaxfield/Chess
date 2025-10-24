// Chess game instance
let game = new Chess();
let board = null;

// Backend API URL
const API_URL = 'http://localhost:3001/api/chat';

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
        onSnapEnd: onSnapEnd,
        pieceTheme: 'img/chesspieces/wikipedia/{piece}.png'
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
        const response = await callBackendAPI(message, currentFEN);
        removeMessage(loadingId);

        // Display the structured response
        displayStructuredResponse(response);
    } catch (error) {
        removeMessage(loadingId);
        addMessage('System', `Error: ${error.message}`, 'assistant');
    } finally {
        sendBtn.disabled = false;
    }
}

async function callBackendAPI(userMessage, fen) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: userMessage,
            fen: fen,
            conversationHistory: []
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
    }

    const data = await response.json();
    return data;
}

function displayStructuredResponse(response) {
    // Build the message with explanation and suggested moves
    let messageHTML = `<div class="explanation">${response.explanation}</div>`;

    // Add suggested moves if present
    if (response.suggestedMoves && response.suggestedMoves.length > 0) {
        messageHTML += '<div class="suggested-moves"><strong>Suggested moves:</strong><ul>';
        response.suggestedMoves.forEach(move => {
            messageHTML += `<li><strong>${move.move}</strong>`;
            if (move.explanation) {
                messageHTML += ` - ${move.explanation}`;
            }
            if (move.evaluation) {
                messageHTML += ` (${move.evaluation})`;
            }
            messageHTML += '</li>';
        });
        messageHTML += '</ul></div>';
    }

    // Add continuation line if present
    if (response.continuationLine && response.continuationLine.length > 0) {
        messageHTML += `<div class="continuation"><strong>Continuation:</strong> ${response.continuationLine.join(' → ')}</div>`;
    }

    // Add key squares if present
    if (response.keySquares && response.keySquares.length > 0) {
        messageHTML += `<div class="key-squares"><strong>Key squares:</strong> ${response.keySquares.join(', ')}</div>`;
    }

    addMessageHTML('Coach', messageHTML, 'assistant');
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

function addMessageHTML(sender, htmlContent, type) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    const messageId = 'msg-' + Date.now();

    messageDiv.id = messageId;
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${htmlContent}`;

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
