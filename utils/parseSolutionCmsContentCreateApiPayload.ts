import { CreateOrgCmsContentApiPayload } from "interfaces/payloads";
import { CmsContentFormInput } from "interfaces/form";
import { OrganizationSolution } from "interfaces/entities";
import { Locale, PageType } from "interfaces/utils";
// import parseCreateMediaListApiPayload from "./parseCreateMediaListApiPayload";

export default function parseSolutionCmsContentCreateApiPayload(
  organizationId: string,
  solutionInfo: OrganizationSolution | undefined,
  values: CmsContentFormInput,
  locale?: Locale
  // sliderId?: string
): CreateOrgCmsContentApiPayload {
  return {
    organizationId,
    targetId: solutionInfo?.organizationSolutionId || "",
    organizationCmsPageType: PageType.CUSTOMIZE,
    organizationCmsContentTitle: values.organizationCmsContentTitle,
    organizationCmsContentDescription: values.organizationCmsContentDescription,
    locale,
  };
}
