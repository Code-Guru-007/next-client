import { nativeDecode } from "./compressImage";

export async function decodeImage(blob: Blob): Promise<ImageData> {
  try {
    return await nativeDecode(blob);
  } catch (err) {
    throw Error("Couldn't decode image");
  }
}
