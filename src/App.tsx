import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import WelcomePage from "./pages/WelcomePage";
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

function App() {
  return (
    <Routes>
      {/* <Route path="/" element={<WelcomePage />} /> */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/content" element={<ContentPage />} />
      <Route path="/chat-history" element={<ChatHistoryPage />} />
      <Route path="/calendly/callback" element={<CalendarCallbackPage />} />
      <Route path="/client-profile" element={<ClientProfilePage />} />
      <Route path="/qa" element={<QualityAssurancePage />} />
      <Route path="/settings" element={<AdminProfilePage />} />
      <Route path="/train-chatbot" element={<TrainChatbotPage />} />
      <Route path="/data" element={<DataSourcesPage />} />
    </Routes>
  );
}

export default App;
