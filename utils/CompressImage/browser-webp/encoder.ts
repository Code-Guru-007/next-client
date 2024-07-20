import { EncodeOptions, mimeType } from "./encoder-meta";
import { canvasEncode } from "../compressImage";

export function encode(data: ImageData, { quality }: EncodeOptions) {
  return canvasEncode(data, mimeType, quality);
}
