import React, { useState } from "react";
import clsx from "clsx";
import { makeStyles, useTheme } from "@mui/styles";
import { Upload as UploadHover } from "components/OrgCmsMediaFieldItemComponents/upload";
import { bgBlur } from "minimal/theme/css";
import encodedUrlWithParentheses from "@eGroupAI/utils/encodedUrlWithParentheses";

const useStyles = makeStyles(() => ({
  addBox: {
    position: "relative",
    borderRadius: 20,
    width: "100%",
    // <<<<<<< issue/4450
    // height: "auto",
    // =======
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // >>>>>>> main
    padding: 1,
  },
  main: {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    // width: "fit-content",
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
}));

export interface NewImageUploadManagerProps {
  file?: File;
  index?: number;
  cancelFile?: (index: number) => void;
  handleSelectFile: (acceptedFiles: File[]) => void;
  isSlider?: boolean;
}

export default function NewImageUploadManager(
  props: NewImageUploadManagerProps
) {
  const { file, index, cancelFile, handleSelectFile, isSlider = false } = props;
  const classes = useStyles();
  const theme = useTheme();
  const [isHover, setIsHover] = useState(false);
  const [isLargerSize, setIsLargerSize] = useState<boolean>(false);

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
      console.warn("There was an error loading the image.");
    };
    img.src = imageUrl || "";
  }

  // Usage
  const containerWidth = isSlider ? 800 : 400; // The fixed width of your container
  const containerHeight = 400; // The fixed height of your container

  checkImageSize(
    file ? URL.createObjectURL(file as File) : "",
    containerWidth,
    containerHeight
  );

  return (
    <div
      className={classes.addBox}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div
        className={classes.main}
        style={{
          backgroundImage: file
            ? `url(${encodedUrlWithParentheses(
                URL.createObjectURL(file as File)
              )})`
            : "",
          backgroundSize: isLargerSize ? "contain" : "unset",
          width: "100%",
          height: "100%",
          maxWidth: isSlider ? "unset" : containerWidth,
          maxHeight: containerHeight,
          aspectRatio: isSlider ? "unset" : "1 / 1",
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
        <UploadHover
          onDropAccepted={handleSelectFile}
          accept="image/*"
          onDelete={() => {
            if (typeof index !== "undefined" && cancelFile) cancelFile(index);
          }}
          isHover={isHover}
          isWaitingUpload={!file}
          isSlider={isSlider}
          // deleteIconBtnType="cancel"
        />
      </div>
    </div>
  );
}
