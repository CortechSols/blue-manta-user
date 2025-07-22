import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "../lib/api";

// Organization type based on API response (Updated to match actual response)
export type Organization = {
  id: number;
  firstName: string; // Changed from first_name to firstName
  lastName: string; // Changed from last_name to lastName
  phoneNumber: string; // Changed from phone_number to phoneNumber
  contactEmail: string; // Changed from contact_email to contactEmail
  colors: string[];
  logo: string | null;
  createdBy: {
    // Changed from created_by to createdBy
    id: number;
    email: string;
    username: string;
  };
  createdAt: string; // Changed from created_at to createdAt
};

// Organization type for single organization endpoint (seems to use snake_case)
export type OrganizationDetail = {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  contact_email: string;
  colors: string[];
  logo: string | null;
  created_by: {
    id: number;
    email: string;
    username: string;
  };
  created_at: string;
};

// Organization details type for the specific endpoint
export type OrganizationDetails = {
  organization: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    contactEmail: string;
  };
};

// Update organization details request type
export type UpdateOrganizationDetailsRequest = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

// Hook to fetch all organizations
// Disabled organization fetching for user-specific Calendly integration
// This will be handled differently for individual users
export function useOrganizations() {
  return {
    data: [],
    isLoading: false,
    error: null,
    isError: false,
    isSuccess: true,
  };
}

// Hook to fetch a specific organization by ID
export function useOrganization(organizationId: number | string) {
  return useQuery<OrganizationDetail>({
    queryKey: ["organization", organizationId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/auth/organizations/${organizationId}/`
      );
      console.log("🔥 Single Organization API Response:", response.data);
      return response.data;
    },
    enabled: !!organizationId, // Only run query if organizationId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to fetch organization details from the specific endpoint
export function useOrganizationDetails() {
  return useQuery<OrganizationDetails>({
    queryKey: ["organization", "details"],
    queryFn: async () => {
      const response = await apiClient.get(
        "/auth/organizations/organization_details/"
      );
      console.log("🔥 Organization Details API Response:", response.data);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to update organization details
export function useUpdateOrganizationDetails() {
  return useMutation({
    mutationFn: async (data: UpdateOrganizationDetailsRequest) => {
      const response = await apiClient.patch(
        "/auth/organizations/update_organization_details/",
        data
      );
      console.log(
        "🔥 Update Organization Details API Response:",
        response.data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch organization details
      // This will trigger a refetch of the organization details
      console.log("Organization details updated successfully");
    },
  });
}

// Helper function to get full organization name (Fixed field names)
export function getOrganizationFullName(organization: Organization): string {
  if (!organization) {
    return "Unknown Organization";
  }

  const firstName = organization?.firstName || ""; // Changed to firstName
  const lastName = organization?.lastName || ""; // Changed to lastName

  if (!firstName && !lastName) {
    return "Unnamed Organization";
  }

  const result = `${firstName} ${lastName}`.trim();
  return result;
}

// Helper function to get full organization name for detail type
export function getOrganizationDetailFullName(
  organization: OrganizationDetail
): string {
  if (!organization) {
    return "Unknown Organization";
  }

  const firstName = organization?.first_name || "";
  const lastName = organization?.last_name || "";

  if (!firstName && !lastName) {
    return "Unnamed Organization";
  }

  const result = `${firstName} ${lastName}`.trim();
  return result;
}

// Helper function to get full organization name for details type
export function getOrganizationDetailsFullName(
  organization: OrganizationDetails
): string {
  if (!organization) {
    return "Unknown Organization";
  }

  const firstName = organization?.organization?.firstName || "";
  const lastName = organization?.organization?.lastName || "";

  if (!firstName && !lastName) {
    return "Unnamed Organization";
  }

  const result = `${firstName} ${lastName}`.trim();
  return result;
}

// Hook to send OTP for password reset
export function useSendPasswordResetOtp() {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/auth/organizations/send_otp/");
      console.log("🔥 Send OTP API Response:", response.data);
      return response.data;
    },
  });
}

// Hook to reset password with OTP
export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: { otp: string; newPassword: string }) => {
      const response = await apiClient.post(
        "/auth/organizations/reset_password/",
        data
      );
      console.log("🔥 Reset Password API Response:", response.data);
      return response.data;
    },
  });
}
