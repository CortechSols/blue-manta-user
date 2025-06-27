// Demo authentication for testing Calendly integration
// This simulates the backend authentication until the real backend is ready

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    organization_id: number;
  };
}

// Demo user data
const DEMO_USERS = [
  {
    id: 1,
    email: 'waleedamjad56@gmail.com',
    password: 'demo123', // In real app, this would be hashed
    name: 'Waleed Amjad',
    organization_id: 1,
  },
  {
    id: 2,
    email: 'demo@bluemanta.com',
    password: 'demo123',
    name: 'Demo User',
    organization_id: 1,
  },
];

// Generate a fake JWT token for demo purposes
function generateDemoToken(userId: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    user_id: userId,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    iat: Math.floor(Date.now() / 1000),
  }));
  const signature = btoa('demo-signature'); // In real app, this would be properly signed
  
  return `${header}.${payload}.${signature}`;
}

export async function demoLogin(credentials: LoginCredentials): Promise<AuthResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = DEMO_USERS.find(u => 
    u.email === credentials.email && u.password === credentials.password
  );
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  const accessToken = generateDemoToken(user.id);
  const refreshToken = generateDemoToken(user.id); // In real app, refresh tokens would be different
  
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      organization_id: user.organization_id,
    },
  };
}

export async function demoRefreshToken(refreshToken: string): Promise<{ access_token: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // Decode the refresh token to get user ID (simplified for demo)
    const payload = JSON.parse(atob(refreshToken.split('.')[1]));
    const userId = payload.user_id;
    
    // Check if token is expired (simplified)
    if (payload.exp < Date.now() / 1000) {
      throw new Error('Refresh token expired');
    }
    
    const newAccessToken = generateDemoToken(userId);
    
    return {
      access_token: newAccessToken,
    };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}

// Check if we should use demo authentication
export function shouldUseDemoAuth(): boolean {
  // Only use demo auth if explicitly enabled via environment variable
  return import.meta.env.VITE_USE_DEMO_AUTH === 'true';
} 