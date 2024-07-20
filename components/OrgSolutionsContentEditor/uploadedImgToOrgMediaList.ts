import { OrganizationMediaApiPayload } from "interfaces/payloads";
import {
  OrganizationMediaSizeType,
  OrganizationMediaType,
} from "interfaces/utils";
import { UploadedImg } from "./typing";

const uploadedImgToOrgMediaList = (
  uploadedImgs?: UploadedImg[]
): OrganizationMediaApiPayload[] => {
  const list: OrganizationMediaApiPayload[] = [];
  if (uploadedImgs?.[0]?.desktopId) {
    list.push({
      organizationMediaType: OrganizationMediaType.IMAGE,
      organizationMediaSizeType: OrganizationMediaSizeType.PC,
      uploadFile: {
        uploadFileId: uploadedImgs[0].desktopId,
      },
    });
  }
  if (uploadedImgs?.[1]?.mobileId) {
    list.push({
      organizationMediaType: OrganizationMediaType.IMAGE,
      organizationMediaSizeType: OrganizationMediaSizeType.MOBILE,
      uploadFile: {
        uploadFileId: uploadedImgs[1].mobileId,
      },
    });
  }
  return list;
};

export default uploadedImgToOrgMediaList;
