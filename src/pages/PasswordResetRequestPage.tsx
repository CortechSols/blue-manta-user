import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { useSendPasswordResetOtp } from "@/hooks/useOrganizations";
import { useOrganizationDetails } from "@/hooks/useOrganizations";

export default function PasswordResetRequestPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  // Fetch organization details to get the user's email
  const { data: organization } = useOrganizationDetails();

  // Send OTP mutation
  const sendOtpMutation = useSendPasswordResetOtp();

  // Pre-fill email when organization data loads
  useEffect(() => {
    if (organization?.organization?.contactEmail) {
      setEmail(organization.organization.contactEmail);
    }
  }, [organization]);

  const handleSendOtp = async () => {
    if (!email) return;

    try {
      await sendOtpMutation.mutateAsync();
      // Navigate to OTP verification page on success
      navigate("/password-reset/verify", {
        state: { email: email },
      });
    } catch (error) {
      console.error("Failed to send OTP:", error);
    }
  };

  const handleBack = () => {
    navigate("/settings");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 border-[#0077B6]">
          <CardHeader className="text-center pb-6">
            <button
              onClick={handleBack}
              className="flex items-center text-[#0077B6] hover:text-[#005a8b] mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </button>
            <CardTitle className="text-2xl font-bold text-[#0077B6]">
              Reset Password
            </CardTitle>
            <p className="text-gray-600 mt-2">
              We'll send an OTP to your email address to reset your password
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email Address
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-gray-100 cursor-not-allowed"
                disabled
                placeholder="your.email@example.com"
              />
              <p className="text-sm text-gray-500">
                OTP will be sent to this email address
              </p>
            </div>

            {/* Error Alert */}
            {sendOtpMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {sendOtpMutation.error?.message ||
                    "Failed to send OTP. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {sendOtpMutation.isSuccess && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  OTP sent successfully! Redirecting to verification page...
                </AlertDescription>
              </Alert>
            )}

            {/* Send OTP Button */}
            <Button
              onClick={handleSendOtp}
              disabled={!email || sendOtpMutation.isPending}
              className="w-full h-11 bg-[#0077B6] hover:bg-[#005a8b] text-white"
            >
              {sendOtpMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Sending OTP...
                </div>
              ) : (
                "Send OTP"
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                OTP will expire in 5 minutes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
