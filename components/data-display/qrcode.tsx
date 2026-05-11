import { Copy, Download, Expand, ExternalLink, QrCode } from "lucide-react";
import { FC, useState } from "react";

import { WeaverFile } from "@/api/services/weaver/types/file";
import { WeaverLink } from "@/components/common/weaver-link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getGoogleStorageFileUrl } from "@/utilities/helpers/file-storage";
import { notify } from "@/utilities/helpers/toaster";

import { DataDisplayRow } from "./row";

interface QrCodeDisplayProps {
  label: string;
  caption?: string;
  className?: string;
  qrcode: WeaverFile;
  checkInUrl?: string | null;
}

export const QrCodeDisplay: FC<QrCodeDisplayProps> = ({
  label,
  caption,
  className = "",
  qrcode,
  checkInUrl,
}) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [imageHasError, setImageHasError] = useState(false);
  const qrcodeUrl = getGoogleStorageFileUrl(qrcode.pathname);

  /**
   * Handles copying text to the clipboard and shows a notification.
   * @param {string} textToCopy - The text to be copied.
   * @param {string} successMessage - The message to show on successful copy.
   */
  const handleCopyToClipboard = async (
    textToCopy: string,
    successMessage: string,
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      notify({ type: "success", message: successMessage });
    } catch (err) {
      notify({
        type: "error",
        message: "Failed to copy. Please try again.",
      });
      console.error("Clipboard copy error:", err);
    }
  };

  /**
   * Handles downloading the QR code image.
   */
  const handleDownload = async (): Promise<void> => {
    try {
      const response = await fetch(qrcodeUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = qrcode.name || "tendiflow-qrcode.png";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      notify({ type: "success", message: "QR code download started." });
    } catch (error) {
      notify({ type: "error", message: "Failed to download QR code." });
      console.error("Download error:", error);
    }
  };

  const isFalse = false;

  return (
    <>
      <DataDisplayRow label={label} caption={caption} className={className}>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* QR Code Image */}
          <div className="relative bg-white p-2 border rounded-lg shadow-sm w-full h-full sm:w-40 sm:h-40 flex-shrink-0">
            {imageHasError ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-500 text-xs text-center">
                <QrCode className="w-8 h-8 mb-2" />
                <span>Could not load QR Code</span>
              </div>
            ) : (
              <img
                src={qrcodeUrl}
                alt="Meeting QR Code"
                className="w-full h-full object-contain"
                onError={() => setImageHasError(true)}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex-grow space-y-3">
            <h4 className="font-medium text-gray-800">Actions</h4>
            <div className="flex flex-wrap gap-2">
              {checkInUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopyToClipboard(checkInUrl, "Check-in URL copied!")
                  }
                >
                  <Copy className="size-4 mr-2" />
                  Copy Check-in URL
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsViewerOpen(true)}
              >
                <Expand className="size-4 mr-2" />
                Expand QR Code
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="size-4 mr-2" />
                Download QR Code
              </Button>
            </div>
            {isFalse && checkInUrl && (
              <div className="pt-2">
                <h4 className="font-medium text-gray-800">Check-in Link</h4>
                <WeaverLink
                  href={checkInUrl}
                  target="_blank"
                  className="text-sm text-blue-600 underline break-all flex items-center gap-1"
                >
                  {checkInUrl}
                  <ExternalLink className="size-3" />
                </WeaverLink>
              </div>
            )}
          </div>
        </div>
      </DataDisplayRow>

      {/* QR Code Viewer Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Meeting QR Code</DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-white rounded-md">
            <img
              src={qrcodeUrl}
              alt="Meeting QR Code"
              className="w-full h-auto"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
