// DaVinci Configuration
// Update these values with your DaVinci environment settings
export const daVinciConfig = {
  // Your PingOne company/environment ID
  companyId: "484c8d69-2783-4b55-b787-be71c4cd1532",

  // Your DaVinci API Key from the DaVinci application
  apiKey: "YOUR_DAVINCI_API_KEY",

  // Your DaVinci flow policy ID
  policyId: "YOUR_POLICY_ID",

  // PingOne region: 'com' (North America), 'eu' (Europe), 'asia' (Asia Pacific), 'ca' (Canada)
  region: "com",

  // Additional configuration
  includeHttpCredentials: true, // Set to true to share cookies
  nonce: 'auth-' + Date.now() // String to validate
}

// Helper function to get the orchestrate API URL
export const getOrchestrateUrl = () =>
  `https://orchestrate-api.pingone.${daVinciConfig.region}/v1/company/${daVinciConfig.companyId}/sdktoken`

// Helper function to get the auth API root
export const getAuthApiRoot = () =>
  `https://auth.pingone.${daVinciConfig.region}/`
