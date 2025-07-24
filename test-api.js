// Simple test script to verify API connection
// Run this in browser console while logged in

console.log('Testing API client...');

// Check if apiClient is available
if (typeof apiClient !== 'undefined') {
  console.log('ApiClient found');
  console.log('Current token:', apiClient.getToken());

  // Test health endpoint
  apiClient
    .healthCheck()
    .then((response) => {
      console.log('Health check success:', response);
    })
    .catch((error) => {
      console.error('Health check failed:', error);
    });

  // Test dashboard endpoint
  apiClient
    .getDashboard()
    .then((response) => {
      console.log('Dashboard success:', response);
    })
    .catch((error) => {
      console.error('Dashboard failed:', error);
    });
} else {
  console.error('ApiClient not found');
}
