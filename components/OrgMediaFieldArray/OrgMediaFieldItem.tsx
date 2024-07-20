import React, {
  forwardRef,
  HTMLAttributes,
  useEffect,
  useState,
  memo,
} from "react";

import { useFormContext, Controller } from "react-hook-form";

import { useTheme, makeStyles } from "@mui/styles";
import { bgBlur } from "minimal/theme/css";

import { ServiceModuleValue } from "interfaces/utils";
import { CmsContentFormInput, OrganizationMediaField } from "interfaces/form";
import { OrganizationTag } from "interfaces/entities";

import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";
import { IconButtonProps } from "@eGroupAI/material/IconButton";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Upload as UploadHover } from "components/OrgCmsMediaFieldItemComponents/upload";
import TagAutocomplete from "components/TagAutocomplete";
import clsx from "clsx";
import encodedUrlWithParentheses from "../../@eGroupAI/utils/encodedUrlWithParentheses";

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
  dialogElementShow?: boolean;
  /**
   * Give tagGroup and enable select tags
   */
  tagGroup?: ServiceModuleValue;
  onDeleteItemClick?: IconButtonProps["onClick"];
  media?: OrganizationMediaField;
  handleChangeFile?: (acceptedFiles: File[], index: number) => void;
  handleCancelFile?: (index: number) => void;
  useTemporaryDelete?: boolean;
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
      media,
      handleChangeFile,
      handleCancelFile,
      enableDescription,
      tagGroup,
      dialogElementShow,
      useTemporaryDelete = true,
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

    // const [tempImageFile, setTempImageFile] = useState<File>();

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
    const containerWidth = 400; // The fixed width of your container
    const containerHeight = 400; // The fixed height of your container
    checkImageSize(imagePath, containerWidth, containerHeight);

    return (
      <div ref={ref} {...other}>
        <div className={classes.wrapper}>
          <div
            className={classes.main}
            style={{
              backgroundImage: `url(${encodedUrlWithParentheses(
                encodeURI(imagePath || "")
              )})`,
              backgroundSize: isLargerSize ? "contain" : "unset",
              width: "100%",
              maxWidth: containerWidth,
              maxHeight: containerHeight,
              aspectRatio: "1 / 1",
            }}
          >
            <div
              className={clsx(classes.mask, isHover && classes.maskShow)}
              style={{
                ...bgBlur({
                  color: theme.palette.background.default,
                  opacity: 0.5,
                }),
              }}
            />
            <div className={classes.mask} />
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
                /**
                 * this components/OrgMediaFieldArray/OrgMediaFieldItem component is working with image only medias of CMS.
                 * so Blog thumbnail not need be a required field in article-edit page.
                 */

                // required={
                //   !media?.tempNewImage &&
                //   (media?.mediaImageDeleted || !media?.uploadFilePath)
                // }
              />
            )}
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
        {hasMedia && enableTitle && (
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
        {hasMedia && enableYoutubeUrl && (
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
                    disabled={enableSort}
                  />
                </Box>
              )}
            />
          </Box>
        )}
        {hasMedia && enableLinkURL && (
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
        {hasMedia && enableDescription && (
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
        {hasMedia && organizationMediaId && tagGroup && (
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
                serviceModuleValue={tagGroup}
                value={
                  watch(
                    `organizationMediaList.${index}.organizationTagList`
                  ) as OrganizationTag[]
                }
                onChange={(e, value) => {
                  setValue(
                    `organizationMediaList.${index}.organizationTagList`,
                    value,
                    { shouldDirty: true }
                  );
                }}
                fullWidth
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
