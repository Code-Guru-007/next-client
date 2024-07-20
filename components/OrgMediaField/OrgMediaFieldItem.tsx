import React, {
  forwardRef,
  HTMLAttributes,
  useEffect,
  useState,
  memo,
} from "react";

import { useFormContext, Controller } from "react-hook-form";
import makeStyles from "@mui/styles/makeStyles";
import {
  OrganizationMediaSizeType,
  ServiceModuleValue,
} from "interfaces/utils";
import { CmsContentFormInput, OrganizationMediaField } from "interfaces/form";
import { OrganizationTag } from "interfaces/entities";

import { useTheme } from "@mui/styles";
import { Box, IconButton, Stack, Tooltip } from "@mui/material";
import TextField from "@mui/material/TextField";
import { IconButtonProps } from "@eGroupAI/material/IconButton";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import TagAutocomplete from "components/TagAutocomplete";
import { Upload as UploadHover } from "components/OrgCmsMediaFieldItemComponents/upload";
import { bgBlur } from "minimal/theme/css";
import clsx from "clsx";
import encodedUrlWithParentheses from "@eGroupAI/utils/encodedUrlWithParentheses";
import Iconify from "minimal/components/iconify";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    marginBottom: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  remove: {
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 10,
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
}));

export interface OrgMediaFieldItemProps extends HTMLAttributes<HTMLDivElement> {
  filePathType: ServiceModuleValue;
  index: number;
  organizationMediaId?: string;
  targetId?: string;
  backgroundImageUrl?: string;
  enableTitle?: boolean;
  enableYoutubeUrl?: boolean;
  enableLinkURL?: boolean;
  enableSort?: boolean;
  enableDescription?: boolean;
  /**
   * Give tagGroup and enable select tags
   */
  tagGroup?: ServiceModuleValue;
  onDeleteItemClick?: IconButtonProps["onClick"];
  media?: OrganizationMediaField;
  handleChangeFile?: (acceptedFiles: File[], index: number) => void;
  handleCancelFile?: (index: number) => void;
  useTemporaryDelete?: boolean;
  imageOnly?: boolean;
  isSliderImage?: boolean;
  enableMediaSizeSetting?: boolean;
}

