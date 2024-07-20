import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { useSelector } from "react-redux";

import Container from "@eGroupAI/material/Container";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import Main from "@eGroupAI/material-layout/Main";
import useTab from "@eGroupAI/hooks/useTab";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import ResponsiveTabs from "components/ResponsiveTabs";
import PrivateLayout from "components/PrivateLayout";
import useOrgTagGroup from "utils/useOrgTagGroup";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import TagsDataTable from "./TagsDataTable";

const Tags = function () {
  const { query, push, pathname } = useRouter();
  const wordLibrary = useSelector(getWordLibrary);
  const globalLocale = useSelector(getGlobalLocale);
  const organizationId = useSelector(getSelectedOrgId);
  const [locale] = useState<string>(globalLocale);
  const tabData = [
    {
      value: "info",
      label: wordLibrary?.information ?? "資訊",
    },
  ];

  const { value, handleChange } = useTab("TagManagement", "info");

  useEffect(() => {
    if (query.tab) {
      handleChange(query.tab as string);
    }
  }, [query.tab, handleChange]);

  const { data: tagGroup } = useOrgTagGroup(
    {
      organizationId,
      tagGroupId: query.tagGroupId as string,
    },
    {
      locale,
    }
  );

  const translatedTitle =
    (tagGroup?.serviceModuleValue === "SMS_TEMPLATE" &&
      ` ${tagGroup?.tagGroupName || ""} | ${
        wordLibrary?.["標籤管理"] ?? "標籤管理"
      }  - ${wordLibrary?.["簡訊範本"] ?? "簡訊範本"} | ${
        wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
      } `) ||
    (tagGroup?.serviceModuleValue === "SES_TEMPLATE" &&
      ` ${tagGroup?.tagGroupName || ""} | ${
        wordLibrary?.["標籤管理"] ?? "標籤管理"
      } - ${wordLibrary?.["電子郵件範本"] ?? "電子郵件範本"} | ${
        wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
      } `) ||
    (tagGroup?.serviceModuleValue === "FILES" &&
      ` ${tagGroup?.tagGroupName || ""} | ${
        wordLibrary?.["標籤管理"] ?? "標籤管理"
      } - ${wordLibrary?.["檔案管理"] ?? "檔案管理"} | ${
        wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
      } `) ||
    (tagGroup?.serviceModuleValue === "ARTICLE" &&
      ` ${tagGroup?.tagGroupName || ""} | ${
        wordLibrary?.["標籤管理"] ?? "標籤管理"
      } - ${wordLibrary?.["文章討論"] ?? "文章討論"} | ${
        wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
      } `) ||
    (tagGroup?.serviceModuleValue === "BULLETIN" &&
      ` ${tagGroup?.tagGroupName || ""} | ${
        wordLibrary?.["標籤管理"] ?? "標籤管理"
      } - ${wordLibrary?.["佈告欄"] ?? "佈告欄"} | ${
        wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
      } `) ||
    (tagGroup?.serviceModuleValue === "CRM_USER" &&
      ` ${tagGroup?.tagGroupName || ""} | ${
        wordLibrary?.["標籤管理"] ?? "標籤管理"
      } - ${wordLibrary?.["個人列表"] ?? "個人列表"} | ${
        wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
      } `) ||
    (tagGroup?.serviceModuleValue === "CRM_PARTNER" &&
      ` ${tagGroup?.tagGroupName || ""} | ${
        wordLibrary?.["標籤管理"] ?? "標籤管理"
      } - ${wordLibrary?.["單位列表"] ?? "單位列表"} | ${
        wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
      } `) ||
    (tagGroup?.serviceModuleValue === "EVENT" &&
      ` ${tagGroup?.tagGroupName || ""} | ${
        wordLibrary?.["標籤管理"] ?? "標籤管理"
      } - ${wordLibrary?.["事件列表"] ?? "事件列表"} | ${
        wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
      } `) ||
    (tagGroup?.serviceModuleValue === "ORGANIZATION_GROUP" &&
      ` ${tagGroup?.tagGroupName || ""} | ${
        wordLibrary?.["標籤管理"] ?? "標籤管理"
      } - ${wordLibrary?.["單位群組"] ?? "單位群組"} | ${
        wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
      } `) ||
    (tagGroup?.serviceModuleValue === "CMS_BLOG" &&
      ` ${tagGroup?.tagGroupName || ""} | ${
        wordLibrary?.["標籤管理"] ?? "標籤管理"
      } - ${wordLibrary?.["文章管理"] ?? "文章管理"} | ${
        wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
      } `) ||
    (tagGroup?.serviceModuleValue === "CMS_PRODUCT" &&
      ` ${tagGroup?.tagGroupName || ""} | ${
        wordLibrary?.["標籤管理"] ?? "標籤管理"
      } - ${wordLibrary?.["產品管理"] ?? "產品管理"} | ${
        wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
      } `) ||
    (tagGroup?.serviceModuleValue === "CMS_SOLUTION" &&
      ` ${tagGroup?.tagGroupName || ""} | ${
        wordLibrary?.["標籤管理"] ?? "標籤管理"
      } - ${wordLibrary?.["解決方案"] ?? "解決方案"} | ${
        wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
      } `) ||
    `${wordLibrary?.["標籤管理"] ?? "標籤管理"} | ${
      wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"
    }`;

  return (
    <>
      <PrivateLayout title={translatedTitle}>
        <Main sx={{ minHeight: "100vh" }}>
          <Container maxWidth={false}>
            <ResponsiveTabs
              value={value}
              tabData={tabData}
              onChange={(v) => {
                handleChange(v);
                push({
                  pathname,
                  query: {
                    ...query,
                    tab: v,
                  },
                });
              }}
            />
            {value === "info" && (
              <TagsDataTable
                organizationId={organizationId}
                tagGroupId={query.tagGroupId as string}
              />
            )}
          </Container>
        </Main>
      </PrivateLayout>
    </>
  );
};

export default Tags;
