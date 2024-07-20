import React, { FC, useState } from "react";

import { styled, useTheme } from "@mui/styles";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import { useSelector } from "react-redux";

import Grid from "@eGroupAI/material/Grid";
import FormControl from "@eGroupAI/material/FormControl";
import FormLabel from "@eGroupAI/material/FormLabel";
import RadioGroup from "@eGroupAI/material/RadioGroup";
import RadioWithLabel from "@eGroupAI/material/RadioWithLabel";
import IconButton from "@eGroupAI/material/IconButton";
import { getWordLibrary } from "redux/wordLibrary/selectors";

const StyledIconButton = styled(IconButton)(() => ({
  backgroundColor: "transparent",
  padding: "1px",
  "&:hover": {
    backgroundColor: "transparent",
  },
}));

interface BulletinInfoReleaseStatusProps {
  isRelease?: number;
  onChange?: (v: number) => void;
}

const BulletinInfoReleaseStatus: FC<BulletinInfoReleaseStatusProps> = (
  props
) => {
  const { isRelease: isReleaseProp, onChange } = props;
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isRelease, setIsRelease] = useState<number>(isReleaseProp || 0);
  const wordLibrary = useSelector(getWordLibrary);
  const theme = useTheme();

  const handleCloseEdit = () => {
    setIsRelease(isReleaseProp || 0);
    setIsEditMode(false);
  };

  const handleSave = () => {
    if (onChange) {
      onChange(isRelease);
    }
    setIsEditMode(false);
  };

  return (
    <Grid item xs={12}>
      <FormControl sx={{ mt: 1, mb: 1, flexDirection: "row" }}>
        <FormLabel component="p" sx={{ mr: 1, color: "rgba(0,0,0,1)" }}>
          發佈狀態:
        </FormLabel>
        {!isEditMode && (
          <FormLabel
            component="p"
            sx={{ color: "rgba(0,0,0,1)", fontWeight: 700 }}
            onClick={() => {
              setIsEditMode(true);
            }}
          >
            {isRelease ? "已發佈" : "未發佈(儲存為未發布)"}
          </FormLabel>
        )}
        {isEditMode && (
          <>
            <RadioGroup
              row
              value={isRelease}
              onChange={(e) => {
                setIsRelease(Number(e.target.value));
              }}
            >
              <RadioWithLabel
                label={wordLibrary?.published ?? "已發佈"}
                value={1}
              />
              <RadioWithLabel label="未發佈" value={0} />
            </RadioGroup>
            <StyledIconButton onClick={handleSave}>
              <CheckCircleRoundedIcon
                sx={{
                  color: theme.palette.success.main,
                }}
              />
            </StyledIconButton>
            <StyledIconButton onClick={handleCloseEdit}>
              <CancelRoundedIcon
                sx={{
                  color: theme.palette.error.main,
                }}
              />
            </StyledIconButton>
          </>
        )}
      </FormControl>
    </Grid>
  );
};

export default BulletinInfoReleaseStatus;
