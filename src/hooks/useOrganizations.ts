import { useQuery } from "@tanstack/react-query";
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

// Hook to fetch all organizations
export function useOrganizations() {
  return useQuery<Organization[]>({
    queryKey: ["organizations", "list"],
    queryFn: async () => {
      const response = await apiClient.get(
        "/auth/organizations/get_organizations/"
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
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
