import React, { ReactNode, forwardRef, HTMLAttributes } from "react";

import makeStyles from "@mui/styles/makeStyles";

import Typography from "@eGroupAI/material/Typography";
import IconButton from "components/IconButton/StyledIconButton";
import { IconButtonProps } from "@eGroupAI/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import encodedUrlWithParentheses from "@eGroupAI/utils/encodedUrlWithParentheses";

const useStyles = makeStyles(
  (theme) => ({
    wrapper: {
      position: "relative",
    },
    badge: {
      position: "absolute",
      backgroundColor: theme.palette.info.main,
      left: 0,
      top: "-0.5rem",
      width: "2rem",
      height: "2rem",
      zIndex: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1rem",
      borderRadius: "50%",
      color: theme.palette.common.white,
    },
    remove: {
      position: "absolute",
      right: 0,
      top: 0,
      width: "2rem",
      height: "2rem",
      zIndex: 10,
    },
    item: {
      position: "relative",
      borderRadius: 20,
      overflow: "hidden",
      paddingTop: "112%",
    },
    bg: {
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundPosition: "center",
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
    },
    mask: {
      background:
        "linear-gradient(rgba(214, 214, 214, 0) 0%, rgba(0, 0, 0, 0.7) 100%)",
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
    },
    text: {
      position: "absolute",
      left: 0,
      bottom: 0,
      color: theme.palette.common.white,
      paddingLeft: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      width: "100%",
    },
  }),
  {
    name: "MuiEditableCarouselItem",
  }
);

export interface EditableCarouselItemProps
  extends HTMLAttributes<HTMLDivElement> {
  imgSrc?: string;
  title?: string;
  description?: string;
  badgeContent?: ReactNode;
  onDeleteItemClick?: IconButtonProps["onClick"];
}

const EditableCarouselItem = forwardRef<
  HTMLDivElement,
  EditableCarouselItemProps
>((props, ref) => {
  const {
    badgeContent,
    title,
    description,
    imgSrc,
    onDeleteItemClick,
    ...other
  } = props;
  const classes = useStyles();

  return (
    <div ref={ref} {...other}>
      <div className={classes.wrapper}>
        <div className={classes.badge}>{badgeContent}</div>
        {onDeleteItemClick && (
          <IconButton
            className={classes.remove}
            color="error"
            onClick={onDeleteItemClick}
          >
            <CloseIcon />
          </IconButton>
        )}
        <div className={classes.item}>
          <div
            className={classes.bg}
            style={{
              backgroundImage: `url(${encodedUrlWithParentheses(
                encodeURI(imgSrc || "")
              )})`,
            }}
          />
          <div className={classes.mask} />
          <div className={classes.text}>
            <Typography variant="h5" color="inherit" noWrap>
              {title}
            </Typography>
            <Typography variant="h5" color="inherit" noWrap>
              {description}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
});

export default EditableCarouselItem;
