import apis from "utils/apis";
import { OrganizationMediaField } from "interfaces/form";
import { Locale } from "interfaces/utils";

export default function parseUpdateMediaPromises(
  organizationId: string,
  locale: Locale,
  list?: OrganizationMediaField[]
): Promise<unknown>[] {
  const promises: Promise<unknown>[] = [];
  list?.forEach((el) => {
    if (el.organizationMediaId) {
      promises.push(
        apis.org.updateOrgMedia({
          organizationId,
          organizationMediaId: el.organizationMediaId,
          organizationMediaTitle: el.organizationMediaTitle,
          organizationMediaLinkURL: el.organizationMediaLinkURL,
          organizationMediaYoutubeURL: el.organizationMediaYoutubeURL,
          locale,
          organizationMediaDescription: el.organizationMediaDescription,
          organizationTagList: el.organizationTagList?.map((tag) => ({
            tagId: tag.tagId,
          })),
        })
      );
    }
  });
  return promises;
}
