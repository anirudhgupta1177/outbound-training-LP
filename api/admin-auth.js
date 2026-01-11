import crypto from 'crypto';

// Simple token-based admin authentication
// Uses environment variables for admin credentials

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, action } = req.body;

    // Get admin credentials from environment
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error('Admin credentials not configured');
      return res.status(500).json({ error: 'Admin credentials not configured' });
    }

    // Handle login
    if (action === 'login') {
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Validate credentials
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate a simple token (hash of email + timestamp + secret)
      const tokenData = {
        email: ADMIN_EMAIL,
        iat: Date.now(),
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      
      const tokenString = JSON.stringify(tokenData);
      const token = Buffer.from(tokenString).toString('base64');
      const signature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(token)
        .digest('hex');

      const fullToken = `${token}.${signature}`;

      return res.status(200).json({
        success: true,
        token: fullToken,
        expiresAt: tokenData.exp,
        email: ADMIN_EMAIL
      });
    }

    // Handle token verification
    if (action === 'verify') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided', valid: false });
      }

      const fullToken = authHeader.substring(7);
      const [token, signature] = fullToken.split('.');

      if (!token || !signature) {
        return res.status(401).json({ error: 'Invalid token format', valid: false });
      }

      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(token)
        .digest('hex');

      if (signature !== expectedSignature) {
        return res.status(401).json({ error: 'Invalid token signature', valid: false });
      }

      // Decode and check expiry
      try {
        const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
        
        if (tokenData.exp < Date.now()) {
          return res.status(401).json({ error: 'Token expired', valid: false });
        }

        return res.status(200).json({
          valid: true,
          email: tokenData.email,
          expiresAt: tokenData.exp
        });
      } catch (e) {
        return res.status(401).json({ error: 'Invalid token data', valid: false });
      }
    }

    return res.status(400).json({ error: 'Invalid action. Use "login" or "verify"' });

  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to verify admin token (for use in other API endpoints)
export function verifyAdminToken(authHeader, jwtSecret) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'No token provided' };
  }

  const fullToken = authHeader.substring(7);
  const [token, signature] = fullToken.split('.');

  if (!token || !signature) {
    return { valid: false, error: 'Invalid token format' };
  }

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', jwtSecret)
    .update(token)
    .digest('hex');

  if (signature !== expectedSignature) {
    return { valid: false, error: 'Invalid token signature' };
  }

  // Decode and check expiry
  try {
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
    
    if (tokenData.exp < Date.now()) {
      return { valid: false, error: 'Token expired' };
    }

    return { valid: true, email: tokenData.email };
  } catch (e) {
    return { valid: false, error: 'Invalid token data' };
  }
}

