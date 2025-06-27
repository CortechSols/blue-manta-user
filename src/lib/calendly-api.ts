// Calendly OAuth Configuration
const CALENDLY_CLIENT_ID = import.meta.env.VITE_CALENDLY_CLIENT_ID;
const CALENDLY_REDIRECT_URI =
	import.meta.env.VITE_CALENDLY_REDIRECT_URI ||
	`${window.location.origin}/calendly/callback`;
const CALENDLY_SCOPE = "default";

// PKCE helper functions
function generateRandomString(length: number): string {
	const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += charset.charAt(Math.floor(Math.random() * charset.length));
	}
	return result;
}

async function sha256(plain: string): Promise<ArrayBuffer> {
	const encoder = new TextEncoder();
	const data = encoder.encode(plain);
	return await window.crypto.subtle.digest('SHA-256', data);
}

function base64URLEncode(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let result = '';
	for (let i = 0; i < bytes.byteLength; i++) {
		result += String.fromCharCode(bytes[i]);
	}
	return btoa(result)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
	const hashed = await sha256(codeVerifier);
	return base64URLEncode(hashed);
}

// Calendly OAuth Functions
export const calendlyAuth = {
	// Generate OAuth URL with PKCE
	async getAuthUrl(): Promise<string> {
		// Generate PKCE parameters
		const codeVerifier = generateRandomString(128);
		const codeChallenge = await generateCodeChallenge(codeVerifier);
		
		// Store code verifier for later use
		localStorage.setItem('calendly_code_verifier', codeVerifier);
		
		const params = new URLSearchParams({
			client_id: CALENDLY_CLIENT_ID,
			response_type: "code",
			redirect_uri: CALENDLY_REDIRECT_URI,
			scope: CALENDLY_SCOPE,
			code_challenge: codeChallenge,
			code_challenge_method: 'S256',
		});

		return `https://auth.calendly.com/oauth/authorize?${params.toString()}`;
	},

	// Start OAuth flow
	async initiateOAuth(): Promise<void> {
		const authUrl = await this.getAuthUrl();
		window.location.href = authUrl;
	},

	// Get stored code verifier
	getCodeVerifier(): string | null {
		return localStorage.getItem('calendly_code_verifier');
	},

	// Clear stored code verifier
	clearCodeVerifier(): void {
		localStorage.removeItem('calendly_code_verifier');
	},
};
