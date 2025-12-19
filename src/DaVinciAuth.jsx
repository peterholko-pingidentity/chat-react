import { useState, useEffect } from 'react'
import { daVinciConfig, getAuthApiRoot } from './config'
import './DaVinciAuth.css'
import { setUserToken } from './global'

function DaVinciAuth({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showWidget, setShowWidget] = useState(false)

  const handleLoginClick = () => {
    setShowWelcome(false)
    setShowWidget(true)
    setError(null)
    // Delay to ensure container renders in DOM
    setTimeout(() => {
      initializeDaVinci()
    }, 100)
  }

  const initializeDaVinci = async () => {
    try {
      // Wait for DaVinci SDK
      if (typeof window.davinci === 'undefined') {
        console.log('Waiting for DaVinci SDK to load...')
        setTimeout(initializeDaVinci, 100)
        return
      }

      // Verify container exists
      const widgetContainer = document.getElementById('davinci-widget-container')
      if (!widgetContainer) {
        console.error('Widget container not found in DOM')
        throw new Error('Widget container not found. Please try again.')
      }

      console.log('Widget container found, fetching SDK token...')
      setIsLoading(true)
      setError(null)

      // Get SDK Token
      const response = await fetch('/api/sdktoken', {
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to get SDK token: ${response.status}`)
      }

      const responseData = await response.json()
      console.log('SDK token received successfully')

      // Configure DaVinci widget
      const props = {
        config: {
          method: 'runFlow',
          apiRoot: getAuthApiRoot(),
          accessToken: responseData.access_token,
          companyId: daVinciConfig.companyId,
          policyId: daVinciConfig.policyId,
          includeHttpCredentials: daVinciConfig.includeHttpCredentials,
          parameters: {
            nonce: daVinciConfig.nonce
          }
        },
        useModal: false,
        successCallback,
        errorCallback,
        onCloseModal
      }

      // Render widget
      console.log('Rendering DaVinci widget...')
      window.davinci.skRenderScreen(widgetContainer, props)
      setIsLoading(false)
      console.log('DaVinci widget rendered successfully')
    } catch (err) {
      console.error('Error initializing DaVinci:', err)
      setError(err.message)
      setIsLoading(false)
      setShowWidget(false)
    }
  }

  const successCallback = (response) => {
    console.log('DaVinci authentication successful:', response)
    setUserToken(response.userToken)
    setIsAuthenticated(true)
    setError(null)
    setShowWidget(false)
  }

  const errorCallback = (error) => {
    console.error('DaVinci authentication error:', error)
    setError(error.message || 'Authentication failed')
    setIsAuthenticated(false)
  }

  const onCloseModal = () => {
    console.log('DaVinci modal closed')
    if (!isAuthenticated) {
      setError('Authentication cancelled. Please authenticate to continue.')
      setShowWidget(false)
    }
  }

  const retryAuth = () => {
    setError(null)
    setShowWelcome(false)
    setShowWidget(true)
    setTimeout(() => {
      initializeDaVinci()
    }, 100)
  }

  return (
    <>
      {children}

      {!isAuthenticated && (
        <div className="davinci-overlay">
          {showWelcome && (
            <div className="davinci-welcome">
              <div className="welcome-icon">⌖</div>
              <h1>Thanks for loading the TAPGUN</h1>
              <p>Before continuing you must login</p>
              <button onClick={handleLoginClick} className="login-btn">
                Login
              </button>
            </div>
          )}

          {error && !showWidget && (
            <div className="davinci-error">
              <div className="error-icon">⚠</div>
              <h2>Authentication Error</h2>
              <p>{error}</p>
              <button onClick={retryAuth} className="retry-btn">
                Retry Authentication
              </button>
              <div className="error-details">
                <p>Please check your DaVinci configuration</p>
              </div>
            </div>
          )}

          {showWidget && (
            <div className="davinci-widget-wrapper">
              <div className="davinci-header">
                <div className="davinci-logo">
                  <span className="logo-bracket">{'['}</span>
                  <span className="logo-text">AUTHENTICATE</span>
                  <span className="logo-bracket">{']'}</span>
                </div>
                <p>Please authenticate to access the chat agent</p>
              </div>
              
              {/* Container ALWAYS rendered */}
              <div 
                id="davinci-widget-container" 
                className="davinci-widget"
                style={{ minHeight: '300px', position: 'relative' }}
              ></div>

              {/* Loading overlay */}
              {isLoading && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  zIndex: 10
                }}>
                  <div className="loading-icon">⌖</div>
                  <h2 style={{ 
                    color: 'var(--text-primary)', 
                    fontFamily: 'var(--font-display)', 
                    fontSize: '1.5rem',
                    marginBottom: '1rem'
                  }}>Loading...</h2>
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default DaVinciAuth