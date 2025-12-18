# Chat Agent UI

A modern React-based chat interface for communicating with your chat agent.

## Features

- ✅ Real-time chat interface with distinctive brutalist-minimal design
- ✅ Auto-scrolling to latest messages
- ✅ Loading states and error handling
- ✅ Message timestamps
- ✅ Responsive design
- ✅ Keyboard shortcuts (Enter to send)
- ✅ Clear chat functionality

## Prerequisites

- Node.js 18+ installed
- Your chat agent running on `http://localhost:8080`

## Installation

1. Navigate to the project directory:
```bash
cd chat-agent-ui
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

1. Ensure your chat agent is running:
```bash
# In your chat-agent directory
python main.py
# Should be running on http://localhost:8080
```

2. Start the React development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Production Build

1. Build the application:
```bash
npm run build
```

2. Preview the production build:
```bash
npm run preview
```

## How It Works

### Communication Flow

```
User Browser (port 3000)
    ↓
React App
    ↓
Vite Proxy (/api → /invocations)
    ↓
Chat Agent (port 8080)
    ↓
Response back to UI
```

### API Proxy Configuration

The Vite development server is configured to proxy API requests:

- Frontend calls: `POST /api`
- Vite forwards to: `POST http://localhost:8080/invocations`

This is configured in `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '/invocations')
  }
}
```

### Message Format

**Request to Agent:**
```json
{
  "prompt": "User's message here"
}
```

**Response from Agent:**
```json
{
  "response": "Agent's response here"
}
```

## Project Structure

```
chat-agent-ui/
├── src/
│   ├── App.jsx          # Main React component with chat logic
│   ├── App.css          # Component styles
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── index.html           # HTML entry point
├── vite.config.js       # Vite configuration with proxy
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## Design Choices

### Aesthetic Direction
**Brutalist-Minimal with Tech Noir accents**

- **Color Palette**: Dark theme with neon green (`#00ff88`) accents
- **Typography**: 
  - Display: Manrope (clean, geometric sans-serif)
  - Monospace: JetBrains Mono (for code, timestamps, labels)
- **Motion**: Smooth CSS animations with cubic-bezier easing
- **Layout**: Clean, focused, terminal-inspired interface

### Key Features

1. **Message Display**
   - User messages with green-tinted background
   - Agent messages with neutral background
   - Error messages with red tinting
   - Animated entrance for each message
   - Hover effects for interactivity

2. **Input Area**
   - Focus states with green glow
   - Disabled states during loading
   - Send button with hover animations

3. **Loading States**
   - Animated dots for agent processing
   - Disabled input during requests

4. **Responsive Design**
   - Works on desktop and mobile
   - Optimized spacing for different screen sizes

## Troubleshooting

### Agent Not Responding

**Error**: "Failed to connect to agent"

**Solution**: Ensure your chat agent is running on port 8080:
```bash
# Terminal 1: Start agent
cd chat-agent
python main.py

# You should see: Running on http://localhost:8080
```

### Port Already in Use

**Error**: "Port 3000 already in use"

**Solution**: Either:
1. Stop the process using port 3000
2. Change the port in `vite.config.js`:
```javascript
server: {
  port: 3001  // Change to different port
}
```

### CORS Errors

The Vite proxy handles CORS automatically. If you see CORS errors:
1. Verify the agent is running on port 8080
2. Check `vite.config.js` proxy configuration
3. Restart the dev server: `npm run dev`

## Customization

### Changing Colors

Edit CSS variables in `src/index.css`:
```css
:root {
  --accent: #00ff88;  /* Change accent color */
  --bg-primary: #0a0a0a;  /* Change background */
}
```

### Changing Agent URL

For production, update the proxy target in `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'https://your-agent-url.com',  // Production URL
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '/invocations')
  }
}
```

## Technology Stack

- **React 18** - UI framework
- **Vite 6** - Build tool and dev server
- **CSS3** - Styling with custom properties
- **Native Fetch API** - HTTP requests

## License

MIT
