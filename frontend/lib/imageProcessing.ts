import { ImagePickerAsset } from "expo-image-picker";
import { SaveFormat, manipulateAsync } from "expo-image-manipulator";

import { CaptureAsset } from "./types";

export async function prepareCaptureAsset(asset: ImagePickerAsset): Promise<CaptureAsset | null> {
  const processed = await manipulateAsync(
    asset.uri,
    [{ resize: { width: 1600 } }],
    {
      compress: 0.7,
      format: SaveFormat.JPEG,
      base64: true,
    }
  );

  if (!processed.base64) {
    return null;
  }

  return {
    uri: processed.uri,
    base64: processed.base64,
    mimeType: "image/jpeg",
    capturedAt: new Date().toISOString(),
  };
}