import * as browserWebP from "./browser-webp/encoder";
import { EncodeOptions as BrowserWebPEncodeOptions } from "./browser-webp/encoder-meta";

function browserWebpEncode(
  data: ImageData,
  opts: BrowserWebPEncodeOptions
): Promise<Blob> {
  return browserWebP.encode(data, opts);
}

export { browserWebpEncode };
