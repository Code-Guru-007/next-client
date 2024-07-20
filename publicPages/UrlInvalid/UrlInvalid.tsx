import React from "react";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Main from "@eGroupAI/material-layout/Main";
import FixedCenter from "@eGroupAI/material-layout/FixedCenter";
import Typography from "@eGroupAI/material/Typography";

const UrlInvalid = function () {
  const wordLibrary = useSelector(getWordLibrary);
  return (
    <Main>
      <FixedCenter>
        <Typography variant="h2" align="center">
          {wordLibrary?.["link has expired"] ?? "連結已失效"}
        </Typography>
      </FixedCenter>
    </Main>
  );
};

export default UrlInvalid;
