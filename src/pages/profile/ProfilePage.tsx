import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/layout";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  adminProfileSchema,
  type AdminProfileSchema,
} from "@/schemas/adminProfileSchema";
import {
  useOrganizationDetails,
  useUpdateOrganizationDetails,
} from "@/hooks/useOrganizations";
import PhoneInput, { parsePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

// Custom styles for admin phone input
const adminPhoneInputStyles = `
  .admin-phone-input .PhoneInputInput {
    height: 2.5rem;
    border-radius: 0.375rem;
    border: 1px solid #d1d5db;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .admin-phone-input .PhoneInputCountrySelect {
    border: 1px solid #d1d5db;
    border-radius: 0.375rem 0 0 0.375rem;
    border-right: 0;
    height: 2.5rem;
  }
  
  @media (min-width: 768px) {
    .admin-phone-input .PhoneInputInput,
    .admin-phone-input .PhoneInputCountrySelect {
      height: 2.75rem;
    }
  }
`;

export default function AdminProfilePage() {
  const navigate = useNavigate();

  const { data: organization, isLoading } = useOrganizationDetails();

  const updateOrganizationMutation = useUpdateOrganizationDetails();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminProfileSchema>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      organizationName: "",
      phoneNumber: "",
      contactEmail: "",
    },
  });

  useEffect(() => {
    if (organization) {
      // Combine country code and phone number for PhoneInput
      let fullPhoneNumber = "";
      if (organization.organization.phoneNumber) {
        const countryCode =
          (organization.organization as Record<string, string>).countryCode ||
          "+1";
        const nationalNumber = organization.organization.phoneNumber;
        fullPhoneNumber = countryCode + nationalNumber;
      }

      reset({
        organizationName: organization.organization.organizationName || "",
        phoneNumber: fullPhoneNumber,
        contactEmail: organization.organization.contactEmail || "",
      });
    }
  }, [organization, reset]);

  const onSubmit = async (data: AdminProfileSchema) => {
    try {
      // Process phone number to separate country code
      let phoneNumber = data.phoneNumber;
      let countryCode = "+1"; // Default

      if (phoneNumber && phoneNumber.startsWith("+")) {
        try {
          const parsed = parsePhoneNumber(phoneNumber);
          if (parsed) {
            countryCode = `+${parsed.countryCallingCode}`;
            phoneNumber = parsed.nationalNumber;
          }
        } catch (error) {
          console.warn("Could not parse phone number:", error);
        }
      }

      const updateData = {
        organizationName: data.organizationName,
        phoneNumber: phoneNumber,
        countryCode: countryCode,
      };

      await updateOrganizationMutation.mutateAsync(updateData);
    } catch (error) {
      console.error("Error updating organization details:", error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title="Blue Manta Labs"
        subtitle="Admin Profile"
        activePath="/settings"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading profile data...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Blue Manta Labs"
      subtitle="Profile"
      activePath="/settings"
    >
      <style>{adminPhoneInputStyles}</style>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="dashboard-shadow rounded-lg p-8 bg-white">
          <div className="space-y-8">
            {/* Profile Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#0077B6]">
                Profile Information
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">
                    Organization Name
                  </Label>
                  <Input
                    placeholder="Eg. your text here"
                    className="h-11"
                    {...register("organizationName")}
                  />
                  {errors.organizationName && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.organizationName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Phone Number</Label>
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field: { onChange, value } }) => {
                      // Try to detect country from current value, fallback to US
                      let detectedCountry = "US";
                      if (value && value.startsWith("+")) {
                        try {
                          const parsed = parsePhoneNumber(value);
                          if (parsed && parsed.country) {
                            detectedCountry = parsed.country;
                          }
                        } catch {
                          // Keep default if parsing fails
                        }
                      }

                      return (
                        <PhoneInput
                          value={value}
                          onChange={(phoneValue: string | undefined) => {
                            onChange(phoneValue || "");
                          }}
                          defaultCountry={detectedCountry as any}
                          placeholder="Enter phone number"
                          className="admin-phone-input"
                        />
                      );
                    }}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Contact Email</Label>
                  <Input
                    placeholder="Eg. your text here"
                    className="h-11 bg-gray-100 cursor-not-allowed"
                    {...register("contactEmail")}
                    disabled
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[#0077B6]">Password</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 14 }, (_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-black rounded-full"
                    ></div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/password-reset/request")}
                  className="text-gray-500 cursor-pointer hover:text-[#0077B6] text-sm"
                >
                  Reset Password
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || updateOrganizationMutation.isPending}
                className="px-6 py-2 bg-[#0077B6] text-white rounded-md hover:bg-[#005a8b] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || updateOrganizationMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
