import * as ImagePicker from 'expo-image-picker';
import { api } from './api';

// What the server accepts for photos (see app/api/s3-upload on the website).
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export interface UploadedImage {
  url: string;
  width: number;
  height: number;
  filename: string;
}

export class UploadError extends Error {}

/** Opens the photo picker. Returns nothing if it is closed without a choice. */
export async function pickImages(options: {
  multiple?: boolean;
  square?: boolean;
}): Promise<ImagePicker.ImagePickerAsset[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: options.multiple ?? false,
    selectionLimit: options.multiple ? 10 : 1,
    allowsEditing: !options.multiple && !!options.square,
    aspect: options.square ? [1, 1] : undefined,
    // Re-encodes as JPEG at a sensible size, which also turns formats the
    // server doesn't take (such as HEIC) into one it does.
    quality: 0.8,
  });
  return result.canceled ? [] : result.assets;
}

function extensionFor(type: string): string {
  return type.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
}

/** Uploads one picked photo and returns where it now lives. */
export async function uploadImage(
  asset: ImagePicker.ImagePickerAsset,
  maxBytes?: number,
): Promise<UploadedImage> {
  // The picker hands back a local file address; fetching it gives the bytes.
  const blob = await (await fetch(asset.uri)).blob();
  const filetype = asset.mimeType ?? blob.type ?? 'image/jpeg';
  if (!IMAGE_TYPES.includes(filetype)) {
    throw new UploadError('That kind of file can’t be used. Choose a photo.');
  }
  if (maxBytes && blob.size > maxBytes) {
    throw new UploadError(
      `That photo is too large. Choose one under ${Math.round(maxBytes / 1024 / 1024)}MB.`,
    );
  }
  const filename =
    asset.fileName ?? `photo-${Date.now()}.${extensionFor(filetype)}`;
  const { url } = await api.uploadFile(blob, { filename, filetype });
  return { url, width: asset.width, height: asset.height, filename };
}
