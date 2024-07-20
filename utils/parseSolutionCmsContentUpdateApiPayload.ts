import { UpdateOrgCmsContentApiPayload } from "interfaces/payloads";
import { CmsContentFormInput } from "interfaces/form";
import { Locale, ContentType } from "interfaces/utils";
import parseCreateMediaListApiPayload from "./parseCreateMediaListApiPayload";

export default function parseSolutionCmsContentUpdateApiPayload(
  organizationId: string,
  cmsContentId: string,
  values: CmsContentFormInput,
  locale?: Locale,
  sliderId?: string
): UpdateOrgCmsContentApiPayload {
  return {
    organizationId,
    organizationCmsContentId: cmsContentId,
    organizationCmsContentType: ContentType.CUSTOMIZE,
    organizationCmsContentTitle: values.organizationCmsContentTitle,
    organizationCmsContentDescription: values.organizationCmsContentDescription,
    organizationMediaList: parseCreateMediaListApiPayload(
      values.organizationMediaList
    ),
    locale: locale || Locale.ZH_TW,
    organizationMediaSliderList: sliderId
      ? [
          {
            organizationMediaSliderId: sliderId,
          },
        ]
      : [],
  };
}
