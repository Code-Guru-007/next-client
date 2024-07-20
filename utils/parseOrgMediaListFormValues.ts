import { OrganizationMedia } from "interfaces/entities";
import { OrganizationMediaField } from "interfaces/form";

export default function parseOrgMediaListFormValues(
  mediaList?: OrganizationMedia[]
): OrganizationMediaField[] | undefined {
  return mediaList?.map((el) => ({
    organizationMediaId: el.organizationMediaId,
    uploadFileId: el.uploadFile.uploadFileId,
    uploadFilePath: el.uploadFile.uploadFilePath,
    organizationMediaLinkURL: el.organizationMediaLinkURL || "",
    organizationMediaTitle: el.organizationMediaTitle || "",
    organizationMediaYoutubeURL: el.organizationMediaYoutubeURL || "",
    isUploading: false,
    organizationMediaDescription: el.organizationMediaDescription || "",
    organizationTagList:
      el.organizationTagTargetList?.map((tagTarget) => ({
        tagId: tagTarget.organizationTag.tagId,
        tagName: tagTarget.organizationTag.tagName,
        tagColor: tagTarget.organizationTag.tagColor,
      })) || [],
    organizationMediaSizeType: el.organizationMediaSizeType,
  }));
}
