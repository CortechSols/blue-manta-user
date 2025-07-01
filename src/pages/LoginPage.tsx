import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth, useAuthActions } from "@/stores/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { isAuthenticated, isLoading, error } = useAuth();
  const { login, clearError } = useAuthActions();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/calendar");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    try {
      await login(email, password);
      // Navigation will happen automatically via useEffect
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleInputChange = () => {
    if (error) {
      clearError();
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Sidebar */}
      <div
        className="w-20 flex flex-col items-center py-6"
        style={{ backgroundColor: "#90E0EF" }}
      >
        {/* Small Manta Ray Logo at top */}
        <div>
          <img
            src="/bml-side-logo.png"
            alt="Blue Manta Labs"
            className="w-12 h-12 object-contain"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
          {/* User Icon on the right */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#0077B6" }}
          >
            <User className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative">
          {/* Company Branding - positioned at top center */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center">
            <h1
              className="text-4xl font-bold mb-2"
              style={{ color: "#0077B6" }}
            >
              Blue Manta Labs
            </h1>
            <p className="text-2xl" style={{ color: "#00B4D8" }}>
              Manta Engage
            </p>
          </div>

          {/* Background Logo */}
          <div className="absolute left-0 ">
            <img
              src="/bml-side-logo.png"
              alt="Blue Manta Labs Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="grid place-items-center h-full w-full">
            <Card
              className="shadow-lg rounded-2xl border-0 min-w-[60%] max-w-md"
              style={{ backgroundColor: "#EBF9FC" }}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-8">
                <h2
                  className="text-4xl font-semibold mb-8"
                  style={{ color: "#0077B6" }}
                >
                  Organization Login
                </h2>

                {error && (
                  <Alert className="border-red-200 bg-red-50 mb-6">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="w-[50%] space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        handleInputChange();
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          handleInputChange();
                        }}
                        required
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full px-16 py-3 text-white font-medium rounded-full h-12 text-base disabled:opacity-50"
                    style={{ backgroundColor: "#03045E" }}
                  >
                    {isLoading ? "Logging in..." : "Log In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
