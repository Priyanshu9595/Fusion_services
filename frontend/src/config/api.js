const configuredApiUrl = import.meta.env.VITE_API_URL || '';
const productionApiUrl = 'https://fusion-services-ohci.onrender.com/api';

export const API_URL = configuredApiUrl.includes('fusion-backend.onrender.com')
  ? productionApiUrl
  : configuredApiUrl || (import.meta.env.PROD ? productionApiUrl : 'http://localhost:5000/api');
