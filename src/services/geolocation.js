/**
 * Detects user's country using IP geolocation
 * Uses ip-api.com free tier (45 requests/min)
 * @returns {Promise<string>} Country code (e.g., 'IN', 'US')
 */
/**
 * Detects user's country using IP geolocation
 * Uses multiple APIs with fallback chain for reliability
 * @returns {Promise<string>} Country code (e.g., 'IN', 'US', 'FR')
 */
export const detectCountry = async () => {
  // Check cache first — sessionStorage (this tab) then localStorage (cross-session).
  // A cached country lets repeat visitors resolve the price instantly (no detection
  // round-trip), so the price skeleton doesn't show on return visits.
  const cachedCountry =
    sessionStorage.getItem('detectedCountry') || localStorage.getItem('detectedCountry');
  if (cachedCountry) {
    sessionStorage.setItem('detectedCountry', cachedCountry);
    return cachedCountry;
  }

  // Try multiple geolocation APIs with fallback chain
  // 1. ipapi.co (HTTPS, good CORS, 1000/day free)
  // 2. ipinfo.io (HTTPS, good CORS, 50k/month free)
  // 3. Default to India if all fail
  
  const apis = [
    {
      name: 'ipapi.co',
      url: 'https://ipapi.co/json/',
      parseCountry: (data) => data.country_code
    },
    {
      name: 'ipinfo.io',
      url: 'https://ipinfo.io/json',
      parseCountry: (data) => data.country
    }
  ];

  for (const api of apis) {
    try {
      const response = await fetch(api.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const countryCode = api.parseCountry(data);

        if (countryCode) {
          console.log(`🌍 Detected country via ${api.name}:`, countryCode);
          sessionStorage.setItem('detectedCountry', countryCode);
          localStorage.setItem('detectedCountry', countryCode);
          return countryCode;
        }
      } else {
        console.warn(`${api.name} returned ${response.status}, trying next...`);
      }
    } catch (error) {
      console.warn(`${api.name} failed:`, error.message, '- trying next...');
    }
  }

  // All APIs failed, default to India
  console.warn('All geolocation APIs failed, defaulting to India');
  const defaultCountry = 'IN';
  sessionStorage.setItem('detectedCountry', defaultCountry);
  return defaultCountry;
};

