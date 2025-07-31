import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/layout";
import { Upload, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import {
  useOrganization,
  getOrganizationDetailFullName,
} from "@/hooks/useOrganizations";

const brandColors = [
  { color: "#07B7D8", code: "07B7D8" },
  { color: "#14D7FC", code: "14D7FC" },
  { color: "#053D47", code: "053D47" },
  { color: "#90E0EF", code: "90E0EF" },
];

export default function ClientProfilePage() {
  // State for form data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [logo] = useState(""); // Remove setLogo as it's not used yet
  const [chatbotAvatar, setChatbotAvatar] = useState("");
  const [colors, setColors] = useState<string[]>([]);

  // For now, using hardcoded organization ID - you can make this dynamic later
  const organizationId = 1;
  const {
    data: organization,
    isLoading,
    error,
  } = useOrganization(organizationId);

  // Populate form when organization data loads
  useEffect(() => {
    if (organization) {
      console.log("🔥 Populating form with organization data:", organization);
      setFirstName(organization.first_name || "");
      setLastName(organization.last_name || "");
      setPhoneNumber(organization.phone_number || "");
      setContactEmail(organization.contact_email || "");
      setColors(organization.colors || []);
      // setLogo can be set when you have logo URL
    }
  }, [organization]);

  if (isLoading) {
    return (
      <DashboardLayout
        title="Loading..."
        subtitle="Customer Profile"
        activePath="/client-profile"
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
        title="Error"
        subtitle="Customer Profile"
        activePath="/client-profile"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">
            Error loading organization data
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const organizationName = organization
    ? getOrganizationDetailFullName(organization)
    : "Unknown Organization";

  return (
    <DashboardLayout
      title={organizationName}
      subtitle="Customer Profile"
      activePath="/client-profile"
    >
      {/* Save Button */}
      <div className="mb-6 flex justify-end">
        <Button className="bg-cyan-400 hover:bg-cyan-500 text-white px-8">
          Save
        </Button>
      </div>

      <div className="space-y-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#0077B6]">
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  First Name
                </Label>
                <Input
                  placeholder="Eg. your text here"
                  className="mt-1"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Last Name
                </Label>
                <Input
                  placeholder="Eg. your text here"
                  className="mt-1"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <div className="flex mt-1">
                  <div className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                    <span className="text-sm text-gray-600">+1</span>
                  </div>
                  <Input
                    placeholder="Eg. your text here"
                    value={phoneNumber.replace("+1", "")} // Remove +1 prefix for display
                    onChange={(e) => setPhoneNumber(`+1${e.target.value}`)}
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Contact Email
                </Label>
                <Input
                  placeholder="Eg. your text here"
                  className="mt-1"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#0077B6]">
              Brand Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Logo Section */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">
                  Logo
                </Label>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    {logo ? (
                      <img
                        src={logo}
                        alt="Company Logo"
                        className="w-24 h-24 object-contain"
                      />
                    ) : (
                      <img
                        src="/bml-logo.png"
                        alt="Default Logo"
                        className="w-24 h-24 object-contain opacity-50"
                      />
                    )}
                  </div>
                  <Button
                    variant="outline"
                    className="bg-[#0077B6] text-white hover:bg-[#005A8A] border-[#0077B6]"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </div>

              {/* Chatbot Avatar Section */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">
                  Chatbot Avatar
                </Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">Name</Label>
                    <Input
                      defaultValue="Sparkle Bot"
                      className="mt-1"
                      value={chatbotAvatar}
                      onChange={(e) => setChatbotAvatar(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Image</Label>
                    <div className="mt-2 flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center">
                        <div className="w-12 h-12 bg-cyan-200 rounded-full flex items-center justify-center">
                          <div className="w-6 h-6 bg-cyan-400 rounded-full"></div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="bg-[#0077B6] text-white hover:bg-[#005A8A] border-[#0077B6] text-sm"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colors Section */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">
                  Colors
                </Label>
                <div className="space-y-3">
                  {/* Display colors from API */}
                  {colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded border border-gray-300"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-sm font-mono text-gray-600">
                        {color.replace("#", "")}
                      </span>
                    </div>
                  ))}
                  {/* Fallback to default colors if no colors from API */}
                  {colors.length === 0 &&
                    brandColors.map((colorItem, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: colorItem.color }}
                        ></div>
                        <span className="text-sm font-mono text-gray-600">
                          {colorItem.code}
                        </span>
                      </div>
                    ))}
                  <Button
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-800 p-0 h-auto font-normal"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Colors
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#0077B6]">
              Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-1">
                {Array.from({ length: 15 }, (_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gray-800 rounded-full"
                  ></div>
                ))}
              </div>
              <Button
                variant="ghost"
                className="text-gray-500 hover:text-gray-700 p-0 h-auto font-normal text-sm"
              >
                Reset Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
