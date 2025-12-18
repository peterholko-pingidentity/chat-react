import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

/************************
 * DaVinci components
 ************************/

// Get a Widget sdkToken
async function getDVToken() {
  const companyId = process.env.DAVINCI_COMPANY_ID
  const apiKey = process.env.DAVINCI_API_KEY
  const region = process.env.DAVINCI_REGION || 'com'

  if (!companyId || !apiKey) {
    throw new Error('Missing required DaVinci configuration. Please check your .env file.')
  }

  const url = `https://orchestrate-api.pingone.${region}/v1/company/${companyId}/sdktoken`

  const response = await fetch(url, {
    headers: {
      'X-SK-API-KEY': apiKey
    },
    method: 'GET'
  })

  if (!response.ok) {
    throw new Error(`Failed to get SDK token: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}

// API endpoint to get SDK token
app.get('/api/sdktoken', async (req, res) => {
  try {
    const data = await getDVToken()
    res.json(data)
  } catch (error) {
    console.error('Error getting SDK token:', error)
    res.status(500).json({
      error: 'Failed to get SDK token',
      message: error.message
    })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

app.listen(PORT, () => {
  console.log(`DaVinci SDK Token Server running on http://localhost:${PORT}`)
  console.log(`SDK Token endpoint: http://localhost:${PORT}/api/sdktoken`)
})
