import { decodeImage } from "./Decoders";
import { browserWebpEncode } from "./Processor";

const compress = async (image: File, encodeData) => {
  const decoded = await decodeImage(image);

  const compressedData = await (() =>
    browserWebpEncode(decoded, encodeData.options))();

  return compressedData;
};

export default compress;
