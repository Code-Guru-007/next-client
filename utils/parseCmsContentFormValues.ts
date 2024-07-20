import { OrganizationCmsContent, OrganizationMedia } from "interfaces/entities";
import { CmsContentFormInput } from "interfaces/form";
import parseOrgMediaListFormValues from "./parseOrgMediaListFormValues";

export default function parseCmsContentFormValues(
  data: OrganizationCmsContent,
  editItem?: OrganizationMedia,
  disableOneItemAtOnce?: boolean
): CmsContentFormInput {
  if (!editItem)
    if (disableOneItemAtOnce)
      return {
        organizationCmsContentTitle: data.organizationCmsContentTitle,
        organizationCmsContentDescription:
          data.organizationCmsContentDescription,
        organizationMediaList: parseOrgMediaListFormValues(
          data.organizationMediaList
        ),
      };
    else
      return {
        organizationCmsContentTitle: data.organizationCmsContentTitle,
        organizationCmsContentDescription:
          data.organizationCmsContentDescription,
        organizationMediaList: parseOrgMediaListFormValues([]),
      };
  return {
    organizationCmsContentTitle: data.organizationCmsContentTitle,
    organizationCmsContentDescription: data.organizationCmsContentDescription,
    organizationMediaList: parseOrgMediaListFormValues([editItem]),
  };
}
