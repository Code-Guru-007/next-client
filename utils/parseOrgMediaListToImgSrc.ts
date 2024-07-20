import { ImgSrc } from "interfaces/components";
import { OrganizationMedia } from "interfaces/entities";
import { OrganizationMediaSizeType } from "interfaces/utils";

function parseOrgMediaListToImgSrc(list?: OrganizationMedia[]): ImgSrc {
  return {
    desktop: list?.find(
      (om) => om.organizationMediaSizeType === OrganizationMediaSizeType.PC
    )?.uploadFile?.uploadFilePath,
    mobile: list?.find(
      (om) => om.organizationMediaSizeType === OrganizationMediaSizeType.MOBILE
    )?.uploadFile?.uploadFilePath,
    normal: list?.find(
      (om) => om.organizationMediaSizeType === OrganizationMediaSizeType.NORMAL
    )?.uploadFile?.uploadFilePath,
  };
}

export default parseOrgMediaListToImgSrc;
