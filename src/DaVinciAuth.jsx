import { useState, useEffect } from 'react'
import { daVinciConfig, getAuthApiRoot } from './config'
import './DaVinciAuth.css'

function DaVinciAuth({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showWelcome, setShowWelcome] = useState(true)

  const handleLoginClick = () => {
    setShowWelcome(false)
    setIsLoading(true)
    initializeDaVinci()
  }

  const initializeDaVinci = async () => {
    try {
      // Wait for DaVinci SDK to be available
      if (typeof window.davinci === 'undefined') {
        console.log('Waiting for DaVinci SDK to load...')
        setTimeout(initializeDaVinci, 100)
        return
      }

      setIsLoading(true)
      setError(null)

      // Retrieve SDK Token from our secure server endpoint
      // This keeps the API key secret on the server side
      const response = await fetch('/api/sdktoken', {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`Failed to get SDK token: ${response.status}`)
      }

      const responseData = await response.json()

      // Configure DaVinci widget props
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
        useModal: true, // Use modal for popup behavior
        successCallback,
        errorCallback,
        onCloseModal
      }

      // Render the DaVinci widget
      console.log('Initializing DaVinci widget with props:', props)
      const widgetContainer = document.getElementById('davinci-widget-container')

      if (widgetContainer) {
        window.davinci.skRenderScreen(widgetContainer, props)
      } else {
        throw new Error('Widget container not found')
      }

      setIsLoading(false)
    } catch (err) {
      console.error('Error initializing DaVinci:', err)
      setError(err.message)
      setIsLoading(false)
    }
  }

  const successCallback = (response) => {
    console.log('DaVinci authentication successful:', response)
    setIsAuthenticated(true)
    setError(null)
  }

  const errorCallback = (error) => {
    console.error('DaVinci authentication error:', error)
    setError(error.message || 'Authentication failed')
    setIsAuthenticated(false)
  }

  const onCloseModal = () => {
    console.log('DaVinci modal closed')
    // If not authenticated and modal is closed, show error
    if (!isAuthenticated) {
      setError('Authentication cancelled. Please authenticate to continue.')
    }
  }

  const retryAuth = () => {
    setError(null)
    setIsLoading(true)
    initializeDaVinci()
  }

  return (
    <>
      {/* Always render the children (chat UI) */}
      {children}

      {/* Show overlay with auth widget when not authenticated */}
      {!isAuthenticated && (
        <div className="davinci-overlay">
          {/* Show welcome screen */}
          {showWelcome && (
            <div className="davinci-welcome">
              <div className="welcome-icon">◆</div>
              <h1>Thanks for loading the TAPGUN</h1>
              <p>Before continuing you must login</p>
              <button onClick={handleLoginClick} className="login-btn">
                Login
              </button>
            </div>
          )}

          {/* Show loading state */}
          {isLoading && (
            <div className="davinci-loading">
              <div className="loading-icon">◆</div>
              <h2>Loading authentication...</h2>
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          {/* Show error state */}
          {error && (
            <div className="davinci-error">
              <div className="error-icon">⚠</div>
              <h2>Authentication Error</h2>
              <p>{error}</p>
              <button onClick={retryAuth} className="retry-btn">
                Retry Authentication
              </button>
              <div className="error-details">
                <p>Please check your DaVinci configuration in <code>src/config.js</code></p>
              </div>
            </div>
          )}

          {/* Show DaVinci widget container (modal will be rendered here) */}
          {!showWelcome && !isLoading && !error && (
            <div className="davinci-widget-wrapper">
              <div className="davinci-header">
                <div className="davinci-logo">
                  <span className="logo-bracket">{'['}</span>
                  <span className="logo-text">AUTHENTICATE</span>
                  <span className="logo-bracket">{']'}</span>
                </div>
                <p>Please authenticate to access the chat agent</p>
              </div>
              <div id="davinci-widget-container" className="davinci-widget"></div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default DaVinciAuth
