// Chess game instance
let game = new Chess();
let board = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initBoard();
    initEventListeners();
    updateStatus();
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
            status += ' (in check)';
        }
    }

    document.getElementById('status').textContent = status;
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

    // Undo move
    document.getElementById('undoBtn').addEventListener('click', function() {
        game.undo();
        board.position(game.fen());
        updateStatus();
    });
}
