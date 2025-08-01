# 🐋 Blue Manta - AI-Powered Customer Engagement Platform

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.10-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Blue Manta** is a comprehensive customer engagement platform that combines AI-powered chatbots, calendar management, and seamless integrations to help businesses connect with their customers more effectively.

## ✨ Features

### 🤖 **AI Chatbots**
- **Customizable Chatbots**: Create and configure AI chatbots with custom branding
- **Multi-format Support**: Upload PDF and DOCX files as knowledge base
- **Real-time Conversations**: Live chat interface with visitor tracking
- **Conversation History**: Complete chat history and analytics
- **Widget Integration**: Embeddable chat widget for websites

### 📅 **Calendar Management**
- **Calendly Integration**: Seamless OAuth integration with Calendly
- **Meeting Management**: View, cancel, and reschedule meetings
- **Multiple Views**: Month, week, day, and agenda views
- **Event Types**: Manage different meeting types and availability
- **Booking Flow**: Integrated booking system with custom forms

### 🔗 **Integrations**
- **Pipedream Webhooks**: Outbound event monitoring and retry system
- **HubSpot Integration**: Lead capture and CRM synchronization
- **Custom Webhooks**: Flexible webhook configuration
- **Event Monitoring**: Real-time event delivery status tracking

### 📊 **Analytics & Dashboard**
- **Performance Metrics**: Conversation analytics and lead conversion rates
- **Top Performers**: Identify best-performing chatbots
- **Activity Charts**: Visual representation of engagement data
- **Real-time Updates**: Live dashboard with current statistics

### 🔐 **Authentication & Security**
- **Multi-user Support**: Platform admin and organization user roles
- **Secure Authentication**: JWT-based authentication system
- **Password Reset**: Secure password recovery flow
- **Protected Routes**: Role-based access control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/blue-manta-user.git
   cd blue-manta-user
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   # API Configuration
   VITE_API_BASE_URL=http://127.0.0.1:8000/api
   
   # Calendly OAuth Configuration
   VITE_CALENDLY_CLIENT_ID=your_calendly_client_id_here
   VITE_CALENDLY_REDIRECT_URI=http://localhost:5173/calendly/callback
   
   # App Configuration
   VITE_APP_URL=http://localhost:5173
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
blue-manta-user/
├── src/
│   ├── components/           # React components
│   │   ├── calendly/        # Calendar management components
│   │   ├── chatbot/         # AI chatbot components
│   │   ├── dashboard/       # Analytics and metrics
│   │   ├── integrations/    # Third-party integrations
│   │   ├── layout/          # Layout components
│   │   ├── ui/              # Reusable UI components (shadcn/ui)
│   │   └── widget/          # Embeddable widgets
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries and services
│   ├── pages/               # Application pages
│   ├── schemas/             # Validation schemas
│   ├── stores/              # State management (Zustand)
│   ├── types/               # TypeScript type definitions
│   └── main.tsx            # Application entry point
├── public/                  # Static assets
└── package.json            # Dependencies and scripts
```

## 🎯 Core Features

### Chatbot Management
- **Create Chatbots**: Set up AI chatbots with custom branding and prompts
- **Upload Knowledge Base**: Support for PDF and DOCX file uploads
- **Customize Appearance**: Brand colors, logos, and chat interface styling
- **Conversation Limits**: Set conversation limits and manage usage
- **Real-time Chat**: Live chat interface with visitor tracking

### Calendar Integration
- **Calendly OAuth**: Secure OAuth integration with Calendly
- **Meeting Views**: Multiple calendar views (month, week, day, agenda)
- **Event Management**: View, cancel, and reschedule meetings
- **Availability Management**: Configure available time slots
- **Booking System**: Integrated booking flow with custom forms

### Data Analytics
- **Dashboard Metrics**: Key performance indicators and analytics
- **Conversation History**: Complete chat history and conversation details
- **Lead Tracking**: Capture and manage leads from conversations
- **Performance Reports**: Top-performing chatbots and conversion rates

### Integration Hub
- **Pipedream Webhooks**: Configure webhook endpoints for event delivery
- **Event Monitoring**: Track outbound event delivery status
- **Retry System**: Automatic retry for failed event deliveries
- **Real-time Status**: Live monitoring of integration health

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Type checking
npm run type-check   # Check TypeScript types
```

### Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS 4.1.10
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **UI Components**: shadcn/ui + Radix UI
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation
- **Date Handling**: date-fns + react-day-picker
- **Charts**: Recharts

### Key Libraries

| Library | Purpose |
|---------|---------|
| `@tanstack/react-query` | Data fetching and caching |
| `zustand` | State management |
| `react-hook-form` | Form handling |
| `zod` | Schema validation |
| `date-fns` | Date manipulation |
| `recharts` | Data visualization |
| `axios` | HTTP client |
| `immer` | Immutable state updates |

## 🔌 API Integration

### Authentication Endpoints
- `POST /v1/auth/platform-admins/login/` - Platform admin login
- `POST /v1/auth/organizations/login/` - Organization login
- `POST /v1/auth/password-reset/request/` - Password reset request
- `POST /v1/auth/password-reset/verify/` - Password reset verification

### Chatbot Endpoints
- `GET /v1/chatbots/chatbots/` - List chatbots
- `POST /v1/chatbots/chatbots/` - Create chatbot
- `PUT /v1/chatbots/chatbots/{id}/` - Update chatbot
- `DELETE /v1/chatbots/chatbots/{id}/` - Delete chatbot
- `GET /v1/chatbots/conversations/` - List conversations
- `POST /v1/chatbots/chat/` - Send chat message

### Calendar Endpoints
- `GET /v1/calendly/connection/` - Get connection status
- `GET /v1/calendly/events/` - List calendar events
- `GET /v1/calendly/meetings/` - List meetings
- `POST /v1/calendly/meetings/{id}/cancel/` - Cancel meeting

### Integration Endpoints
- `GET /v1/integrations/pipedream/` - Get Pipedream integration
- `POST /v1/integrations/pipedream/` - Create Pipedream integration
- `GET /v1/integrations/outbound-events/` - List outbound events

## 🎨 UI Components

The project uses a comprehensive UI component library built with:
- **shadcn/ui**: Modern, accessible React components
- **Radix UI**: Headless UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons

### Available Components
- **Layout**: Cards, containers, grids
- **Forms**: Inputs, selects, checkboxes, switches
- **Navigation**: Tabs, dropdown menus, breadcrumbs
- **Feedback**: Alerts, badges, loading states
- **Data Display**: Tables, lists, charts
- **Overlays**: Modals, dialogs, tooltips

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Role-based access control
- **CSRF Protection**: Cross-site request forgery protection
- **Input Validation**: Comprehensive form validation with Zod
- **Error Boundaries**: Graceful error handling
- **Secure Headers**: Proper security headers configuration

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Configuration
Ensure all required environment variables are set:
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_CALENDLY_CLIENT_ID`: Calendly OAuth client ID
- `VITE_CALENDLY_REDIRECT_URI`: OAuth redirect URI
- `VITE_APP_URL`: Application URL

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint for code quality
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-org/blue-manta-user/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-org/blue-manta-user/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/blue-manta-user/discussions)

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [TanStack Query](https://tanstack.com/query) - Data fetching

---

<div align="center">
  <strong>Made with ❤️ by CorTechSols</strong>
</div>
