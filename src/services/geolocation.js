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
    // Note: Free tier may have CORS restrictions, try with no-cors mode as fallback
    let response;
    try {
      response = await fetch('https://ip-api.com/json/?fields=countryCode', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Don't use no-cors mode as it prevents reading response
        // If CORS fails, we'll catch and default to India
      });
    } catch (fetchError) {
      // Network error or CORS issue
      console.warn('Geolocation fetch failed (CORS/network), defaulting to India:', fetchError);
      const defaultCountry = 'IN';
      sessionStorage.setItem('detectedCountry', defaultCountry);
      return defaultCountry;
    }

    if (!response.ok) {
      // 403 Forbidden or other HTTP errors
      console.warn(`Geolocation API returned ${response.status}, defaulting to India`);
      const defaultCountry = 'IN';
      sessionStorage.setItem('detectedCountry', defaultCountry);
      return defaultCountry;
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

