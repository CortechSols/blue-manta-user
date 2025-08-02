import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "../lib/api";

// Organization type based on API response (Updated to match actual response)
export type Organization = {
  id: number;
  organizationName: string;
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
  organizationName: string;
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
    organizationName: string;
    phoneNumber: string;
    contactEmail: string;
  };
};

// Update organization details request type
export type UpdateOrganizationDetailsRequest = {
  organizationName: string;
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
      return response.data;
    },
    onSuccess: () => {},
  });
}

// Helper function to get full organization name (Fixed field names)
export function getOrganizationFullName(organization: Organization): string {
  if (!organization) {
    return "Unknown Organization";
  }

  const organizationName = organization?.organizationName || "";

  if (!organizationName) {
    return "Unnamed Organization";
  }

  const result = `${organizationName}`.trim();
  return result;
}

// Helper function to get full organization name for detail type
export function getOrganizationDetailFullName(
  organization: OrganizationDetail
): string {
  if (!organization) {
    return "Unknown Organization";
  }

  const organizationName = organization?.organizationName || "";

  if (!organizationName) {
    return "Unnamed Organization";
  }

  const result = `${organizationName}`.trim();
  return result;
}

// Helper function to get full organization name for details type
export function getOrganizationDetailsFullName(
  organization: OrganizationDetails
): string {
  if (!organization) {
    return "Unknown Organization";
  }

  const organizationName = organization?.organization?.organizationName || "";

  if (!organizationName) {
    return "Unnamed Organization";
  }

  const result = `${organizationName}`.trim();
  return result;
}

// Hook to send OTP for password reset
export function useSendPasswordResetOtp() {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/auth/organizations/send_otp/");
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
      return response.data;
    },
  });
}
