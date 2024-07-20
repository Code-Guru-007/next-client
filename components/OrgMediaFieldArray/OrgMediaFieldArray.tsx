import React, { FC, useCallback, useEffect, useMemo, useState } from "react";

import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import makeStyles from "@mui/styles/makeStyles";
import { useFormContext, useFieldArray } from "react-hook-form";
import { CmsContentFormInput, OrganizationMediaField } from "interfaces/form";
import { ServiceModuleValue } from "interfaces/utils";
import NextImage from "next/image";

import Grid from "@eGroupAI/material/Grid";
import Button, { ButtonProps } from "@eGroupAI/material/Button";
import encodedUrlWithParentheses from "@eGroupAI/utils/encodedUrlWithParentheses";
import { Avatar, Box, Typography } from "@mui/material";
import NewImageUploadManager from "components/OrgCmsMediaFieldItemComponents/new-image-upload-manager";
import DragItem, { OnDropItem, useDragItem } from "components/DragItem";

import arrowUp from "minimal/assets/icons/solarDoubleArrow.png";

import OrgMediaFieldItem from "./OrgMediaFieldItem";
import addBg from "../CarouselManagement/add.png";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.mode === "dark" ? "#2f3944" : "#F4F6F8",
    padding: "20px",
    borderRadius: "16px",
  },
  item: {
    transition: "all 0.4s",
    opacity: 1,
    width: "100%",
  },
  addBox: {
    position: "relative",
    borderRadius: 20,
    // backgroundColor: "#D6D6D6",
    width: "100%",
    height: "auto",
    padding: 1,
  },
  addBtnContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "70%",
  },
  addBtn: {
    width: "100%",
    borderRadius: "50%",
    paddingTop: "100%",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "contain",
    backgroundImage: `url(${encodedUrlWithParentheses(addBg.src)})`,
    cursor: "pointer",
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
}));
export interface OrgMediaFieldArrayProps {
  filePathType: ServiceModuleValue;
  dialogElementShow?: boolean;
  targetId?: string;
  maxFields?: number;
  enableTitle?: boolean;
  enableDescription?: boolean;
  tagGroup?: ServiceModuleValue;
  enableYoutubeUrl?: boolean;
  enableLinkURL?: boolean;
  onDeleteItemClick?: (
    item: OrganizationMediaField,
    remove: () => void
  ) => void;
  onItemOrderChange?: (items: OrganizationMediaField[]) => void;
  onStartSortClick?: ButtonProps["onClick"];
  onEndSortClick?: ButtonProps["onClick"];
  sortOpenDialog?: boolean;
  setSortItems?: any;
  useOneItemAtOnce?: boolean;
}

