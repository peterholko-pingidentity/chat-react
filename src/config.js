// DaVinci Configuration
// Update these values with your DaVinci environment settings
export const daVinciConfig = {
  // Your PingOne company/environment ID
  companyId: "484c8d69-2783-4b55-b787-be71c4cd1532",

  // Your DaVinci API Key from the DaVinci application
  apiKey: "9e606ef2506c0686c59dd7c03a1dc405595c2c99d8c3a5fcd9445590c71815eb297b10b28238876329b206cd1323e36acb8a81bbf0f553f9e5ac05ea8a4a30db8a6f6a07ac3e95de55db94ee9ef58935e7ead1b754dea2fd2968bd9efee7bb73e48a4ec1697bd2fbe34269c99a7676c2f1885c5a8c3702493ce37c5f5794e26a",

  // Your DaVinci flow policy ID
  policyId: "a2fb6e133e976381ec1bfc4e7cd36ae8",

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
