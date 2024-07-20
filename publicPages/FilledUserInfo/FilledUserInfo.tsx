import React, { useEffect, useMemo } from "react";

import { setStart } from "redux/filledUserInfo";
import { useAppDispatch } from "redux/configureAppStore";
import { useRouter } from "next/router";
import { Locale, ServiceModuleValue } from "interfaces/utils";
import { useShareReurl } from "utils/useShareReurl";
import { useSelector } from "react-redux";
import { getSuccess, getStart } from "redux/filledUserInfo/selectors";

import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import FilledWelcome from "./FilledWelcome";
import FilledSuccess from "./FilledSuccess";
import FilledSteps from "./FilledSteps";

const FilledUserInfo = function () {
  const dispatch = useAppDispatch();
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
  const start = useSelector(getStart);
  const success = useSelector(getSuccess);

  const welcomePath = useMemo(
    () =>
      data?.uploadFileList?.find(
        (el) => el.uploadFilePathType === ServiceModuleValue.WELCOME_IMAGE
      )?.uploadFilePath,
    [data?.uploadFileList]
  );
  const finishPath = useMemo(
    () =>
      data?.uploadFileList?.find(
        (el) => el.uploadFilePathType === ServiceModuleValue.FINISH_IMAGE
      )?.uploadFilePath,
    [data?.uploadFileList]
  );

  useEffect(() => {
    if (query.step) {
      dispatch(setStart(true));
    }
  }, [dispatch, query.step]);

  return (
    <Main>
      <Container maxWidth="md">
        {!start && !success && (
          <FilledWelcome
            data={data}
            src={welcomePath}
            message={data?.organizationShareWelcomeMessage}
            preview={false}
          />
        )}
        {/*
         * Use display none to preload pdf. See more detail in below.
         * https://github.com/eGroupAI/infocenter-client/issues/550
         */}
        <div
          style={{
            display: start && !success ? "block" : "none",
            padding: "20px",
          }}
        >
          <FilledSteps
            data={data}
            organizationShareShortUrl={query.url as string}
          />
        </div>
        {success && (
          <FilledSuccess
            src={finishPath}
            message={data?.organizationShareFinishMessage}
          />
        )}
      </Container>
    </Main>
  );
};

export default FilledUserInfo;
