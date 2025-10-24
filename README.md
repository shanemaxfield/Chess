# Chess Tutor - Starting Kit

A simple, clean chess coaching interface that lets you set up positions and ask questions to an AI chess coach powered by Claude.

## What's Included

- **Interactive chessboard** - Drag and drop pieces, legal move validation
- **Chat interface** - Ask questions about positions or chess in general
- **Clean UI** - Dark mode, responsive design

## How to Use

1. **Open `index.html` in your browser**
   - Just double-click the file or serve it with any local server

2. **Enter your Anthropic API key**
   - Get one from: https://console.anthropic.com/
   - Paste it in the API key field at the bottom
   - Click "Save Key" (it's stored in localStorage)

3. **Set up a position**
   - Drag pieces on the board to create your position
   - OR start from the default starting position

4. **Ask questions**
   - Type in the chat: "What's the best move here?"
   - The coach analyzes the current board position
   - Get explanations, move suggestions, and chess insights

## Example Questions

- "What should I do in this position?"
- "What are the key ideas for White here?"
- "How should I defend this position?"
- "Explain the pawn structure"
- "What's the plan for Black?"

## Files

- `index.html` - Main HTML structure
- `style.css` - All styling
- `app.js` - Chess logic and API integration
- `README.md` - This file

## Tech Stack

- **Chessboard.js** - Board UI
- **Chess.js** - Move validation and game logic
- **Claude API** - AI chess coaching
- Vanilla JS, no build tools needed

## Next Steps to Build On

This is intentionally minimal. Here's what you can add:

1. **Structured Output** - Make Claude return JSON with moves/arrows
2. **Arrow Rendering** - Visualize suggested moves on the board
3. **Variation Explorer** - Let users click through different lines
4. **Query Classification** - Different response formats for openings/tactics/endgames
5. **Progressive Disclosure** - Summary → Details → Deep analysis
6. **Move History** - Show the game's move list
7. **Analysis Board Mode** - Make moves without affecting the main position

## License

Do whatever you want with this code!
