# Chat Agent UI

A modern React-based chat interface for communicating with your chat agent.

## Features

- ✅ DaVinci authentication popup before chat access
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

## DaVinci Authentication Configuration

This application uses PingOne DaVinci for authentication. Before running the app, you need to configure your DaVinci credentials.

### Configuration Steps

1. Open `src/config.js` in your editor

2. Update the following values with your DaVinci environment settings:

```javascript
export const daVinciConfig = {
  // Your PingOne company/environment ID
  companyId: "YOUR_COMPANY_ID",

  // Your DaVinci API Key from the DaVinci application
  apiKey: "YOUR_DAVINCI_API_KEY",

  // Your DaVinci flow policy ID
  policyId: "YOUR_POLICY_ID",

  // PingOne region: 'com' (North America), 'eu' (Europe), 'asia' (Asia Pacific), 'ca' (Canada)
  region: "com",

  // Additional configuration
  includeHttpCredentials: true,
  nonce: 'auth-' + Date.now()
}
```

### Finding Your DaVinci Credentials

1. **Company ID**: Your PingOne environment ID (found in PingOne Admin Console)
2. **API Key**: Generated in your DaVinci application settings
3. **Policy ID**: The flow policy ID from your DaVinci flow
4. **Region**: Based on your PingOne deployment region

### Getting the SDK Token

When implementing a DaVinci application integration using the widget method, be aware that the `POST <authPath>/<companyID>/davinci/policy/<davinciFlowPolicyID>/start` request that invokes the flow takes an SDK token to authenticate. However, the call to get a DaVinci SDK token, `GET <orchestratePath>/company/<companyID>/sdktoken`, requires the application's API key to authenticate.

The following sample shows a server-side code snippet from a `server.js` file used to generate the DaVinci SDK token without exposing the application's API key.

```javascript
/************************
* DaVinci components
************************/

// Get a Widget sdkToken
function getDVToken(cb) {
  const url = 'https://orchestrate-api.pingone.<region>/v1/company/${companyId}/sdktoken';
  fetch(url, {
    headers: {
      "X-SK-API-KEY":  <yourDavinciAppApiKey>
    },
    method: "GET"
  })
  .then(res => res.json())
  .then(data => cb(data))
  .catch(err => console.log("Error: ", err));
}
```

### Authentication Flow

1. User opens the application
2. DaVinci authentication popup appears
3. User authenticates through DaVinci flow
4. On success, chatbot interface is displayed
5. On error, retry option is available

### Testing Authentication

To test the authentication flow:

```bash
npm run dev
```

You should see:
1. Loading screen while DaVinci initializes
2. Authentication popup/modal
3. After successful authentication, the chat interface appears

### Troubleshooting Authentication

**Error**: "Failed to get SDK token"
- Check that your `apiKey` is correct in `src/config.js`
- Verify the API key is active in your DaVinci application

**Error**: "Authentication failed"
- Verify your `policyId` matches your DaVinci flow
- Check that the flow is published and active

**Error**: "Widget container not found"
- This is a rare initialization error - try refreshing the page
- Check browser console for additional details

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
│   ├── App.jsx              # Main chat component
│   ├── App.css              # Chat component styles
│   ├── DaVinciAuth.jsx      # DaVinci authentication wrapper
│   ├── DaVinciAuth.css      # Authentication styles
│   ├── config.js            # DaVinci configuration
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles and theme
├── index.html               # HTML entry point with DaVinci SDK
├── vite.config.js           # Vite configuration
├── package.json             # Dependencies and scripts
└── README.md               # This file
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
