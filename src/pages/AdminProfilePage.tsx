import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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

export default function AdminProfilePage() {
  const navigate = useNavigate();
  
  // Fetch organization details
  const { data: organization, isLoading, error } = useOrganizationDetails();

  console.log("organization", organization);

  // Update organization details mutation
  const updateOrganizationMutation = useUpdateOrganizationDetails();

  // Initialize form with React Hook Form and Zod validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminProfileSchema>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      contactEmail: "",
    },
  });

  // Populate form when organization data loads
  useEffect(() => {
    if (organization) {
      console.log("🔥 Populating form with organization data:", organization);
      reset({
        firstName: organization.organization.firstName || "",
        lastName: organization.organization.lastName || "",
        phoneNumber: organization.organization.phoneNumber || "",
        contactEmail: organization.organization.contactEmail || "",
      });
    }
  }, [organization, reset]);

  // Handle form submission
  const onSubmit = async (data: AdminProfileSchema) => {
    try {
      console.log("Form submitted with data:", data);

      // Only send the first three fields (firstName, lastName, phoneNumber)
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
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
          <div className="text-lg text-gray-600">
            Loading organization data...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Blue Manta Labs"
        subtitle="Admin Profile"
        activePath="/settings"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">
            Error loading organization data
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Blue Manta Labs"
      subtitle="Admin Profile"
      activePath="/settings"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="border-2 border-[#0077B6] rounded-lg p-8 bg-white">
          <div className="space-y-8">
            {/* Profile Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#0077B6]">
                Profile Information
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">First Name</Label>
                  <Input
                    placeholder="Eg. your text here"
                    className="h-11"
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Last Name</Label>
                  <Input
                    placeholder="Eg. your text here"
                    className="h-11"
                    {...register("lastName")}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Phone Number</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md h-11">
                      <span className="text-sm text-gray-600">+81</span>
                    </div>
                    <Input
                      placeholder="Eg. your text here"
                      className="rounded-l-none h-11"
                      {...register("phoneNumber")}
                    />
                  </div>
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
                  className="text-gray-500 hover:text-[#0077B6] text-sm"
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
