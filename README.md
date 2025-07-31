# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
	extends: [
		// Remove ...tseslint.configs.recommended and replace with this
		...tseslint.configs.recommendedTypeChecked,
		// Alternatively, use this for stricter rules
		...tseslint.configs.strictTypeChecked,
		// Optionally, add this for stylistic rules
		...tseslint.configs.stylisticTypeChecked,
	],
	languageOptions: {
		// other options...
		parserOptions: {
			project: ["./tsconfig.node.json", "./tsconfig.app.json"],
			tsconfigRootDir: import.meta.dirname,
		},
	},
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
	plugins: {
		// Add the react-x and react-dom plugins
		"react-x": reactX,
		"react-dom": reactDom,
	},
	rules: {
		// other rules...
		// Enable its recommended typescript rules
		...reactX.configs["recommended-typescript"].rules,
		...reactDom.configs.recommended.rules,
	},
});
```

# Blue Manta Labs - Manta Engage

## API Integration

This project integrates with the Blue Manta backend API. The following endpoints are currently integrated:

### Authentication

#### Platform Admin Login

- **Endpoint**: `POST /v1/auth/platform-admins/login/`
- **Hook**: `usePlatformAdminLogin()`
- **Payload**: `{ email: string, password: string }`
- **Response**: Returns access/refresh tokens and user info

#### Organization Login

- **Endpoint**: `POST /v1/auth/organizations/login/`
- **Hook**: `useOrganizationLogin()`
- **Payload**: `{ email: string, password: string }`
- **Response**: Returns access/refresh tokens and organization info

### Organizations (Platform Admin Only)

- **List Organizations**: `GET /v1/auth/organizations/` - `useOrganizations()`
- **Create Organization**: `POST /v1/auth/organizations/` - `useCreateOrganization()`
- **Delete Organization**: `DELETE /v1/auth/organizations/{id}/` - `useDeleteOrganization()`

### Chatbots

- **List Chatbots**: `GET /v1/chatbots/chatbots/` - `useChatbots()`
- **Create Chatbot**: `POST /v1/chatbots/chatbots/` - `useCreateChatbot()`

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```
# API Configuration
VITE_API_BASE_URL=http://127.0.0.1:8000/api

# Calendly OAuth Configuration (Required for Calendar integration)
VITE_CALENDLY_CLIENT_ID=your_calendly_client_id_here
VITE_CALENDLY_REDIRECT_URI=http://localhost:5173/calendly/callback

# App Configuration
VITE_APP_URL=http://localhost:5173
```

**Note:** For Calendly integration to work, you need to:
1. Create a Calendly OAuth application in your Calendly account
2. Set the redirect URI to `http://localhost:5173/calendly/callback`
3. Copy the Client ID and add it to the `VITE_CALENDLY_CLIENT_ID` variable

### API Client Features

- Automatic camelCase ↔ snake_case conversion
- Authorization header injection
- Response/Request interceptors
- Error handling

### Authentication Flow

1. User logs in via LoginPage
2. Tokens stored in localStorage
3. Subsequent API calls include Bearer token
4. Use `isAuthenticated()`, `getUserType()`, `logout()` utilities

## Development

The API client is configured to work with the Django backend running on `http://127.0.0.1:8000`. All API hooks use React Query for caching, error handling, and loading states.
