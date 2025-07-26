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
        className="w-20 hidden md:flex flex-col items-center py-6"
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
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:justify-end md:px-6">
          {/* Logo for mobile */}
          <div className="md:hidden">
            <img
              src="/bml-side-logo.png"
              alt="Blue Manta Labs"
              className="w-10 h-10 object-contain"
            />
          </div>

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
          <div className="absolute top-4 md:top-8 left-1/2 transform -translate-x-1/2 text-center z-10">
            <h1
              className="!text-[20px] md:!text-4xl font-bold mb-2 text-nowrap"
              style={{ color: "#0077B6" }}
            >
              Blue Manta Labs
            </h1>
            <p className="text-lg md:text-2xl" style={{ color: "#00B4D8" }}>
              Manta Engage
            </p>
          </div>

          {/* Background Logo - hidden on small screens to prevent overlap */}
          <div className="hidden lg:block absolute left-0 top-0 bottom-0">
            <img
              src="/bml-side-logo.png"
              alt="Blue Manta Labs Logo"
              className="w-full h-full object-contain relative z-99 lg:w-[327px] xl:w-full xl:h-full xl:object-cover xl:object-center "
            />
          </div>

          <div className="grid place-items-center h-full w-full pt-20 md:pt-32 px-4 lg:pt-[32px] xl:pt-0">
            <Card
              className="shadow-xl rounded-2xl border-0 w-full mb-[20px] lg:mb-0 max-w-sm md:max-w-md"
              style={{ backgroundColor: "#EBF9FC" }}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-6 md:p-8">
                <h2
                  className="text-2xl md:text-4xl font-semibold mb-6 md:mb-8"
                  style={{ color: "#0077B6" }}
                >
                  Organization Login
                </h2>

                {error && (
                  <Alert className="border-red-200 bg-red-50 mb-6 w-full">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="w-full md:w-[75%] space-y-6"
                >
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
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
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-lg transition-colors duration-200"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full px-16 py-3 text-white cursor-pointer font-medium rounded-full h-12 text-base disabled:opacity-50 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                    style={{ backgroundColor: "#03045E" }}
                  >
                    {isLoading ? (
                      <div className="flex items-center cursor-pointer justify-center">
                        <div className="animate-spin cursor-pointer rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Logging in...
                      </div>
                    ) : (
                      "Log In"
                    )}
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
