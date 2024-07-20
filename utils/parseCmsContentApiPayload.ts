import { UpdateOrgCmsContentApiPayload } from "interfaces/payloads";
import { CmsContentFormInput } from "interfaces/form";
import { OrganizationCmsContent } from "interfaces/entities";
import { Locale, ContentType } from "interfaces/utils";

export default function parseCmsContentApiPayload(
  organizationId: string,
  cmsContent: OrganizationCmsContent | undefined,
  values: CmsContentFormInput,
  locale: Locale
): UpdateOrgCmsContentApiPayload {
  return {
    organizationId,
    organizationCmsContentId: cmsContent?.organizationCmsContentId || "",
    organizationCmsContentType:
      cmsContent?.organizationCmsContentType || ContentType.PRODUCT_DESCRIPTION,
    organizationCmsContentTitle: values.organizationCmsContentTitle,
    organizationCmsContentDescription: values.organizationCmsContentDescription,
    locale,
  };
}
