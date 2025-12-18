import { useState, useEffect } from 'react'
import { daVinciConfig, getAuthApiRoot } from './config'
import './DaVinciAuth.css'

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
    // Use a small delay to ensure the widget container is rendered in the DOM
    setTimeout(() => {
      initializeDaVinci()
    }, 100)
  }

  const initializeDaVinci = async () => {
    try {
      // Wait for DaVinci SDK to be available
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

      // Retrieve SDK Token from our secure server endpoint
      const response = await fetch('/api/sdktoken', {
        method: 'GET'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to get SDK token: ${response.status}`)
      }

      const responseData = await response.json()
      console.log('SDK token received successfully')

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
        useModal: false, // Render inline instead of modal
        successCallback,
        errorCallback,
        onCloseModal
      }

      // Render the DaVinci widget
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
    // If not authenticated and modal is closed, show error
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

          {/* Show error state */}
          {error && !showWidget && (
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

          {/* Show DaVinci widget container */}
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
              
              {!isLoading && (
                <div id="davinci-widget-container" className="davinci-widget"></div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default DaVinciAuth