import {
  OrganizationMedia,
  OrganizationMediaSlider,
} from "interfaces/entities";
import { OrganizationMediaSliderMediaField } from "interfaces/form";

export default function parseOrgMediaSliderMediaListFormValues(
  mediaList?: OrganizationMedia[],
  el?: OrganizationMediaSlider,
  targetId?: string
): OrganizationMediaSliderMediaField[] | undefined {
  return mediaList?.map((media) => ({
    organizationMediaSliderId: el?.organizationMediaSliderId,
    organizationMediaSliderPageType: el?.organizationMediaSliderPageType,
    organizationMediaSliderSort: el?.organizationMediaSliderSort,
    organizationMediaSliderTitle: el?.organizationMediaSliderTitle,
    organizationMediaSliderDescription: el?.organizationMediaSliderDescription,
    organizationMediaSliderYoutubeURL: el?.organizationMediaSliderYoutubeURL,
    organizationMediaSliderLinkURL: el?.organizationMediaSliderLinkURL,
    targetId,
    organizationMediaId: media.organizationMediaId,
    uploadFileId: media.uploadFile.uploadFileId,
    uploadFilePath: media.uploadFile.uploadFilePath,
    organizationMediaLinkURL: media.organizationMediaLinkURL || "",
    organizationMediaTitle: media.organizationMediaTitle || "",
    organizationMediaYoutubeURL: media.organizationMediaYoutubeURL || "",
    isUploading: false,
    organizationMediaDescription: media.organizationMediaDescription || "",
    organizationTagList:
      media.organizationTagTargetList?.map((tagTarget) => ({
        tagId: tagTarget.organizationTag.tagId,
        tagName: tagTarget.organizationTag.tagName,
        tagColor: tagTarget.organizationTag.tagColor,
      })) || [],
    organizationMediaSizeType: media.organizationMediaSizeType,
  }));
}
