import React, { FC, useEffect, useState } from "react";

import { UploadFile } from "interfaces/entities";
import { useSelector } from "react-redux";
import { setAgreementFileList } from "redux/filledUserInfo";
import { useAppDispatch } from "redux/configureAppStore";
import { Values } from "components/DynamicField";

import Box from "@eGroupAI/material/Box";
import Button, { ButtonProps } from "@eGroupAI/material/Button";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import StatementSection from "./StatementSection";

export interface UserAgreement {
  url: string;
  files: string[];
}

export interface StatementsProps {
  agreementFiles: UploadFile[];
  organizationShareShortUrl?: string;
  onPrevClick?: ButtonProps["onClick"];
  onNextClick?: (formValues?: Values) => void | Promise<void>;
  setStepperDisable?: (stepperDisable: boolean) => void;
  isFirstStep?: boolean;
  isFinalStep?: boolean;
  /**
   * If setp active.
   */
  active?: boolean;
}

const Statements: FC<StatementsProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    agreementFiles: agreementFileProp,
    organizationShareShortUrl: shortUrl,
    onPrevClick,
    onNextClick,
    setStepperDisable,
    isFirstStep,
    isFinalStep,
    active = false,
  } = props;

  const dispatch = useAppDispatch();

  const user_agreement: UserAgreement = JSON.parse(
    window.localStorage.getItem(`userAgreementFiles-${shortUrl}`) || "{}"
  ) || { url: "", files: [] };
  const user_files = user_agreement.files || [];

  if (setStepperDisable)
    setStepperDisable(active && user_files.length !== agreementFileProp.length);

  const handleToggle = (uploadFileId: string) => () => {
    const user_agreement: UserAgreement = JSON.parse(
      window.localStorage.getItem(`userAgreementFiles-${shortUrl}`) || "{}"
    ) || { url: "", files: [] };
    const user_files = user_agreement.files || [];

    const index = user_files.findIndex((el) => el === uploadFileId);

    if (index === -1) {
      user_files.push(uploadFileId);
    } else {
      user_files.splice(index, 1);
    }
    window.localStorage.setItem(
      `userAgreementFiles-${shortUrl}`,
      JSON.stringify({ url: shortUrl, files: user_files })
    );
    dispatch(setAgreementFileList(user_files));
  };

  const [visibleItems, setVisibleItems] = useState<UploadFile[]>([
    agreementFileProp?.[0] as UploadFile,
  ]);

  useEffect(() => {
    const delay = 3000; // delays to render the document list one-by-one

    const interval = setInterval(() => {
      if (visibleItems.length < agreementFileProp.length) {
        setVisibleItems((prevItems) => [
          ...prevItems,
          agreementFileProp[visibleItems.length] as UploadFile,
        ]);
      } else {
        clearInterval(interval);
      }
    }, delay);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [agreementFileProp, visibleItems.length]);

  return (
    <>
      {visibleItems.map((el, index) => (
        <StatementSection
          key={el.uploadFileId}
          index={index}
          sx={{ px: 3, py: 2, mt: 2 }}
          src={el.uploadFilePath}
          title={el.uploadFileName}
          value={el.uploadFileId}
          checked={user_files.indexOf(el.uploadFileId) !== -1}
          onChange={handleToggle(el.uploadFileId)}
          uploadFileExtensionName={el.uploadFileExtensionName}
        />
      ))}
      <Box mt={2} display="flex" justifyContent="flex-end">
        {!isFirstStep && (
          <Button
            color="primary"
            variant="contained"
            onClick={onPrevClick}
            sx={{ mr: 1 }}
          >
            {wordLibrary?.["go back to the previous step"] ?? "回上一步"}
          </Button>
        )}
        <Button
          color="primary"
          variant="contained"
          disabled={user_files.length !== agreementFileProp.length}
          onClick={() => {
            if (onNextClick) onNextClick();
          }}
        >
          {(() => {
            let output = "";
            if (isFinalStep) {
              output = wordLibrary?.complete ?? "完成";
            } else {
              output = wordLibrary?.["next step"] ?? "下一步";
            }
            return output;
          })()}
        </Button>
      </Box>
    </>
  );
};

export default Statements;
