import { Routes, Route, Navigate } from "react-router-dom";
import { useIsAuthenticated } from "@/stores/authStore";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CalendarPage from "./pages/CalendarPage";
import ChatHistoryPage from "./pages/ChatHistoryPage";
import ConversationDetailPage from "./pages/ConversationDetailPage";
import AdminProfilePage from "./pages/AdminProfilePage";
import DataSourcesPage from "./pages/DataSourcesPage";
import CalendarCallbackPage from "./pages/CalendarCallbackPage";
import ChatbotsPage from "./pages/ChatbotsPage";
import ChatbotConfigurationPage from "./pages/ChatbotConfigurationPage";
import CreateChatbotPage from "./pages/CreateChatbotPage";
import PasswordResetRequestPage from "./pages/PasswordResetRequestPage";
import PasswordResetVerifyPage from "./pages/PasswordResetVerifyPage";
import WidgetPage from "./pages/WidgetPage";
import IntegrationsPage from "./pages/IntegrationsPage";

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/widget" element={<WidgetPage />} />

      {/* Password reset routes - protected */}
      <Route
        path="/password-reset/request"
        element={
          <ProtectedRoute>
            <PasswordResetRequestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/password-reset/verify"
        element={
          <ProtectedRoute>
            <PasswordResetVerifyPage />
          </ProtectedRoute>
        }
      />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/calendar" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat-history"
        element={
          <ProtectedRoute>
            <ChatHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/conversation/:conversationId"
        element={
          <ProtectedRoute>
            <ConversationDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendly/callback"
        element={
          <ProtectedRoute>
            <CalendarCallbackPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AdminProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/data"
        element={
          <ProtectedRoute>
            <DataSourcesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chatbots"
        element={
          <ProtectedRoute>
            <ChatbotsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chatbots/create"
        element={
          <ProtectedRoute>
            <CreateChatbotPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chatbots/:id/configure"
        element={
          <ProtectedRoute>
            <ChatbotConfigurationPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/integrations"
        element={
          <ProtectedRoute>
            <IntegrationsPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
