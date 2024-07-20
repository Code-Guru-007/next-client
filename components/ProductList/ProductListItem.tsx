import React, { FC, HTMLAttributes } from "react";

import { makeStyles } from "@mui/styles";
import NextLink from "next/link";
import Image from "next/legacy/image";
import Typography from "@eGroupAI/material/Typography";
import IconButton from "components/IconButton/StyledIconButton";
import { IconButtonProps } from "@eGroupAI/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

export interface ProductListItemProps extends HTMLAttributes<HTMLDivElement> {
  href: string;
  src?: string;
  title?: string;
  description?: string;
  onDeleteClick?: IconButtonProps["onClick"];
}

const useStyles = makeStyles((theme) => ({
  card: {
    borderRadius: 10,
    border: "1px solid #dee2e6",
    textAlign: "center",
    cursor: "pointer",
  },
  cardImage: {
    position: "relative",
    minHeight: 250,
    background: theme.palette.grey[200],
  },
  deleteBtn: {
    position: "absolute",
    right: 8,
    top: 8,
    zIndex: 1,
  },
  cardBody: {
    padding: "1rem",
  },
}));

const ProductListItem: FC<ProductListItemProps> = function (props) {
  const classes = useStyles();
  const { href, src, title, description, onDeleteClick } = props;
  return (
    <NextLink prefetch href={href} passHref legacyBehavior>
      <div className={classes.card}>
        <div className={classes.cardImage}>
          {onDeleteClick && (
            <IconButton
              className={classes.deleteBtn}
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick(e);
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
          {src && (
            <Image
              src={src}
              width={1}
              height={1}
              layout="responsive"
              objectFit="cover"
              unoptimized
            />
          )}
        </div>
        <div className={classes.cardBody}>
          <Typography variant="h6" sx={{ wordBreak: "break-all" }}>
            {title}
          </Typography>
          <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
            {description}
          </Typography>
        </div>
      </div>
    </NextLink>
  );
};

export default ProductListItem;
