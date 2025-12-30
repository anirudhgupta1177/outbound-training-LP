/**
 * Detects user's country using IP geolocation
 * Uses ip-api.com free tier (45 requests/min)
 * @returns {Promise<string>} Country code (e.g., 'IN', 'US')
 */
export const detectCountry = async () => {
  // Check cache first
  const cachedCountry = sessionStorage.getItem('detectedCountry');
  if (cachedCountry) {
    return cachedCountry;
  }

  try {
    // Use ip-api.com free tier
    // fields=countryCode returns just the country code to minimize response
    // Using https to avoid mixed content issues
    const response = await fetch('https://ip-api.com/json/?fields=countryCode', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Geolocation API error');
    }

    const data = await response.json();
    const countryCode = data.countryCode || 'IN'; // Default to India if missing

    // Cache the result for the session
    sessionStorage.setItem('detectedCountry', countryCode);
    
    return countryCode;
  } catch (error) {
    console.warn('Failed to detect country, defaulting to India:', error);
    // Default to India on error
    const defaultCountry = 'IN';
    sessionStorage.setItem('detectedCountry', defaultCountry);
    return defaultCountry;
  }
};

