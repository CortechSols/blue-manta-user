import React, { useState } from "react";
import { usePipedreamIntegration } from "@/hooks/usePipedreamIntegration";
import { pipedreamIntegrationSchema, type PipedreamIntegrationInput } from "@/schemas/integrationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertCircle, CheckCircle, Zap, EyeOff, Eye, Trash2, RefreshCw, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PipedreamIntegrationCard: React.FC = () => {
  const {
    store,
    getIntegration,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testIntegration,
  } = usePipedreamIntegration();

  const integration = store.integration;
  console.log("🚀 ~ PipedreamIntegrationCard ~ integration:", integration)
  const [showSecret, setShowSecret] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const form = useForm<PipedreamIntegrationInput>({
    resolver: zodResolver(pipedreamIntegrationSchema),
    defaultValues: integration && integration.configBlob
      ? {
          is_active: integration.isActive,
          config_blob: {
            url: integration.configBlob.url,
            secret: "",
          },
        }
      : {
          is_active: true,
          config_blob: { url: "", secret: "" },
        },
  });

  // Update form when integration changes
  React.useEffect(() => {
    if (integration && integration.configBlob) {
      form.reset({
        is_active: integration.isActive,
        config_blob: {
          url: integration.configBlob.url,
          secret: "",
        },
      });
    }
  }, [integration]);

  const onSubmit = (values: PipedreamIntegrationInput) => {
    if (integration) {
      updateIntegration.mutate(values);
    } else {
      createIntegration.mutate(values);
    }
  };

  const handleTest = () => {
    setTestResult(null);
    testIntegration.mutate(undefined, {
      onSuccess: (data) => {
        setTestResult(data.message || data.error || "No response");
      },
      onError: (err: any) => {
        setTestResult(err.message || "Test failed");
      },
    });
  };

  const handleDisconnect = () => {
    if (window.confirm("Are you sure you want to disconnect Pipedream?")) {
      deleteIntegration.mutate();
    }
  };

  const status = integration && integration.isActive;

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Zap className="text-blue-500 w-5 h-5" />
        <CardTitle className="text-lg">Pipedream Integration</CardTitle>
        <span
          className={`ml-2 flex items-center gap-1 text-sm font-medium ${status ? "text-green-600" : "text-red-500"}`}
          title={status ? "Connected" : "Not Connected"}
        >
          {status ? (
            <>
              <CheckCircle className="w-4 h-4" /> Connected
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" /> Not Connected
            </>
          )}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          title="Refresh integration status"
          onClick={() => getIntegration.refetch()}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-gray-600 text-sm mb-2">
          <span className="font-medium">What is Pipedream?</span> Pipedream lets you connect your app to hundreds of services using webhooks. Enter your Pipedream webhook URL and secret to enable real-time integrations.
        </div>
        {store.error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {store.error}
            </AlertDescription>
          </Alert>
        )}
        {integration && integration.configBlob && (
          <div className="space-y-2">
            <div>
              <span className="font-medium">Webhook URL:</span>
              <span className="ml-2 text-gray-800 select-all">
                {integration.configBlob.url}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Secret:</span>
              <span className="ml-2 text-gray-800">
                {showSecret ? integration.configBlob.secret : "********"}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowSecret((s) => !s)}
                title={showSecret ? "Hide secret" : "Show secret"}
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <span className={`ml-2 ${integration.isActive ? "text-green-600" : "text-red-500"}`}>{integration.isActive ? "Active" : "Inactive"}</span>
            </div>
            <div>
              <span className="font-medium">Connected At:</span>
              <span className="ml-2 text-gray-800">{integration.connectedAt}</span>
            </div>
          </div>
        )}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="url">
              Webhook URL
              <span className="ml-1 text-gray-400" title="Paste your Pipedream webhook URL here.">?</span>
            </label>
            <Input
              id="url"
              type="url"
              placeholder="https://xxxxxx.m.pipedream.net"
              {...form.register("config_blob.url")}
              disabled={createIntegration.isPending || updateIntegration.isPending}
            />
            {form.formState.errors.config_blob?.url && (
              <div className="text-red-500 text-xs mt-1">
                {form.formState.errors.config_blob.url.message}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="secret">
              Secret
              <span className="ml-1 text-gray-400" title="A secret string to secure your webhook.">?</span>
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="secret"
                type="password"
                placeholder="Enter secret"
                autoComplete="new-password"
                {...form.register("config_blob.secret")}
                disabled={createIntegration.isPending || updateIntegration.isPending}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Generate a secure random secret key"
                onClick={() => {
                  // Generate a secure random 24-character alphanumeric secret
                  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                  let secret = "";
                  const array = new Uint32Array(24);
                  window.crypto.getRandomValues(array);
                  for (let i = 0; i < array.length; i++) {
                    secret += charset[array[i] % charset.length];
                  }
                  form.setValue("config_blob.secret", secret, { shouldValidate: true });
                }}
              >
                <KeyRound className="w-4 h-4" />
              </Button>
            </div>
            {form.formState.errors.config_blob?.secret && (
              <div className="text-red-500 text-xs mt-1">
                {form.formState.errors.config_blob.secret.message}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="is_active"
              checked={form.watch("is_active")}
              onCheckedChange={(checked) => form.setValue("is_active", checked)}
              disabled={createIntegration.isPending || updateIntegration.isPending}
            />
            <label htmlFor="is_active" className="text-sm">
              Active
            </label>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={createIntegration.isPending || updateIntegration.isPending}
          >
            {integration ? "Save Changes" : "Connect"}
          </Button>
        </form>
        <div className="flex gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleTest}
            disabled={testIntegration.isPending || !integration}
            title="Send a test event to your Pipedream webhook"
          >
            Test Integration
          </Button>
          {integration && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDisconnect}
              disabled={deleteIntegration.isPending}
              title="Disconnect Pipedream integration"
            >
              <Trash2 className="w-4 h-4 mr-1" /> Disconnect
            </Button>
          )}
        </div>
        {testResult && (
          <Alert className="border-blue-200 bg-blue-50 mt-2">
            <AlertDescription className="text-blue-800">
              {testResult}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}; 