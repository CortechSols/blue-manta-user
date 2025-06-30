import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { User, Search, Bell } from "lucide-react";

export default function WelcomePage() {
  // This would typically come from your auth context or API
  const userName = "Maverick"; // Replace with actual user data
  const organizationName = "SparkleBlue Pool Services"; // Replace with actual org data

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Sidebar */}
      <div
        className="w-20 flex flex-col items-center py-6 border-r border-gray-200 space-y-6"
        style={{ backgroundColor: "#CAF0F8" }}
      >
        {/* Manta Ray Logo at top */}
        <Link to="/dashboard">
          <img
            src="/bml-side-logo.png"
            alt="Blue Manta Labs"
            className="w-15 h-15 object-contain"
          />
        </Link>

        {/* Navigation Icons */}
        <div className="flex flex-col items-center space-y-8">
          <Link to="/dashboard">
            <img
              src="/Img5.png"
              alt="Dashboard"
              className="w-7 h-7 cursor-pointer hover:opacity-75 transition-opacity"
              style={{ color: "#0077B6" }}
            />
          </Link>
          <Link to="/train-chatbot">
            <img
              src="/Img1.png"
              alt="Train Chatbot"
              className="w-7 h-7 cursor-pointer hover:opacity-75 transition-opacity"
              style={{ color: "#0077B6" }}
            />
          </Link>

          <Link to="/calendar">
            <img
              src="/Img2.png"
              alt="Calendar"
              className="w-7 h-7 cursor-pointer hover:opacity-75 transition-opacity"
              style={{ color: "#0077B6" }}
            />
          </Link>
          <Link to="/data">
            <img
              src="/Img3.png"
              alt="Data Sources"
              className="w-7 h-7 cursor-pointer hover:opacity-75 transition-opacity"
              style={{ color: "#0077B6" }}
            />
          </Link>
          <Link to="/chat-history">
            <img
              src="/Img4.png"
              alt="Chat History"
              className="w-7 h-7 cursor-pointer hover:opacity-75 transition-opacity"
              style={{ color: "#0077B6" }}
            />
          </Link>
        </div>

        {/* Settings at bottom */}
        <div className="mt-auto">
          <Link to="/settings">
            <img
              src="/Img6.png"
              alt="Settings"
              className="w-7 h-7 cursor-pointer hover:opacity-75 transition-opacity"
            />
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          {/* Organization Name and Manta Engage */}
          <div className="flex items-center space-x-4">
            <img
              src="/bml-side-logo.png"
              alt="Manta Engage"
              className="w-8 h-8 object-contain"
            />
            <span className="text-lg font-medium" style={{ color: "#0077B6" }}>
              Manta Engage
            </span>
          </div>

          {/* Search, Notifications, and User */}
          <div className="flex items-center space-x-4">
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
              <Search className="w-5 h-5" style={{ color: "#0077B6" }} />
            </button>
            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
              <Bell className="w-5 h-5" style={{ color: "#0077B6" }} />
            </button>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#0077B6" }}
            >
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Organization Name */}
          <h1
            className="text-2xl font-semibold mb-8"
            style={{ color: "#0077B6" }}
          >
            {organizationName}
          </h1>

          {/* Welcome Card */}
          <div className="flex justify-center">
            <Card
              className="w-full max-w-md shadow-lg rounded-2xl border-0"
              style={{ backgroundColor: "#EBF9FC" }}
            >
              <CardContent className="flex flex-col items-center text-center p-8">
                {/* Clean Pool Services Logo */}
                <div className="w-20 h-20 mb-6">
                  <img
                    src="/welcomepageImg.png"
                    alt="CleanPool Services"
                    className="w-full h-full object-contain"
                  />
                </div>

                <h2
                  className="text-2xl font-semibold mb-2"
                  style={{ color: "#0077B6" }}
                >
                  Welcome, {userName}!
                </h2>

                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Ready to turn conversations into customers? Link your channels
                  now and watch Manta Engage in action.
                </p>

                <Button
                  className="px-8 py-3 text-white font-medium rounded-full h-12 text-base"
                  style={{ backgroundColor: "#03045E" }}
                  asChild
                >
                  <Link to="/dashboard">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
