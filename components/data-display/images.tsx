import { ExternalLink, Eye, Image as ImageIcon } from "lucide-react";
import { FC, useState } from "react";

import { TendiflowFile, TendiflowMimeType } from "@/api/services/tendiflow/types/file";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getGoogleStorageFileUrl } from "@/utilities/helpers/file-storage";

import { TendiflowLink } from "../common/tendiflow-link";
import { DataDisplayRow } from "./row";

interface ImagesDisplayRowProps {
  label: string;
  images?: TendiflowFile[] | null;
  caption?: string | null;
  className?: string;
  maxImages?: number;
  gridCols?: 1 | 2 | 3 | 4;
  showMetadata?: boolean;
}

// Helper function to check if file is an image
const isImageFile = (mimeType: TendiflowMimeType): boolean => {
  const imageMimeTypes = [
    TendiflowMimeType.PNG,
    TendiflowMimeType.JPG,
    TendiflowMimeType.GIF,
    TendiflowMimeType.WEBP,
    TendiflowMimeType.TIFF,
    TendiflowMimeType.SVG,
    TendiflowMimeType.ICON,
    TendiflowMimeType.BMP,
  ];
  return imageMimeTypes.includes(mimeType);
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const ImagesDisplayRow: FC<ImagesDisplayRowProps> = ({
  label,
  images,
  caption,
  className = "",
  maxImages,
  gridCols = 3,
  showMetadata = true,
}) => {
  const [selectedImage, setSelectedImage] = useState<TendiflowFile | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(
    new Set(),
  );

  // Filter for image files only
  const imageFiles =
    images?.filter((file) => isImageFile(file.mime_type)) || [];

  // Apply max images limit if specified
  const displayImages = maxImages ? imageFiles.slice(0, maxImages) : imageFiles;
  const remainingCount =
    maxImages && imageFiles.length > maxImages
      ? imageFiles.length - maxImages
      : 0;

  const handleImageError = (imageId: string): void => {
    setImageLoadErrors((prev) => new Set(prev).add(imageId));
  };

  const handleImageLoad = (imageId: string): void => {
    setImageLoadErrors((prev) => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  };

  if (!imageFiles.length) {
    return (
      <DataDisplayRow label={label} caption={caption} className={className}>
        <div className="flex items-center text-gray-400">
          <ImageIcon className="w-4 h-4 mr-2" />
          <span>No images available</span>
        </div>
      </DataDisplayRow>
    );
  }

  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }[gridCols];

  return (
    <>
      <DataDisplayRow label={label} caption={caption} className={className}>
        <div className="space-y-4">
          {/* Images Grid */}
          <div className={`grid ${gridClass} gap-4`}>
            {displayImages.map((image) => {
              const hasError = imageLoadErrors.has(image.id);

              return (
                <div
                  key={image.id}
                  className="group relative bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  {/* Image Container */}
                  <div className="aspect-square relative bg-gray-100">
                    {!hasError ? (
                      <img
                        src={getGoogleStorageFileUrl(image.pathname)}
                        alt={image.name}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(image.id)}
                        onLoad={() => handleImageLoad(image.id)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">
                            Failed to load
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedImage(image)}
                        className="h-8 w-8 p-0"
                        title="View full size"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <TendiflowLink
                        href={getGoogleStorageFileUrl(image.pathname)}
                        target="_blank"
                      >
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </TendiflowLink>
                    </div>
                  </div>

                  {/* Image Metadata */}
                  {showMetadata && (
                    <div className="p-3 space-y-1">
                      <p
                        className="text-sm font-medium text-gray-900 truncate"
                        title={image.name}
                      >
                        {image.name}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatFileSize(image.size_bytes)}</span>
                        {image.created_at && (
                          <span>
                            {new Date(image.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {image.notes && (
                        <p
                          className="text-xs text-gray-600 truncate"
                          title={image.notes}
                        >
                          {image.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Remaining Count */}
          {remainingCount > 0 && (
            <div className="text-sm text-gray-500 text-center">
              + {remainingCount} more image{remainingCount !== 1 ? "s" : ""}
            </div>
          )}

          {/* Summary */}
          <div className="text-xs text-gray-500 border-t pt-2">
            {imageFiles.length} image{imageFiles.length !== 1 ? "s" : ""} •
            Total size:{" "}
            {formatFileSize(
              imageFiles.reduce((sum, img) => sum + img.size_bytes, 0),
            )}
          </div>
        </div>
      </DataDisplayRow>

      {/* Full Size Image Modal */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="w-[90vw] h-[90vh] p-0">
          {selectedImage && (
            <>
              <DialogTitle className="hidden" />
              <div className="relative max-h-[70vh] overflow-auto">
                <img
                  src={getGoogleStorageFileUrl(selectedImage.pathname)}
                  alt={selectedImage.name}
                  className="w-full h-auto rounded-t-lg"
                  onError={() => handleImageError(selectedImage.id)}
                />
              </div>

              {selectedImage.notes && (
                <div className="p-6 pt-2 border-t">
                  <p className="text-sm text-gray-600">{selectedImage.notes}</p>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
