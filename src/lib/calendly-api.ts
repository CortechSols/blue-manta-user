const CALENDLY_OAUTH_BASE_URL = "https://auth.calendly.com";

// PKCE helper functions
function generateRandomString(length: number): string {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

function fallbackSha256(message: string): ArrayBuffer {
  function rotateRight(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }

  function sha256Block(message: Uint8Array): Uint32Array {
    const K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
      0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
      0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
      0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
      0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
      0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
      0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
      0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
      0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];

    const H = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
      0x1f83d9ab, 0x5be0cd19,
    ];

    // Pre-processing
    const msgLength = message.length;
    const msgBits = msgLength * 8;

    // Append single 1 bit
    const paddedLength = msgLength + 1 + ((55 - msgLength) % 64) + 8;
    const paddedMessage = new Uint8Array(paddedLength);
    paddedMessage.set(message);
    paddedMessage[msgLength] = 0x80;

    // Append length as 64-bit big-endian
    const dataView = new DataView(paddedMessage.buffer);
    dataView.setUint32(paddedLength - 4, msgBits & 0xffffffff, false);
    dataView.setUint32(
      paddedLength - 8,
      Math.floor(msgBits / 0x100000000),
      false
    );

    // Process message in 512-bit chunks
    for (let chunk = 0; chunk < paddedMessage.length; chunk += 64) {
      const W = new Uint32Array(64);

      // Break chunk into sixteen 32-bit big-endian words
      for (let i = 0; i < 16; i++) {
        W[i] = dataView.getUint32(chunk + i * 4, false);
      }

      // Extend the sixteen 32-bit words into sixty-four 32-bit words
      for (let i = 16; i < 64; i++) {
        const s0 =
          rotateRight(W[i - 15], 7) ^
          rotateRight(W[i - 15], 18) ^
          (W[i - 15] >>> 3);
        const s1 =
          rotateRight(W[i - 2], 17) ^
          rotateRight(W[i - 2], 19) ^
          (W[i - 2] >>> 10);
        W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
      }

      // Initialize working variables
      let [a, b, c, d, e, f, g, h] = H;

      // Main loop
      for (let i = 0; i < 64; i++) {
        const S1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
        const S0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) >>> 0;

        h = g;
        g = f;
        f = e;
        e = (d + temp1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) >>> 0;
      }

      // Add this chunk's hash to result so far
      H[0] = (H[0] + a) >>> 0;
      H[1] = (H[1] + b) >>> 0;
      H[2] = (H[2] + c) >>> 0;
      H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0;
      H[5] = (H[5] + f) >>> 0;
      H[6] = (H[6] + g) >>> 0;
      H[7] = (H[7] + h) >>> 0;
    }

    return new Uint32Array(H);
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashWords = sha256Block(data);

  // Convert to ArrayBuffer
  const buffer = new ArrayBuffer(32);
  const view = new DataView(buffer);
  for (let i = 0; i < 8; i++) {
    view.setUint32(i * 4, hashWords[i], false);
  }

  return buffer;
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  // Check if crypto.subtle is available (secure context)
  if (window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(plain);
      return await window.crypto.subtle.digest("SHA-256", data);
    } catch (error) {
      console.warn(
        "crypto.subtle failed, falling back to JavaScript implementation:",
        error
      );
      return fallbackSha256(plain);
    }
  } else {
    console.warn(
      "crypto.subtle not available (non-secure context), using fallback SHA-256 implementation"
    );
    return fallbackSha256(plain);
  }
}

function base64URLEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let result = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    result += String.fromCharCode(bytes[i]);
  }
  return btoa(result).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const hashed = await sha256(codeVerifier);
  return base64URLEncode(hashed);
}

// Calendly OAuth Functions
export const calendlyAuth = {
  // Generate OAuth URL with PKCE
  async getAuthUrl(): Promise<string> {
    // Temporary configuration inside function
    const CALENDLY_CLIENT_ID = import.meta.env.VITE_CALENDLY_CLIENT_ID || "8IwTBZ8XJddQwIQIgpwCc9dJkFxTuQhS5J4rvtfcsrY";
    const CALENDLY_REDIRECT_URI =
      import.meta.env.VITE_CALENDLY_REDIRECT_URI ||
      `${window.location.origin}/calendly/callback`;
    const CALENDLY_SCOPE = "default";
    
    // Check if required environment variables are set
    if (!CALENDLY_CLIENT_ID) {
      const errorMsg = "Calendly OAuth is not properly configured. Please set VITE_CALENDLY_CLIENT_ID in your environment variables.";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    // Generate PKCE parameters
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store code verifier for later use
    localStorage.setItem("calendly_code_verifier", codeVerifier);

    const params = new URLSearchParams({
      client_id: CALENDLY_CLIENT_ID,
      response_type: "code",
      redirect_uri: CALENDLY_REDIRECT_URI,
      scope: CALENDLY_SCOPE,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    const authUrl = `${CALENDLY_OAUTH_BASE_URL}/oauth/authorize?${params.toString()}`;
    return authUrl;
  },

  // Start OAuth flow
  async initiateOAuth(): Promise<void> {
    // Temporary configuration inside function
    const CALENDLY_CLIENT_ID = import.meta.env.VITE_CALENDLY_CLIENT_ID;
    
    try {
      
      // Check if environment variables are properly configured
      if (!CALENDLY_CLIENT_ID) {
        const errorMsg = "Calendly OAuth is not properly configured. Please set VITE_CALENDLY_CLIENT_ID in your environment variables.";
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      const authUrl = await this.getAuthUrl();
      
      window.location.href = authUrl;
    } catch (error) {
      console.error("Failed to initiate OAuth:", error);
      throw error;
    }
  },

  // Get stored code verifier
  getCodeVerifier(): string | null {
    return localStorage.getItem("calendly_code_verifier");
  },

  // Clear stored code verifier
  clearCodeVerifier(): void {
    localStorage.removeItem("calendly_code_verifier");
  },
};
