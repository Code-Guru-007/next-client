import React, { FC, useEffect, useMemo } from "react";

import { setStart, setSuccess } from "redux/filledUserInfo";
import { useAppDispatch } from "redux/configureAppStore";
import { Locale, ServiceModuleValue } from "interfaces/utils";
import usePreviewShareReurl from "utils/usePreviewShareReurl";
import { useSelector } from "react-redux";
import { getSuccess, getStart } from "redux/filledUserInfo/selectors";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";

import Main from "@eGroupAI/material-layout/Main";
import Container from "@eGroupAI/material/Container";
import {
  getWelcomeUploadFiles,
  getFinishUploadFiles,
  getOrgShareWelcomeMessage,
  getOrgShareFinishMessage,
} from "redux/createUserInfoFilledUrlDialog/selectors";
import { ShareReurl } from "interfaces/entities";

import FilledWelcome from "./FilledWelcome";
import FilledSuccess from "./FilledSuccess";
import FilledSteps from "./FilledSteps";

export interface PreviewFilledUserInfoProps {
  organizationShareShortUrl?: string;
  step?: number;
  changeStep?: (value: number) => void;
  isBeforeCreateUrl?: boolean;
  shareEditPreviewValues?: ShareReurl;
}

const PreviewFilledUserInfo: FC<PreviewFilledUserInfoProps> = function (props) {
  const {
    organizationShareShortUrl,
    step,
    changeStep,
    isBeforeCreateUrl = false,
    shareEditPreviewValues,
  } = props;

  const dispatch = useAppDispatch();
  const organizationId = useSelector(getSelectedOrgId);
  const { data } = usePreviewShareReurl(
    {
      organizationId,
      organizationShareShortUrl,
    },
    undefined,
    {
      locale: Locale.ZH_TW,
    }
  );

  const start = useSelector(getStart);
  const success = useSelector(getSuccess);

  const storeWelcomePathFiles = useSelector(
    getWelcomeUploadFiles
  ) as unknown as {
    preview: string;
  };
  const storeWelcomeMessage = useSelector(getOrgShareWelcomeMessage);
  const storeFinishFiles = useSelector(getFinishUploadFiles) as unknown as {
    preview: string;
  };
  const storeFinishMessage = useSelector(getOrgShareFinishMessage);

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
    if (step === 0) {
      dispatch(setStart(true));
    } else if (step === undefined) {
      dispatch(setStart(false));
      dispatch(setSuccess(false));
    }
  }, [dispatch, step]);

  return (
    <Main>
      <Container maxWidth="md">
        {!start && !success && (
          <FilledWelcome
            data={data || shareEditPreviewValues}
            src={
              !isBeforeCreateUrl
                ? welcomePath
                : storeWelcomePathFiles[0]?.preview
            }
            message={
              !isBeforeCreateUrl
                ? data?.organizationShareWelcomeMessage
                : storeWelcomeMessage
            }
            preview
            changeStep={changeStep}
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
            data={data || shareEditPreviewValues}
            step={step}
            preview
            changeStep={changeStep}
            organizationShareShortUrl={organizationShareShortUrl as string}
          />
        </div>
        {success && (
          <FilledSuccess
            src={!isBeforeCreateUrl ? finishPath : storeFinishFiles[0]?.preview}
            message={
              !isBeforeCreateUrl
                ? data?.organizationShareFinishMessage
                : storeFinishMessage
            }
          />
        )}
      </Container>
    </Main>
  );
};

export default PreviewFilledUserInfo;