const OrgMediaFieldArray: FC<OrgMediaFieldArrayProps> = function (props) {
  const classes = useStyles();
  const {
    filePathType,
    maxFields,
    targetId,
    enableTitle = false,
    enableYoutubeUrl = false,
    enableLinkURL = false,
    onDeleteItemClick,
    onItemOrderChange,
    onStartSortClick,
    onEndSortClick,
    enableDescription = false,
    tagGroup,
    sortOpenDialog,
    dialogElementShow,
    setSortItems,
    useOneItemAtOnce = true,
  } = props;
  const { control, watch, setValue } = useFormContext<CmsContentFormInput>();
  const { remove, append } = useFieldArray({
    control,
    name: "organizationMediaList",
  });

  const mediaList = watch("organizationMediaList");

  const { items, itemsRef, handleMoveItem } = useDragItem(
    "organizationMediaId",
    mediaList
  );
  const [enableSort, setEnableSort] = useState(false);

  useEffect(() => {
    if (sortOpenDialog) setEnableSort(true);
  }, [sortOpenDialog]);

  const shouldShowAdd = useMemo(
    () => (maxFields !== undefined ? items.length < maxFields : true),
    [items.length, maxFields]
  );
  const shouldShowSortBtn = useMemo(
    () => (maxFields !== undefined ? maxFields > 1 : true),
    [maxFields]
  );

  const handleDropItem: OnDropItem = () => {
    if (onItemOrderChange) {
      if (setSortItems) setSortItems(itemsRef.current);
      else onItemOrderChange(itemsRef.current);
    }
  };

  const handleChangeFile = useCallback(
    (acceptedFiles: File[], index: number) => {
      const file = acceptedFiles[0];

      setValue(`organizationMediaList.${index}.tempNewImage`, file, {
        shouldDirty: true,
      });
    },
    [setValue]
  );

  const handleCancelFile = useCallback(
    (index: number) => {
      const mediaImage = watch(`organizationMediaList.${index}.uploadFilePath`);
      const tempNewImage = watch(`organizationMediaList.${index}.tempNewImage`);
      if (tempNewImage)
        setValue(`organizationMediaList.${index}.tempNewImage`, undefined, {
          shouldDirty: true,
        });
      else if (mediaImage) {
        setValue(`organizationMediaList.${index}.mediaImageDeleted`, true, {
          shouldDirty: true,
        });
      }
    },
    [setValue, watch]
  );

  const handleSelectNewFile = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      append({
        organizationMediaTitle: "",
        organizationMediaId: "",
        uploadFileId: "",
        uploadFilePath: "",
        organizationMediaYoutubeURL: "",
        organizationMediaLinkURL: "",
        isUploading: false,
        organizationTagList: [],
        tempNewImage: file,
        mediaImageDeleted: false,
      });
    },
    [append]
  );

  if (enableSort) {
    return (
      <div className={classes.root}>
        <DndProvider backend={HTML5Backend}>
          <Grid container={!sortOpenDialog} spacing={3}>
            {!sortOpenDialog && (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={(e) => {
                    setEnableSort(false);
                    if (onEndSortClick) {
                      onEndSortClick(e);
                    }
                  }}
                  disabled={items.length < 2}
                >
                  結束排序
                </Button>
              </Grid>
            )}
            {items?.map((el, index) => (
              <DragItem
                key={el.organizationMediaId}
                id={el.organizationMediaId as string}
                onMoveItem={handleMoveItem}
                onDropItem={handleDropItem}
                type="IMG"
              >
                {({ ref }) => (
                  <Grid item xs={12} md={12} lg={sortOpenDialog ? 12 : 3}>
                    {sortOpenDialog ? (
                      <Box ref={ref} className={classes.sortContainer}>
                        <div className={classes.sortItems}>
                          <div className={classes.sortItemsInner}>
                            <Avatar
                              sx={{ marginRight: 2, height: 64, width: 64 }}
                              variant="rounded"
                              alt="Remy Sharp"
                              src={el?.uploadFilePath}
                            />
                            <div>
                              <Typography noWrap sx={{ maxWidth: 350 }}>
                                {el.organizationMediaTitle ||
                                  el.organizationMediaLinkURL}
                              </Typography>
                              <div>{el.organizationMediaDescription}</div>
                            </div>
                          </div>
                          <NextImage alt="arrowUp" src={arrowUp} />
                        </div>
                      </Box>
                    ) : (
                      <OrgMediaFieldItem
                        filePathType={filePathType}
                        ref={ref}
                        index={index}
                        organizationMediaId={el.organizationMediaId}
                        targetId={targetId}
                        backgroundImageUrl={el.uploadFilePath}
                        className={classes.item}
                        enableSort
                        enableTitle={enableTitle}
                        enableYoutubeUrl={enableYoutubeUrl}
                        enableLinkURL={enableLinkURL}
                        enableDescription={enableDescription}
                        tagGroup={tagGroup}
                      />
                    )}
                  </Grid>
                )}
              </DragItem>
            ))}
          </Grid>
        </DndProvider>
      </div>
    );
  }

  return (
    <div>
      <Grid container spacing={3}>
        {shouldShowSortBtn && sortOpenDialog && (
          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="primary"
              onClick={(e) => {
                setEnableSort(true);
                if (onStartSortClick) {
                  onStartSortClick(e);
                }
              }}
              disabled={items.length < 2}
            >
              開始排序
            </Button>
          </Grid>
        )}
        {items?.map((el, index) =>
          // Key need be index here because organizationMediaId is not defineded when add a new field.
          dialogElementShow ? (
            <Grid
              item
              xs={12}
              md={useOneItemAtOnce ? 12 : 6}
              lg={useOneItemAtOnce ? 12 : 6}
              key={el.organizationMediaId}
              sx={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <OrgMediaFieldItem
                filePathType={filePathType}
                dialogElementShow={!dialogElementShow}
                index={index}
                organizationMediaId={el.organizationMediaId}
                targetId={targetId}
                backgroundImageUrl={el.uploadFilePath}
                className={classes.item}
                enableTitle={enableTitle}
                enableYoutubeUrl={enableYoutubeUrl}
                enableLinkURL={enableLinkURL}
                enableDescription={enableDescription}
                tagGroup={tagGroup}
                onDeleteItemClick={() => {
                  if (onDeleteItemClick)
                    onDeleteItemClick(el, () => {
                      remove(index);
                    });
                }}
                media={mediaList?.[index]}
                handleChangeFile={handleChangeFile}
                handleCancelFile={handleCancelFile}
              />
            </Grid>
          ) : (
            <Grid
              item
              xs={12}
              md={useOneItemAtOnce ? 12 : 6}
              lg={useOneItemAtOnce ? 12 : 6}
              key={el.organizationMediaId}
              sx={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <OrgMediaFieldItem
                filePathType={filePathType}
                dialogElementShow={!dialogElementShow}
                index={index}
                organizationMediaId={el.organizationMediaId}
                targetId={targetId}
                backgroundImageUrl={el.uploadFilePath}
                className={classes.item}
                enableTitle={enableTitle}
                enableYoutubeUrl={enableYoutubeUrl}
                enableLinkURL={enableLinkURL}
                enableDescription={enableDescription}
                tagGroup={tagGroup}
                onDeleteItemClick={() => {
                  if (onDeleteItemClick)
                    onDeleteItemClick(el, () => {
                      remove(index);
                    });
                }}
                media={mediaList?.[index]}
                handleChangeFile={handleChangeFile}
                handleCancelFile={handleCancelFile}
              />
            </Grid>
          )
        )}
        {shouldShowAdd && (
          <Grid
            item
            xs={12}
            md={useOneItemAtOnce ? 12 : 6}
            lg={useOneItemAtOnce ? 12 : 6}
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <NewImageUploadManager handleSelectFile={handleSelectNewFile} />
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default OrgMediaFieldArray;
