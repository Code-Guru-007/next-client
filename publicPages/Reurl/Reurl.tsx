import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useShareReurl } from "utils/useShareReurl";
import { Locale, ServiceModuleValue } from "interfaces/utils";

const Reurl = function () {
  const { query, replace } = useRouter();
  const { data } = useShareReurl(
    {
      organizationShareShortUrl: query.url as string,
    },
    {
      locale: Locale.ZH_TW,
    },
    {
      onError: (err) => {
        if (err.response?.status === 403) {
          replace(`/url-invalid`);
        }
      },
    }
  );

  useEffect(() => {
    if (data?.organizationShareTargetType === ServiceModuleValue.CRM_USER) {
      replace(`/filled-user-info?url=${query.url}`);
    } else if (
      data?.organizationShareTargetType === ServiceModuleValue.ARTICLE ||
      data?.organizationShareTargetType === ServiceModuleValue.BULLETIN
    ) {
      replace(`/shares/${data.organizationShareId}?shortURL=${query.url}`);
    }
  }, [data, query.url, replace]);

  return <div />;
};

export default Reurl;
