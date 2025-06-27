// Calendly OAuth Configuration
const CALENDLY_CLIENT_ID = import.meta.env.VITE_CALENDLY_CLIENT_ID;
const CALENDLY_REDIRECT_URI =
	import.meta.env.VITE_CALENDLY_REDIRECT_URI ||
	`${window.location.origin}/calendly/callback`;
const CALENDLY_SCOPE = "default";

// Calendly OAuth Functions
export const calendlyAuth = {
	// Generate OAuth URL
	getAuthUrl(): string {
		const params = new URLSearchParams({
			client_id: CALENDLY_CLIENT_ID,
			response_type: "code",
			redirect_uri: CALENDLY_REDIRECT_URI,
			scope: CALENDLY_SCOPE,
		});

		return `https://auth.calendly.com/oauth/authorize?${params.toString()}`;
	},

	// Start OAuth flow
	initiateOAuth(): void {
		const authUrl = this.getAuthUrl();
		window.location.href = authUrl;
	},
};
