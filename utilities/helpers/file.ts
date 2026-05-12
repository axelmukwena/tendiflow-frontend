import { TendiflowMimeType } from "@/api/services/tendiflow/types/file";
import { Orientation } from "@/types/general";

/**
 * Creates an HTMLImageElement from a given URL.
 *
 * @param {string} url - The URL of the image to load.
 * @returns {Promise<HTMLImageElement>} A promise that resolves to the created HTMLImageElement.
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();

    // Handle image load event
    image.addEventListener("load", () => resolve(image));

    // Handle image error event
    image.addEventListener("error", (error) => reject(error));

    // Avoid cross-origin issues
    image.setAttribute("crossOrigin", "anonymous");

    // Set the image source
    image.src = url;
  });

/**
 * Converts a degree value to radians.
 *
 * @param {number} degreeValue - The value in degrees to convert.
 * @returns {number} The value in radians.
 */
export function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Calculates the bounding box size after rotation.
 *
 * @param {number} width - The original width of the image.
 * @param {number} height - The original height of the image.
 * @param {number} rotation - The rotation angle in degrees.
 * @returns {{width: number, height: number}} The new width and height after rotation.
 */
export const rotateSize = (
  width: number,
  height: number,
  rotation: number,
): { width: number; height: number } => {
  // Convert rotation angle to radians
  const rotRad = getRadianAngle(rotation);

  // Calculate new bounding box size
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

/**
 * Crops an image based on the provided crop dimensions and applies rotation.
 *
 * @param {string} imageSrc - The source of the image to crop.
 * @param {any} pixelCrop - The crop dimensions.
 * @param {number} [rotation=0] - The rotation to apply (default is 0).
 * @returns {Promise<string | null>} A promise that resolves to the URL of the cropped image.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: any,
  fileType: string,
  rotation = 0,
): Promise<string | null> {
  // Load the image
  const image = await createImage(imageSrc);

  // Create a canvas to draw the image
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  // Calculate rotation in radians
  const rotRad = getRadianAngle(rotation);

  // Get the bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation,
  );

  // Set the canvas size to the bounding box dimensions
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Translate and rotate the canvas context
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Draw the rotated image on the canvas
  ctx.drawImage(image, 0, 0);

  // Create another canvas for the cropped image
  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    return null;
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  // Return the cropped image as a blob URL
  return new Promise<string>((resolve, reject) => {
    croppedCanvas.toBlob((file) => {
      if (file) {
        resolve(URL.createObjectURL(file));
      } else {
        reject(new Error("Canvas is empty"));
      }
    }, fileType);
  });
}

/**
 * Rotates an image and returns the resulting image as a blob URL.
 *
 * @param {string} imageSrc - The source of the image to rotate.
 * @param {number} [rotation=0] - The rotation to apply (default is 0).
 * @returns {Promise<string>} A promise that resolves to the URL of the rotated image.
 */
export async function getRotatedImage(
  imageSrc: string,
  rotation = 0,
): Promise<string> {
  // Load the image
  const image = await createImage(imageSrc);

  // Create a canvas to draw the rotated image
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas is empty");
  }

  // Determine if the rotation changes the orientation (landscape/portrait)
  const orientationChanged =
    rotation === 90 ||
    rotation === -90 ||
    rotation === 270 ||
    rotation === -270;

  // Adjust canvas size based on orientation
  if (orientationChanged) {
    canvas.width = image.height;
    canvas.height = image.width;
  } else {
    canvas.width = image.width;
    canvas.height = image.height;
  }

  // Translate and rotate the canvas context
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  // Return the rotated image as a blob URL
  return new Promise<string>((resolve) => {
    canvas.toBlob((file) => {
      if (!file) {
        throw new Error("Canvas is empty");
      }
      resolve(URL.createObjectURL(file));
    }, TendiflowMimeType.JPG);
  });
}

/**
 * Reads the contents of a file as a data URL.
 *
 * @param {File} file - The file to read.
 * @returns {Promise<string>} A promise that resolves to the data URL of the file.
 */
export const getFileUrl = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => resolve(reader.result as string),
      false,
    );
    reader.readAsDataURL(file);
  });

export const ORIENTATION_TO_ANGLE: Record<Orientation, number> = {
  [Orientation.TOP_LEFT]: 0, // No rotation needed
  [Orientation.TOP_RIGHT]: 0, // No rotation needed
  [Orientation.BOTTOM_RIGHT]: 180, // 180-degree rotation
  [Orientation.BOTTOM_LEFT]: 0, // No rotation needed
  [Orientation.LEFT_TOP]: 0, // No rotation needed
  [Orientation.RIGHT_TOP]: 90, // 90-degree rotation
  [Orientation.RIGHT_BOTTOM]: 0, // No rotation needed
  [Orientation.LEFT_BOTTOM]: -90, // -90-degree rotation
};

/**
 * Get a Dummy File for testing purposes.
 * @returns {File} - A dummy image file.
 */
export const getImageDummyFile = (): File => {
  const randomId = Math.random().toString(36).substring(7);
  return new File(["dummy image content"], `${randomId}.png`, {
    type: "image/png",
    lastModified: new Date().getTime(),
  });
};

/**
 * Get a Dummy PDF File for testing purposes.
 * @returns {File} - A dummy PDF file.
 */
export const getPdfDummyFile = (): File => {
  const randomId = Math.random().toString(36).substring(7);
  return new File(["dummy pdf content"], `${randomId}.pdf`, {
    type: "application/pdf",
    lastModified: new Date().getTime(),
  });
};
