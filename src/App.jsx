import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [globalAccessToken, setAccessToken] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Agent URL configuration
  const AGENT_URL = "https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/arn%3Aaws%3Abedrock-agentcore%3Aus-east-1%3A574076504146%3Aruntime%2Fchat_agent-7nKEGmDGN1/invocations?qualifier=DEFAULT"

  // ****************************************
  // Check URL Parameters for auth code
  // ****************************************
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    urlParams.forEach((value, key) => {
      console.log(`Params -> ${key} : ${value}`)
    })

    // Check if we have an authorization code
    const authCode = urlParams.get('code')
    if (authCode) {
      console.log('Authorization code found: ', authCode)
      exchangeAuthCodeForToken(authCode)
    }
  }, [])

  // ****************************************
  // Exchange authorization code for access token
  // ****************************************
  const exchangeAuthCodeForToken = async (authCode) => {
    try {
      console.log('Exchanging authorization code for access token...')
      
      const response = await fetch('https://auth.pingone.com/484c8d69-2783-4b55-b787-be71c4cd1532/as/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic YzI4ZDZhZjEtMzI4Mi00OTUxLWFjNTQtMDI2MDE2NTAzNzA5OlJyZnktYWJMbTRDVVBKeTBwa1BEVWhvampXVVNwOXEwLUx4bHhWS2Z2QUdXeTA3VWdyTkRhWXl5RjE0YlJ4ZWI='
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: authCode,
          redirect_uri: 'https://hackathon2025.ping-tpp.com'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Token exchange failed:', errorData)
        throw new Error(`Failed to exchange authorization code: ${response.status}`)
      }

      const data = await response.json()
      console.log('Token exchange successful!')
      console.log(data)
      console.log('Access token received:', data.access_token)
      console.log('Token type:', data.token_type)
      console.log('Expires in:', data.expires_in)
      
      // Store the access token
      setAccessToken(data.access_token)
      
      // Clean up the URL by removing the code parameter
      const newUrl = window.location.origin + window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
      console.log('URL cleaned up, code parameter removed')
      
    } catch (err) {
      console.error('Error exchanging authorization code:', err)
      setError(err.message)
    }
  }

  // ****************************************
  // Extract a short agent name from the URL
  // ****************************************
  const getAgentDisplayName = (url) => {
    try {
      const match = url.match(/runtime%2F([^/]+)/)
      if (match && match[1]) {
        return decodeURIComponent(match[1])
      }
      const urlObj = new URL(url)
      return urlObj.hostname.split('.')[0]
    } catch {
      return 'agent'
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // ****************************************
  // Get access token using client credentials
  // ****************************************
  const getAccessToken = async () => {
    // Otherwise fall back to client credentials flow
    try {
      console.log('Using client credentials flow to get access token')
      const response = await fetch('https://auth.pingone.com/484c8d69-2783-4b55-b787-be71c4cd1532/as/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: 'd37fdc79-c934-4b3a-a2f9-544227256b8f',
          client_secret: '3gmReixQdKfEFqOJshD.zLT3tScqJV~AnbVib5PUlOs62dZ7b_MEaNaQPfG36DaQ',
          scope: 'chatagent'
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.status}`)
      }

      const data = await response.json()
      return data.access_token
    } catch (err) {
      console.error('Error fetching access token:', err)
      throw err
    }
  }

  // ****************************************
  // Send message to agent
  // ****************************************
  const sendMessage = async (e) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setError(null)

    // Add user message immediately
    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newUserMessage])
    setIsLoading(true)

    try {
      // Get fresh access token
      const accessToken = await getAccessToken()

      // Call the agent directly (for production)
      const response = await fetch(`${AGENT_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Amzn-Bedrock-AgentCore-Runtime-Session-Id': 'session-12345678901234567890123456789012'
        },
        body: JSON.stringify({ prompt: userMessage, accessToken: globalAccessToken })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Add agent response
      const agentMessage = {
        id: Date.now() + 1,
        role: 'agent',
        content: data.response.content[0].text || 'No response received',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, agentMessage])
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err.message || 'Failed to send message')
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        role: 'error',
        content: 'Failed to connect to agent. Please ensure the agent is running on port 8080.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
    inputRef.current?.focus()
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <img
              src="/tapgun-logo.png"
              alt="TAPGUN"
              className="logo-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="logo-icon" style={{ display: 'none' }}>
              <span className="logo-bracket">{'['}</span>
              <span className="logo-text">TAPGUN</span>
              <span className="logo-bracket">{']'}</span>
            </div>
          </div>
          {messages.length > 0 && (
            <button className="clear-btn" onClick={clearChat}>
              Clear Chat
            </button>
          )}
        </div>
      </header>

      <main className="main">
        <div className="chat-container">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">★</div>
              <h2>Ready to assist</h2>
              <p>Send a message to engage</p>
            </div>
          ) : (
            <div className="messages">
              {messages.map((message, index) => (
                <div 
                  key={message.id} 
                  className={`message message-${message.role}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="message-header">
                    <span className="message-role">
                      {message.role === 'user' ? 'YOU' : message.role === 'error' ? 'ERROR' : 'AGENT'}
                    </span>
                    <span className="message-time">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="message-content">
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message message-agent loading">
                  <div className="message-header">
                    <span className="message-role">AGENT</span>
                  </div>
                  <div className="message-content">
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <form className="input-form" onSubmit={sendMessage}>
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="input"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="send-btn"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </form>
        <div className="footer-info">
          <span className="status-indicator"></span>
          Connected to agent <code>{getAgentDisplayName(AGENT_URL)}</code>
        </div>
      </footer>
    </div>
  )
}

export default App
