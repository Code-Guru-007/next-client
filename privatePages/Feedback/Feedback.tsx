import React from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Main from "@eGroupAI/material-layout/Main";
import PrivateLayout from "components/PrivateLayout";
import FeedbackDetail from "./FeedbackDetail";

const Feedback = function () {
  const wordLibrary = useSelector(getWordLibrary);
  const translatedTitle = `${wordLibrary?.["網站管理"] ?? "網站管理"} - ${
    wordLibrary?.["聯絡管理"] ?? "聯絡管理"
  } | ${wordLibrary?.["infoCenter platform"] ?? "InfoCenter 智能中台"}`;
  return (
    <PrivateLayout title={translatedTitle}>
      <Main>
        <FeedbackDetail />
      </Main>
    </PrivateLayout>
  );
};

export default Feedback;
