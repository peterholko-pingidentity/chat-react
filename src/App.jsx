import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const getAccessToken = async () => {
    try {
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

      // Call the agent via proxy (for local development)
      // const response = await fetch('/api', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ prompt: userMessage })
      // })

      // Call the agent directly (for production)
      const AGENT_URL = "https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/arn%3Aaws%3Abedrock-agentcore%3Aus-east-1%3A574076504146%3Aruntime%2Fchat_agent-7nKEGmDGN1/invocations?qualifier=DEFAULT"
      const response = await fetch(`${AGENT_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'X-Amzn-Bedrock-AgentCore-Runtime-Session-Id': 'session-12345678901234567890123456789012'
        },
        body: JSON.stringify({ prompt: userMessage })
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
          Connected to agent on <code>localhost:8080</code>
        </div>
      </footer>
    </div>
  )
}

export default App
