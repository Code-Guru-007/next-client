import { Locale } from "interfaces/utils";
import { ImgSrc } from "interfaces/components";

export type Item = {
  ids: {
    /**
     * primary Id for key & sort
     */
    primaryId: string;
    organizationMediaSliderId?: string;
    organizationProductId?: string;
    organizationSolutionId?: string;
    organizationMediaId?: string;
  };
  title?: string;
  description?: string;
  linkURL?: string;
  imgSrc?: ImgSrc;
  items?: Item[];
};

export type UploadedImg = {
  desktopUrl?: string;
  desktopId?: string;
  mobileUrl?: string;
  mobileId?: string;
};

export type EditDialogState = {
  isUploading: boolean;
  uploadedImgs?: UploadedImg[];
  selectedLocale: Locale;
  selectedDesktop: boolean;
};
