import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/layout";
import {
  Search,
  Upload,
  FileText,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Trash2,
} from "lucide-react";
import { RefreshButton } from "@/components/ui/refresh-button";
import {
  useChatbots,
  useCreateDataSource,
  useDataSources,
  useChatbotRefresh,
  useDeleteDataSource,
} from "@/hooks/useChatbotApi";
import type { CreateDataSourceRequest, DataSource } from "@/types/chatbot";
import { useAuthStore } from "@/stores/authStore";

export default function DataSourcesPage() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dataSourceToDelete, setDataSourceToDelete] = useState<{
    id: number;
    content: string;
  } | null>(null);
  const [selectedChatbotId, setSelectedChatbotId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedChatbotFilter, setSelectedChatbotFilter] =
    useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // API hooks
  const {
    data: chatbots,
    isLoading: chatbotsLoading,
    error: chatbotsError,
  } = useChatbots();
  const {
    data: dataSourcesData,
    isLoading: dataSourcesLoading,
    error: dataSourcesError,
    refetch: refetchDataSources,
  } = useDataSources({
    page: currentPage,
    page_size: pageSize,
    search_by: debouncedSearchQuery || undefined,
    chatbot_id:
      selectedChatbotFilter !== "all"
        ? parseInt(selectedChatbotFilter)
        : undefined,
  });

  const { user } = useAuthStore();

  const createDataSource = useCreateDataSource();
  const deleteDataSource = useDeleteDataSource();
  const { refreshDataSources } = useChatbotRefresh();

  // Use server-filtered data directly
  const dataSources = Array.isArray(dataSourcesData)
    ? dataSourcesData
    : dataSourcesData?.dataSources || [];

  const handleRefresh = () => {
    refreshDataSources();
    refetchDataSources();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleChatbotFilterChange = (value: string) => {
    setSelectedChatbotFilter(value);
    setCurrentPage(1);
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".pdf", ".docx"];

    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(fileExtension)
    ) {
      alert("Please select a PDF or DOCX file only.");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("File size must be less than 10MB.");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleUpload = async () => {
    if (!selectedChatbotId || !selectedFile) {
      return;
    }

    // Add file to uploading set
    const fileKey = `${selectedFile.name}_${selectedChatbotId}`;
    setUploadingFiles((prev) => new Set(prev).add(fileKey));

    // Determine source type based on file extension
    const fileExtension = selectedFile.name
      .toLowerCase()
      .substring(selectedFile.name.lastIndexOf("."));
    const sourceType = fileExtension === ".pdf" ? "pdf" : "docx";

    const uploadData: CreateDataSourceRequest = {
      chatbot_id: parseInt(selectedChatbotId),
      source_type: sourceType,
      file: selectedFile,
    };

    try {
      await createDataSource.mutateAsync(uploadData);
      // Reset form
      setSelectedChatbotId("");
      setSelectedFile(null);
      setShowUploadModal(false);

      // Refresh the list to show the newly uploaded file
      setTimeout(() => {
        handleRefresh();
      }, 1000);
    } catch (error) {
      console.error("Failed to upload data source:", error);
    } finally {
      // Remove file from uploading set after a delay
      setTimeout(() => {
        setUploadingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileKey);
          return newSet;
        });
      }, 2000);
    }
  };

  const resetForm = () => {
    setSelectedChatbotId("");
    setSelectedFile(null);
  };

  // Check if a data source is currently being uploaded
  const isUploading = (dataSource: DataSource) => {
    // Check if this exact file is currently being uploaded
    for (const fileKey of uploadingFiles) {
      if (fileKey.includes(dataSource.fileName)) {
        return true;
      }
    }
    return false;
  };

  // Show error if chatbots failed to load
  if (chatbotsError) {
    const isBackendNotAvailable = chatbotsError.message?.includes(
      "not available on the backend"
    );

    return (
      <DashboardLayout
        title={`${user?.firstName} ${user?.lastName}`}
        subtitle="Data Sources"
        activePath="/data"
      >
        <Card
          className={`${
            isBackendNotAvailable
              ? "border-orange-200 bg-orange-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle
                className={`h-5 w-5 ${
                  isBackendNotAvailable ? "text-orange-600" : "text-red-600"
                }`}
              />
              <div>
                <h3
                  className={`font-semibold ${
                    isBackendNotAvailable ? "text-orange-800" : "text-red-800"
                  }`}
                >
                  {isBackendNotAvailable
                    ? "Data Sources Feature Not Available"
                    : "Error Loading Data"}
                </h3>
                <p
                  className={
                    isBackendNotAvailable ? "text-orange-600" : "text-red-600"
                  }
                >
                  {chatbotsError.message}
                </p>
                {isBackendNotAvailable && (
                  <p className="text-orange-500 text-sm mt-2">
                    This feature requires chatbot integration. Please ensure
                    chatbots are properly configured first.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`${user?.firstName} ${user?.lastName}`}
      subtitle="Data Sources"
      activePath="/data"
    >
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Data Sources
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              {!Array.isArray(dataSourcesData) && dataSourcesData?.totalCount
                ? `${dataSourcesData.totalCount} total data sources`
                : dataSources.length > 0
                ? `${dataSources.length} data sources`
                : "Upload documents to train your chatbots with specific knowledge"}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
            <RefreshButton
              onRefresh={handleRefresh}
              isLoading={dataSourcesLoading}
              className="text-sm md:text-base"
            />
            <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => resetForm()}
                  className="bg-[#0077B6] hover:bg-[#005A8A] text-white text-sm md:text-base"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Data Source</DialogTitle>
                  <DialogDescription>
                    Upload a PDF or DOCX document to train your chatbot with
                    specific knowledge.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Chatbot Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="chatbot">Select Chatbot</Label>
                    <Select
                      value={selectedChatbotId}
                      onValueChange={setSelectedChatbotId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a chatbot to train" />
                      </SelectTrigger>
                      <SelectContent>
                        {chatbotsLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading chatbots...
                          </SelectItem>
                        ) : chatbots && chatbots.length > 0 ? (
                          chatbots.map((chatbot) => (
                            <SelectItem
                              key={chatbot.id}
                              value={chatbot.id.toString()}
                            >
                              {chatbot.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-chatbots" disabled>
                            No chatbots available. Create a chatbot first.
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>Document File</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                          ? "border-[#0077B6] bg-blue-50"
                          : selectedFile
                          ? "border-green-300 bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      {selectedFile ? (
                        <div className="flex items-center justify-center space-x-3">
                          <FileText className="w-8 h-8 text-green-600" />
                          <div className="text-left">
                            <p className="font-medium text-green-800">
                              {selectedFile.name}
                            </p>
                            <p className="text-sm text-green-600">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFile(null)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                          <div>
                            <p className="text-lg font-medium text-gray-700">
                              Drop your document here or click to browse
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Supports PDF and DOCX files up to 10MB
                            </p>
                          </div>
                          <Input
                            type="file"
                            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleFileInputChange}
                            className="hidden"
                            id="file-upload"
                          />
                          <Button
                            variant="outline"
                            onClick={() =>
                              document.getElementById("file-upload")?.click()
                            }
                          >
                            Choose File
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {createDataSource.isPending && (
                    <Alert>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <AlertDescription>
                        Uploading document... This may take a few moments.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Error Display */}
                  {createDataSource.error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        {createDataSource.error.message ||
                          "Failed to upload document. Please try again."}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={
                      !selectedChatbotId ||
                      !selectedFile ||
                      createDataSource.isPending
                    }
                    className="bg-[#0077B6] hover:bg-[#005A8A]"
                  >
                    {createDataSource.isPending
                      ? "Uploading..."
                      : "Upload Document"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search data sources by file name, chatbot name..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-12 pl-12 pr-4 border-gray-300 rounded-lg"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Chatbot Filter */}
            <div className="flex-1">
              <Select
                value={selectedChatbotFilter}
                onValueChange={handleChatbotFilterChange}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Filter by chatbot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All chatbots</SelectItem>
                  {chatbots?.map((chatbot) => (
                    <SelectItem key={chatbot.id} value={chatbot.id.toString()}>
                      {chatbot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || selectedChatbotFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  handleSearchChange("");
                  handleChatbotFilterChange("all");
                }}
                className="whitespace-nowrap"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Data Sources List */}
        <Card className="dashboard-shadow rounded-lg bg-white">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg text-[#0077B6]">
              Uploaded Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            {/* Show error state for data sources */}
            {dataSourcesError ? (
              <div className="text-center py-6 md:py-8">
                <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-base md:text-lg font-semibold text-red-800 mb-2">
                  Error Loading Data Sources
                </h3>
                <p className="text-sm md:text-base text-red-600 mb-4">
                  {dataSourcesError.message || "Failed to load data sources"}
                </p>
                <RefreshButton
                  onRefresh={handleRefresh}
                  label="Try Again"
                  className="border-red-300 text-red-700 hover:bg-red-100 text-sm md:text-base"
                />
              </div>
            ) : dataSourcesLoading ? (
              <div className="flex items-center justify-center py-6 md:py-8">
                <RefreshCw className="w-5 h-5 md:w-6 md:h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-sm md:text-base text-gray-600">
                  Loading data sources...
                </span>
              </div>
            ) : dataSources &&
              Array.isArray(dataSources) &&
              dataSources.length > 0 ? (
              <div className="overflow-hidden">
                {/* Table Header - Hidden on mobile */}
                <div className="hidden md:grid grid-cols-5 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                  <div className="p-4 text-sm font-medium text-gray-700">
                    File Name
                  </div>
                  <div className="p-4 text-sm font-medium text-gray-700">
                    Chatbot
                  </div>
                  <div className="p-4 text-sm font-medium text-gray-700">
                    Status
                  </div>
                  <div className="p-4 text-sm font-medium text-gray-700">
                    Last Trained
                  </div>
                  <div className="p-4 text-sm font-medium text-gray-700">
                    Actions
                  </div>
                </div>

                {/* Table Rows */}
                {dataSources.map((dataSource) => (
                  <div
                    key={dataSource.id}
                    className="md:grid md:grid-cols-5 md:items-center border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Mobile Layout */}
                    <div className="md:hidden p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <div className="flex flex-col">
                            <span className={"text-sm truncate font-medium"}>
                              {dataSource.fileName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {dataSource.chatbotName}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDataSourceToDelete({
                              id: dataSource.id,
                              content: dataSource.fileName,
                            });
                            setShowDeleteModal(true);
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {isUploading(dataSource) ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          <span
                            className={
                              isUploading(dataSource)
                                ? "text-blue-600"
                                : "text-green-600"
                            }
                          >
                            {isUploading(dataSource)
                              ? "Uploading..."
                              : "Uploaded"}
                          </span>
                        </div>
                        <span className="text-gray-500">
                          {(() => {
                            const now = new Date();
                            const lastSynced = new Date(
                              dataSource.lastSyncedAt
                            );
                            const diffInMinutes = Math.floor(
                              (now.getTime() - lastSynced.getTime()) /
                                (1000 * 60)
                            );

                            if (diffInMinutes < 1) return "Just now";
                            if (diffInMinutes === 1) return "1 min ago";
                            if (diffInMinutes < 60)
                              return `${diffInMinutes} mins ago`;

                            const diffInHours = Math.floor(diffInMinutes / 60);
                            if (diffInHours === 1) return "1 hour ago";
                            if (diffInHours < 24)
                              return `${diffInHours} hours ago`;

                            return lastSynced.toLocaleDateString();
                          })()}
                        </span>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:block p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm truncate">
                          {dataSource.fileName}
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:block p-4">
                      <span className="text-sm text-gray-600">
                        {dataSource.chatbotName}
                      </span>
                    </div>
                    <div className="hidden md:block p-4">
                      <div className="flex items-center gap-2">
                        {isUploading(dataSource) ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        <span
                          className={`text-sm ${
                            isUploading(dataSource)
                              ? "text-blue-600"
                              : "text-green-600"
                          }`}
                        >
                          {isUploading(dataSource)
                            ? "Uploading..."
                            : "Uploaded"}
                        </span>
                      </div>
                    </div>
                    <div className="hidden md:block p-4">
                      <span className="text-sm text-gray-500">
                        {(() => {
                          const now = new Date();
                          const lastSynced = new Date(dataSource.lastSyncedAt);
                          const diffInMinutes = Math.floor(
                            (now.getTime() - lastSynced.getTime()) / (1000 * 60)
                          );

                          if (diffInMinutes < 1) return "Just now";
                          if (diffInMinutes === 1) return "1 min ago";
                          if (diffInMinutes < 60)
                            return `${diffInMinutes} mins ago`;

                          const diffInHours = Math.floor(diffInMinutes / 60);
                          if (diffInHours === 1) return "1 hour ago";
                          if (diffInHours < 24)
                            return `${diffInHours} hours ago`;

                          return lastSynced.toLocaleDateString();
                        })()}
                      </span>
                    </div>
                    <div className="hidden md:block p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDataSourceToDelete({
                            id: dataSource.id,
                            content: dataSource.fileName,
                          });
                          setShowDeleteModal(true);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12">
                <FileText className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-2">
                  {searchQuery || selectedChatbotFilter !== "all"
                    ? "No documents found"
                    : "No documents uploaded yet"}
                </h3>
                <p className="text-sm md:text-base text-gray-500 mb-4">
                  {searchQuery || selectedChatbotFilter !== "all"
                    ? "No documents match your current filters. Try adjusting your search or filters."
                    : "Upload your first document to start training your chatbots with specific knowledge."}
                </p>
                {searchQuery || selectedChatbotFilter !== "all" ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleSearchChange("");
                      handleChatbotFilterChange("all");
                    }}
                    className="text-sm md:text-base"
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-[#0077B6] hover:bg-[#005A8A] text-sm md:text-base"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Your First Document
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Pagination Info */}
        {dataSourcesData && !Array.isArray(dataSourcesData) && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
            <div>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, dataSourcesData.totalCount)} of{" "}
              {dataSourcesData.totalCount} data sources
            </div>
            <div className="flex items-center gap-2">
              <span>
                Page {dataSourcesData.page} of {dataSourcesData.totalPages}
              </span>
              {dataSourcesData.totalPages > 1 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= dataSourcesData.totalPages}
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(dataSourcesData.totalPages, prev + 1)
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={showDeleteModal}
        onOpenChange={(open) => {
          if (!open && !deleteDataSource.isPending) {
            setShowDeleteModal(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{dataSourceToDelete?.content}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteDataSource.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteDataSource.isPending}
              onClick={async () => {
                if (dataSourceToDelete) {
                  try {
                    await deleteDataSource.mutateAsync(dataSourceToDelete.id);
                    setShowDeleteModal(false);
                    setDataSourceToDelete(null);
                    handleRefresh();
                  } catch (error) {
                    console.error("Failed to delete data source:", error);
                  }
                }
              }}
            >
              {deleteDataSource.isPending ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Deleting...
                </div>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
