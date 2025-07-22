import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useResetPassword } from "@/hooks/useOrganizations";
import {
  passwordResetSchema,
  type PasswordResetSchema,
} from "@/schemas/passwordResetSchema";

export default function PasswordResetVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Get email from navigation state
  const email = location.state?.email || "";

  // Password reset mutation
  const resetPasswordMutation = useResetPassword();

  // Form setup with validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<PasswordResetSchema>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Countdown timer for OTP expiration
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Redirect if no email (user didn't come from request page)
  useEffect(() => {
    if (!email) {
      navigate("/settings");
    }
  }, [email, navigate]);

  // Format time left as MM:SS
  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const onSubmit = async (data: PasswordResetSchema) => {
    try {
      await resetPasswordMutation.mutateAsync({
        otp: data.otp,
        newPassword: data.newPassword,
      });

      // Show success message briefly then redirect
      setTimeout(() => {
        navigate("/settings");
      }, 2000);
    } catch (error) {
      console.error("Password reset failed:", error);
    }
  };

  const handleBack = () => {
    navigate("/password-reset/request");
  };

  const handleResendOtp = () => {
    navigate("/password-reset/request");
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
              Back
            </button>
            <CardTitle className="text-2xl font-bold text-[#0077B6]">
              Verify & Reset
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Enter the OTP sent to <span className="font-medium">{email}</span>{" "}
              and your new password
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  OTP Code
                </Label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className="h-11 text-center text-lg tracking-widest"
                  maxLength={6}
                  {...register("otp")}
                />
                {errors.otp && (
                  <p className="text-sm text-red-600">{errors.otp.message}</p>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">
                    {timeLeft > 0 ? (
                      <>Expires in {formatTimeLeft(timeLeft)}</>
                    ) : (
                      <span className="text-red-600">OTP expired</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-[#0077B6] hover:text-[#005a8b] underline"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">New Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="h-11 pr-10"
                    {...register("newPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-600">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="h-11 pr-10"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Error Alert */}
              {resetPasswordMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {resetPasswordMutation.error?.message ||
                      "Failed to reset password. Please check your OTP and try again."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {resetPasswordMutation.isSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Password reset successfully! Redirecting to settings...
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  resetPasswordMutation.isPending ||
                  timeLeft === 0
                }
                className="w-full h-11 bg-[#0077B6] hover:bg-[#005a8b] text-white"
              >
                {isSubmitting || resetPasswordMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Resetting Password...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