const OrgMediaFieldItem = forwardRef<HTMLDivElement, OrgMediaFieldItemProps>(
  (props, ref) => {
    const {
      filePathType,
      index,
      organizationMediaId,
      targetId,
      backgroundImageUrl,
      enableTitle,
      enableYoutubeUrl,
      enableLinkURL,
      enableSort,
      onDeleteItemClick,
      enableDescription,
      tagGroup,
      media,
      handleChangeFile,
      handleCancelFile,
      useTemporaryDelete = true,
      imageOnly = false,
      isSliderImage = false,
      enableMediaSizeSetting = false,
      ...other
    } = props;

    const classes = useStyles();
    const theme = useTheme();

    const [isHover, setIsHover] = useState(false);
    const [isLargerSize, setIsLargerSize] = useState<boolean>(false);

    const { control, register, setValue, watch } =
      useFormContext<CmsContentFormInput>();
    const [imagePath, setImagePath] = useState<string | undefined>(
      backgroundImageUrl
    );

    useEffect(() => {
      if (media?.tempNewImage) {
        setImagePath(`${URL.createObjectURL(media.tempNewImage)}`);
      } else if (!media?.mediaImageDeleted) {
        setImagePath(backgroundImageUrl);
      } else {
        setImagePath(undefined);
      }
    }, [backgroundImageUrl, media?.mediaImageDeleted, media?.tempNewImage]);

    const hasMedia = !!media;
    const isEdit = media?.organizationMediaId;
    const isPCSize = media?.organizationMediaSizeType
      ? media?.organizationMediaSizeType === OrganizationMediaSizeType.PC ||
        media?.organizationMediaSizeType === OrganizationMediaSizeType.NORMAL
      : true;

    function checkImageSize(imageUrl, containerWidth, containerHeight) {
      const img = new Image();
      img.onload = () => {
        const imageWidth = img.naturalWidth;
        const imageHeight = img.naturalHeight;

        if (imageWidth > containerWidth || imageHeight > containerHeight) {
          setIsLargerSize(true);
        } else {
          setIsLargerSize(false);
        }
      };
      img.onerror = () => {
        // eslint-disable-next-line no-console
        console.error("There was an error loading the image.");
      };
      img.src = imageUrl || "";
    }

    // Usage
    const containerWidth = isSliderImage ? 800 : 400; // The fixed width of your container
    const containerHeight = 400; // The fixed height of your container
    checkImageSize(imagePath, containerWidth, containerHeight);

    return (
      <div ref={ref} {...other}>
        <div className={classes.wrapper}>
          {isEdit && !isSliderImage && enableMediaSizeSetting && (
            <Stack
              direction={"row"}
              spacing={0.5}
              alignItems={"center"}
              sx={{
                width: "100%",
                maxWidth: isSliderImage ? "unset" : containerWidth,
                mb: 1,
              }}
            >
              <Tooltip title={"Set for PC"}>
                <IconButton
                  onClick={() => {
                    setValue(
                      `organizationMediaList.${index}.organizationMediaSizeType`,
                      OrganizationMediaSizeType.PC,
                      { shouldDirty: true }
                    );
                  }}
                  disabled={true || !imagePath}
                  sx={{
                    color: isPCSize
                      ? `${theme.palette.common.white}`
                      : "default",
                    backgroundColor: isPCSize
                      ? `${theme.palette.primary.main} !important`
                      : "none",
                  }}
                >
                  <Iconify icon="ion:desktop-outline" />
                </IconButton>
              </Tooltip>
              <Tooltip title={"Set for Mobile"}>
                <IconButton
                  onClick={() => {
                    setValue(
                      `organizationMediaList.${index}.organizationMediaSizeType`,
                      OrganizationMediaSizeType.MOBILE,
                      { shouldDirty: true }
                    );
                  }}
                  disabled={true || !imagePath}
                  sx={{
                    color: !isPCSize
                      ? `${theme.palette.common.white}`
                      : "default",
                    backgroundColor: !isPCSize
                      ? `${theme.palette.primary.main} !important`
                      : "none",
                  }}
                >
                  <Iconify icon="fa:mobile" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
          <div
            className={classes.main}
            style={{
              backgroundImage: `url(${encodedUrlWithParentheses(
                encodeURI(imagePath || "")
              )})`,
              backgroundSize: isLargerSize ? "contain" : "unset",
              height: containerHeight,
              width: "100%",
              maxWidth: isSliderImage ? "unset" : containerWidth,
              maxHeight: containerHeight,
              aspectRatio: isSliderImage ? "unset" : "1 / 1",
            }}
          >
            {/* <Box sx={{ position: "relative" }}> */}
            <div
              className={clsx(classes.mask, isHover && classes.maskShow)}
              style={{
                ...bgBlur({
                  color: theme.palette.background.default,
                  opacity: 0.5,
                }),
              }}
            />
            {enableSort ? (
              <div className={classes.sortIcon}>
                <DragIndicatorIcon color="inherit" />
              </div>
            ) : (
              <UploadHover
                onDropAccepted={(acceptedFiles: File[]) => {
                  if (handleChangeFile) handleChangeFile(acceptedFiles, index);
                }}
                accept="image/*"
                onDelete={(e) => {
                  if (useTemporaryDelete && handleCancelFile) {
                    handleCancelFile(index);
                  } else if (media?.tempNewImage && handleCancelFile) {
                    handleCancelFile(index);
                  } else if (onDeleteItemClick) onDeleteItemClick(e);
                }}
                isHover={isHover}
                setIsHover={setIsHover}
                isWaitingUpload={
                  !media?.tempNewImage &&
                  (media?.mediaImageDeleted || !media?.uploadFilePath)
                }
                error={
                  !media?.tempNewImage &&
                  (media?.mediaImageDeleted || !media?.uploadFilePath)
                }
                required={
                  !isSliderImage &&
                  !imageOnly &&
                  !media?.tempNewImage &&
                  (media?.mediaImageDeleted || !media?.uploadFilePath)
                }
                // deleteIconBtnType={media?.tempNewImage ? "cancel" : "delete"}
                isSlider={isSliderImage}
              />
            )}
            {/* </Box> */}
          </div>
        </div>
        {hasMedia && (
          <>
            <input
              type="hidden"
              {...register(`organizationMediaList.${index}.isUploading`)}
            />
            <input
              type="hidden"
              {...register(
                `organizationMediaList.${index}.organizationMediaId`
              )}
            />
            <input
              type="hidden"
              {...register(`organizationMediaList.${index}.uploadFileId`)}
            />
            <input
              type="hidden"
              {...register(`organizationMediaList.${index}.uploadFilePath`)}
            />
          </>
        )}
        {hasMedia && enableTitle && !imageOnly && !isSliderImage && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Controller
              control={control}
              name={`organizationMediaList.${index}.organizationMediaTitle`}
              render={({ field: { value, onChange } }) => (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    maxWidth: containerWidth,
                  }}
                >
                  <TextField
                    onChange={onChange}
                    value={value}
                    variant="outlined"
                    label="輸入標題"
                    fullWidth
                    sx={{
                      marginTop: 1,
                      marginBottom: 1,
                    }}
                    disabled={enableSort}
                    multiline
                    rows={2}
                  />
                </Box>
              )}
            />
          </Box>
        )}
        {hasMedia && enableDescription && !imageOnly && !isSliderImage && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Controller
              control={control}
              name={`organizationMediaList.${index}.organizationMediaDescription`}
              render={({ field: { value, onChange } }) => (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    maxWidth: containerWidth,
                  }}
                >
                  <TextField
                    onChange={onChange}
                    value={value}
                    variant="outlined"
                    label="輸入描述"
                    fullWidth
                    sx={{
                      marginTop: 1,
                      marginBottom: 1,
                    }}
                    disabled={enableSort}
                    multiline
                    rows={3}
                  />
                </Box>
              )}
            />
          </Box>
        )}
        {hasMedia && enableYoutubeUrl && !imageOnly && !isSliderImage && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Controller
              control={control}
              name={`organizationMediaList.${index}.organizationMediaYoutubeURL`}
              render={({ field: { value, onChange } }) => (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    maxWidth: containerWidth,
                  }}
                >
                  <TextField
                    onChange={onChange}
                    value={value}
                    variant="outlined"
                    label="輸入 Youtube Url"
                    fullWidth
                    sx={{
                      marginTop: 1,
                      marginBottom: 1,
                    }}
                    disabled={enableSort}
                  />
                </Box>
              )}
            />
          </Box>
        )}
        {hasMedia && enableLinkURL && !imageOnly && !isSliderImage && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Controller
              control={control}
              name={`organizationMediaList.${index}.organizationMediaLinkURL`}
              render={({ field: { value, onChange } }) => (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    maxWidth: containerWidth,
                  }}
                >
                  <TextField
                    onChange={onChange}
                    value={value}
                    variant="outlined"
                    label="輸入 Url"
                    fullWidth
                    sx={{
                      marginTop: 1,
                      marginBottom: 1,
                    }}
                    disabled={enableSort}
                  />
                </Box>
              )}
            />
          </Box>
        )}
        {hasMedia && !imageOnly && !isSliderImage && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                maxWidth: containerWidth,
              }}
            >
              <TagAutocomplete
                serviceModuleValue={tagGroup || ServiceModuleValue.CMS}
                value={
                  watch(
                    `organizationMediaList.${index}.organizationTagList`
                  ) as OrganizationTag[]
                }
                fullWidth
                onChange={(e, value) => {
                  setValue(
                    `organizationMediaList.${index}.organizationTagList`,
                    value,
                    { shouldDirty: true }
                  );
                }}
                disabled={enableSort}
              />
            </Box>
          </Box>
        )}
      </div>
    );
  }
);

export default memo(OrgMediaFieldItem);
