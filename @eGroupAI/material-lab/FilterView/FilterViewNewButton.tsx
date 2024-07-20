import React, { FC } from "react";
import Button, { ButtonProps } from "@mui/material/Button";
import { CircularProgress } from "@mui/material";
import IconButton from "@mui/material/IconButton";

import styled from "@mui/styles/styled";
import Iconify from "minimal/components/iconify/iconify";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

const StyledButton = styled(Button)(() => ({
  display: "flex",
  justifyContent: "space-around",
  minWidth: 138,
}));

export interface FilterViewNewButtonProps {
  ableToAdd?: boolean;
  btnName?: string;
  onClick?: ButtonProps["onClick"];
  isSaving?: boolean;
}

const FilterViewNewButton: FC<FilterViewNewButtonProps> = (props) => {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    ableToAdd = false,
    btnName = `${wordLibrary?.["save filter conditions"] ?? "儲存篩選條件"}`,
    onClick,
    isSaving,
  } = props;

  const startIcon = (
    <>
      {!isSaving && (
        <IconButton
          color="inherit"
          size="small"
          component="span"
          sx={{
            padding: "1.5px",
          }}
          disableRipple
        >
          <Iconify icon="mingcute:add-line" width={15} />
        </IconButton>
      )}
      {isSaving && <CircularProgress size={20} />}
    </>
  );

  return (
    <StyledButton
      variant="contained"
      startIcon={startIcon}
      disabled={!ableToAdd || isSaving}
      onClick={onClick}
      id="filter-view-new-button"
      data-tid="filter-view-new-button"
    >
      <span>{btnName}</span>
    </StyledButton>
  );
};

export default FilterViewNewButton;
