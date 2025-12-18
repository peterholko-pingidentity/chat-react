// DaVinci Configuration
// Update these values with your DaVinci environment settings
// NOTE: The API key is now stored securely server-side in the .env file
export const daVinciConfig = {
  // Your PingOne company/environment ID
  companyId: "484c8d69-2783-4b55-b787-be71c4cd1532",

  // Your DaVinci flow policy ID
  policyId: "a2fb6e133e976381ec1bfc4e7cd36ae8",

  // PingOne region: 'com' (North America), 'eu' (Europe), 'asia' (Asia Pacific), 'ca' (Canada)
  region: "com",

  // Additional configuration
  includeHttpCredentials: false,
  nonce: 'auth-' + Date.now() // String to validate
}

// Helper function to get the auth API root
export const getAuthApiRoot = () =>
  `https://auth.pingone.${daVinciConfig.region}/`
