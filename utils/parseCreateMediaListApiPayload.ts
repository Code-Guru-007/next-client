import { OrganizationMediaField } from "interfaces/form";
import { OrganizationMediaApiPayload } from "interfaces/payloads";
import {
  OrganizationMediaType,
  OrganizationMediaSizeType,
} from "interfaces/utils";

export default function parseCreateMediaListApiPayload(
  list?: OrganizationMediaField[]
): OrganizationMediaApiPayload[] {
  return (
    list?.map((el) => ({
      organizationMediaSizeType: OrganizationMediaSizeType.NORMAL,
      organizationMediaType: OrganizationMediaType.IMAGE,
      organizationMediaTitle: el.organizationMediaTitle,
      organizationMediaLinkURL: el.organizationMediaLinkURL,
      organizationMediaYoutubeURL: el.organizationMediaYoutubeURL,
      uploadFile: {
        uploadFileId: el.uploadFileId,
      },
    })) || []
  );
}
