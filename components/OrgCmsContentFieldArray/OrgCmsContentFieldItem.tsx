import React, {
  forwardRef,
  HTMLAttributes,
  memo,
  useEffect,
  useRef,
} from "react";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";

import { makeStyles } from "@mui/styles";

import {
  CmsContentsFormInput,
  OrganizationCmsContentField,
} from "interfaces/form";

import {
  Box,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { IconButtonProps } from "@eGroupAI/material/IconButton";
import Iconify from "minimal/components/iconify";
import { usePopover } from "minimal/components/custom-popover";
import CustomPopover from "minimal/components/custom-popover/custom-popover";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    marginBottom: theme.spacing(1),
    display: "flex",
    justifyContent: "center",
  },
  remove: {
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 10,
  },
  sortContainer: {
    marginBottom: "20px",
    background: theme.palette.mode === "dark" ? "#212b36" : "white",
    borderRadius: "16px",
    cursor: "pointer",
  },
  sortItems: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px",
  },
  sortItemsInner: {
    display: "flex",
    padding: "10px",
    alignItems: "center",
    width: "calc(100% - 36px)",
  },
  main: {
    position: "relative",
    overflow: "hidden",
    width: "fit-content",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "8px",
  },
  mask: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    display: "none",
  },
  maskShow: {
    display: "flex",
  },
  sortIcon: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    color: theme.palette.common.white,
    cursor: "move",
    opacity: 0.6,
    transition: "all 0.4s",

    "&:hover": {
      opacity: 1,
    },
  },
  dropzone: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  },
  inputSizer: {
    "&::before, &::after": {
      boxSizing: "border-box",
    },

    display: "inline-grid",
    verticalAlign: "top",
    alignItems: "center",
    position: "relative",
    border: "none",
    width: "auto",
    minWidth: "200px",
    maxWidth: "50%",

    "&::after": {
      [theme.breakpoints.down("sm")]: {
        width: "200px",
      },
      gridArea: "1 / 2",
      font: "inherit",
      margin: 0,
      resize: "none",
      appearance: "none",
      border: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50px",
      letterSpacing: "inherit",
      padding: "8.5px 14px 8.5px 14px",
      fontStyle: "normal",
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: "18px",

      content: "attr(data-value)",
      visibility: "hidden",
      whiteSpace: "pre-wrap",
    },
  },
  inputBox: {
    width: "360px",
    [theme.breakpoints.down("sm")]: { width: "100%" },
    gridArea: "1 / 2",
    font: "inherit",
    margin: 0,
    resize: "none",
    appearance: "none",
    display: "inline-flex",
  },
}));

export interface OrgCmsContentFieldItemProps
  extends HTMLAttributes<HTMLDivElement> {
  index: number;
  onDeleteItemClick?: IconButtonProps["onClick"];
  onEdit?: () => void;
  item?: OrganizationCmsContentField;
  handleChangeFile?: (acceptedFiles: File[], index: number) => void;
  handleCancelFile?: (index: number) => void;
  useTemporaryDelete?: boolean;
}

const OrgCmsContentFieldItem = forwardRef<
  HTMLDivElement,
  OrgCmsContentFieldItemProps
>((props, ref) => {
  const {
    item,
    index,
    onDeleteItemClick,
    onEdit,
    handleChangeFile,
    handleCancelFile,
    ...other
  } = props;

  const classes = useStyles();
  const popover = usePopover();
  const wordLibrary = useSelector(getWordLibrary);

  const { control, setValue, watch } = useFormContext<CmsContentsFormInput>();
  const list = watch("organizationCmsContentList");

  const { remove } = useFieldArray({
    control,
    name: "organizationCmsContentList",
  });

  const isEditing = item?.isEditing;

  const inputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    if (inputRef.current && isEditing) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <>
      {!item?.isDeleted && (
        <Grid item xs={12} sx={{ display: "block" }}>
          <Box
            ref={ref}
            className={classes.sortContainer}
            onClick={() => {
              setValue(`organizationCmsContentList.${index}.isEditing`, false);
            }}
            {...other}
          >
            <div className={classes.sortItems}>
              <div className={classes.sortItemsInner}>
                <Box
                  sx={{
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {!isEditing && (
                    <Typography noWrap>
                      {item?.organizationCmsContentTitle}
                    </Typography>
                  )}
                  {isEditing && (
                    <Controller
                      control={control}
                      name={`organizationCmsContentList.${index}.organizationCmsContentTitle`}
                      render={() => (
                        <TextField
                          size="small"
                          className={classes.inputBox}
                          fullWidth
                          inputRef={inputRef}
                          value={item?.organizationCmsContentTitle}
                          onChange={(e) => {
                            setValue(
                              `organizationCmsContentList.${index}.organizationCmsContentTitle`,
                              e.target.value
                            );
                            setValue(
                              `organizationCmsContentList.${index}.isUpdated`,
                              true
                            );
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              setValue(
                                `organizationCmsContentList.${index}.isEditing`,
                                false
                              );
                          }}
                        />
                      )}
                    />
                  )}
                </Box>
              </div>
              <Stack
                direction="column"
                // spacing={1}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* <NextImage alt="arrowUp" src={arrowUp} /> */}
                <Iconify
                  icon="solar:double-alt-arrow-up-bold-duotone"
                  color={"red"}
                  width={26}
                />
                <IconButton
                  onClick={(e) => {
                    popover.onOpen(e);
                  }}
                >
                  <Iconify icon="carbon:overflow-menu-vertical" />
                </IconButton>
              </Stack>
            </div>
          </Box>

          <CustomPopover
            open={popover.open}
            onClose={popover.onClose}
            arrow="right-center"
            sx={{ minWidth: 120 }}
          >
            <MenuItem
              onClick={() => {
                popover.onClose();
                setValue(`organizationCmsContentList.${index}.isEditing`, true);
                list?.forEach((el, i) => {
                  if (i !== index) {
                    setValue(
                      `organizationCmsContentList.${i}.isEditing`,
                      false
                    );
                  }
                });
                if (onEdit) onEdit();
              }}
            >
              <Iconify icon="solar:pen-bold" sx={{ mr: 1 }} />
              {wordLibrary?.edit ?? "編輯"}
            </MenuItem>
            <MenuItem
              onClick={() => {
                popover.onClose();
                setValue(`organizationCmsContentList.${index}.isDeleted`, true);
                remove(index);
              }}
              sx={{ color: "error.main" }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 1 }} />
              {wordLibrary?.delete ?? "刪除"}
            </MenuItem>
          </CustomPopover>
        </Grid>
      )}
    </>
  );
  // return <></>;
});

export default memo(OrgCmsContentFieldItem);
