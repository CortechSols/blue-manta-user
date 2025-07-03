import { Routes, Route, Navigate } from "react-router-dom";
import { useIsAuthenticated } from "@/stores/authStore";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CalendarPage from "./pages/CalendarPage";
import ContentPage from "./pages/ContentPage";
import ChatHistoryPage from "./pages/ChatHistoryPage";
import ClientProfilePage from "./pages/ClientProfilePage";
import QualityAssurancePage from "./pages/QualityAssurancePage";
import AdminProfilePage from "./pages/AdminProfilePage";
import TrainChatbotPage from "./pages/TrainChatbotPage";
import DataSourcesPage from "./pages/DataSourcesPage";
import CalendarCallbackPage from "./pages/CalendarCallbackPage";
import ChatbotsPage from "./pages/ChatbotsPage";

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
				path="/content" 
				element={
					<ProtectedRoute>
						<ContentPage />
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
				path="/calendly/callback" 
				element={
					<ProtectedRoute>
						<CalendarCallbackPage />
					</ProtectedRoute>
				} 
			/>
			<Route 
				path="/client-profile" 
				element={
					<ProtectedRoute>
						<ClientProfilePage />
					</ProtectedRoute>
				} 
			/>
			<Route 
				path="/qa" 
				element={
					<ProtectedRoute>
						<QualityAssurancePage />
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
				path="/train-chatbot" 
				element={
					<ProtectedRoute>
						<TrainChatbotPage />
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
			
			{/* Fallback route */}
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

export default App;
