import { useState } from "react";
import SidebarLayout from "@/components/layouts/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

export default function DownloadProject() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // Create a request to download the project
      const response = await fetch("/api/download-project");

      if (!response.ok) {
        throw new Error("Failed to download project");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "desdig-project.zip";

      // Add to the DOM and trigger the download
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading project:", error);
      alert("Failed to download project. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <SidebarLayout title="Download Project">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Download Project Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <p className="text-center text-gray-600 max-w-md">
                Click the button below to download all project files as a ZIP
                archive.
              </p>
              <Button
                size="lg"
                onClick={handleDownload}
                disabled={isDownloading}
                className="mt-4 bg-green-600 hover:bg-green-700"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-5 w-5" />
                    Download Project Files
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
