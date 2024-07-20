import React, { FC, useState, useCallback, useMemo } from "react";

import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

import makeStyles from "@mui/styles/makeStyles";
import { useFormContext, useFieldArray } from "react-hook-form";
import { CmsContentFormInput, OrganizationMediaField } from "interfaces/form";
// <<<<<<< issue/4450
import {
  // OrganizationMediaSizeType,
  // OrganizationMediaSizeType,
  // OrganizationMediaSizeType,
  // OrganizationMediaType,
  ServiceModuleValue,
} from "interfaces/utils";
// import apis from "utils/apis";
// import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
// =======
// import { ServiceModuleValue } from "interfaces/utils";
// >>>>>>> main

import Grid from "@eGroupAI/material/Grid";
import Button, { ButtonProps } from "@eGroupAI/material/Button";
import encodedUrlWithParentheses from "@eGroupAI/utils/encodedUrlWithParentheses";
import DragItem, { OnDropItem, useDragItem } from "components/DragItem";
import NewImageUploadManager from "components/OrgCmsMediaFieldItemComponents/new-image-upload-manager/new-image-upload-manager";
import OrgMediaFieldItem from "./OrgMediaFieldItem";
import addBg from "../CarouselManagement/add.png";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(1),
  },
  item: {
    transition: "all 0.4s",
    opacity: 1,
    width: "100%",
  },
  addBox: {
    position: "relative",
    borderRadius: 8,
    // backgroundColor: "#D6D6D6",
    width: "100%",
    height: "auto",
    minHeight: "250px",
  },
  addBtn: {
    width: "100%",
    height: "100%",
    backgroundRepeat: "no-repeat",
    backgroundSize: "unset",
    backgroundPosition: "center",
    backgroundImage: `url(${encodedUrlWithParentheses(addBg.src)})`,
    cursor: "pointer",
  },
}));
export interface OrgMediaFieldProps {
  filePathType: ServiceModuleValue;
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
  imageOnly?: boolean;
  useOneItemAtOnce?: boolean;
  useSliderImage?: boolean;
  useItemImage?: boolean;
  selectedDesktop?: boolean;
  enableMediaSizeSetting?: boolean;
}

const OrgMediaField: FC<OrgMediaFieldProps> = function (props) {
  const classes = useStyles();
  const {
    filePathType,
    maxFields,
    targetId,
    enableTitle = true,
    enableYoutubeUrl = true,
    enableLinkURL = true,
    enableDescription = true,
    onDeleteItemClick,
    onItemOrderChange,
    onEndSortClick,
    tagGroup,
    imageOnly = false,
    useOneItemAtOnce = true,
    // useSliderImage = false,
    useItemImage = true,
    // selectedDesktop = false,
    enableMediaSizeSetting = false,
  } = props;

  const { control, watch, setValue } = useFormContext<CmsContentFormInput>();
  const { append, remove } = useFieldArray({
    control,
    name: "organizationMediaList",
  });

  const mediaList = watch("organizationMediaList");
  const { items, itemsRef, handleMoveItem } = useDragItem(
    "organizationMediaId",
    mediaList
  );
  const [enableSort, setEnableSort] = useState(false);

  const shouldShowAddItem = useMemo(
    () => (maxFields !== undefined ? items.length < maxFields : true),
    [items.length, maxFields]
  );

  // const mediaSliderMediaList = watch("organizationMediaSliderMediaList");
  // const { append: appendSlider, remove: removeSlider } = useFieldArray({
  //   control,
  //   name: `organizationMediaSliderMediaList`,
  // });
  // const {
  //   items: sliderItems,
  //   itemsRef: sliderItemsRef,
  //   // handleMoveItem: handleMoveSliderItems,
  // } = useDragItem("", mediaSliderMediaList);

  // const slidersSelectedSize = useMemo(
  //   () =>
  //     selectedDesktop
  //       ? mediaSliderMediaList?.filter(
  //           (el) =>
  //             el.organizationMediaSizeType === OrganizationMediaSizeType.PC
  //         )
  //       : mediaSliderMediaList?.filter(
  //           (el) =>
  //             el.organizationMediaSizeType === OrganizationMediaSizeType.MOBILE
  //         ),
  //   [selectedDesktop, mediaSliderMediaList]
  // );

  // const shouldShowAddSlider = useMemo(
  //   () =>
  //     maxFields !== undefined
  //       ? (slidersSelectedSize?.length || 0) < maxFields
  //       : true,
  //   [maxFields, slidersSelectedSize?.length]
  // );

  const handleDropItem: OnDropItem = () => {
    if (onItemOrderChange) {
      onItemOrderChange(itemsRef.current);
    }
  };

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

  const handleChangeFile = useCallback(
    (acceptedFiles: File[], index: number) => {
      const file = acceptedFiles[0];
      setValue(`organizationMediaList.${index}.tempNewImage`, file, {
        shouldDirty: true,
      });
    },
    [setValue]
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

  // const handleCancelSliderFile = useCallback(
  //   (index: number) => {
  //     if (selectedDesktop) {
  //       const mediaSizeType = watch(
  //         `organizationMediaSliderMediaList.${index}.organizationMediaSizeType`
  //       );
  //       if (!(mediaSizeType === OrganizationMediaSizeType.PC)) {
  //         return;
  //       }
  //       const mediaImage = watch(
  //         `organizationMediaSliderMediaList.${index}.uploadFilePath`
  //       );
  //       const tempNewImage = watch(
  //         `organizationMediaSliderMediaList.${index}.tempNewImage`
  //       );
  //       if (tempNewImage)
  //         setValue(
  //           `organizationMediaSliderMediaList.${index}.tempNewImage`,
  //           undefined,
  //           {
  //             shouldDirty: true,
  //           }
  //         );
  //       else if (mediaImage) {
  //         setValue(
  //           `organizationMediaSliderMediaList.${index}.mediaImageDeleted`,
  //           true,
  //           {
  //             shouldDirty: true,
  //           }
  //         );
  //       }
  //     } else {
  //       const mediaSizeType = watch(
  //         `organizationMediaSliderMediaList.${index}.organizationMediaSizeType`
  //       );
  //       if (!(mediaSizeType === OrganizationMediaSizeType.MOBILE)) {
  //         return;
  //       }
  //       const mediaImage = watch(
  //         `organizationMediaSliderMediaList.${index}.uploadFilePath`
  //       );
  //       const tempNewImage = watch(
  //         `organizationMediaSliderMediaList.${index}.tempNewImage`
  //       );
  //       if (tempNewImage)
  //         setValue(
  //           `organizationMediaSliderMediaList.${index}.tempNewImage`,
  //           undefined,
  //           {
  //             shouldDirty: true,
  //           }
  //         );
  //       else if (mediaImage) {
  //         setValue(
  //           `organizationMediaSliderMediaList.${index}.mediaImageDeleted`,
  //           true,
  //           {
  //             shouldDirty: true,
  //           }
  //         );
  //       }
  //     }
  //   },
  //   [selectedDesktop, setValue, watch]
  // );

  // const handleChangeSliderFile = useCallback(
  //   (acceptedFiles: File[], index: number) => {
  //     const file = acceptedFiles[0];
  //     if (selectedDesktop) {
  //       setValue(
  //         `organizationMediaSliderMediaList.${index}.tempNewImage`,
  //         file,
  //         {
  //           shouldDirty: true,
  //         }
  //       );
  //       setValue(
  //         `organizationMediaSliderMediaList.${index}.organizationMediaSizeType`,
  //         OrganizationMediaSizeType.PC,
  //         {
  //           shouldDirty: true,
  //         }
  //       );
  //     } else {
  //       setValue(
  //         `organizationMediaSliderMediaList.${index}.tempNewImage`,
  //         file,
  //         {
  //           shouldDirty: true,
  //         }
  //       );
  //       setValue(
  //         `organizationMediaSliderMediaList.${index}.organizationMediaSizeType`,
  //         OrganizationMediaSizeType.MOBILE,
  //         {
  //           shouldDirty: true,
  //         }
  //       );
  //     }
  //   },
  //   [selectedDesktop, setValue]
  // );

  // const handleSelectSliderNewFile = useCallback(
  //   (acceptedFiles: File[]) => {
  //     console.log("...appendSlider");

  //     const file = acceptedFiles[0];
  //     if (selectedDesktop) {
  //       appendSlider({
  //         organizationMediaTitle: "",
  //         organizationMediaId: "",
  //         uploadFileId: "",
  //         uploadFilePath: "",
  //         organizationMediaYoutubeURL: "",
  //         organizationMediaLinkURL: "",
  //         isUploading: false,
  //         organizationTagList: [],
  //         tempNewImage: file,
  //         mediaImageDeleted: false,
  //         organizationMediaSizeType: OrganizationMediaSizeType.PC,
  //       });
  //     } else {
  //       appendSlider({
  //         organizationMediaTitle: "",
  //         organizationMediaId: "",
  //         uploadFileId: "",
  //         uploadFilePath: "",
  //         organizationMediaYoutubeURL: "",
  //         organizationMediaLinkURL: "",
  //         isUploading: false,
  //         organizationTagList: [],
  //         tempNewImage: file,
  //         mediaImageDeleted: false,
  //         organizationMediaSizeType: OrganizationMediaSizeType.MOBILE,
  //       });
  //     }
  //   },
  //   [appendSlider, selectedDesktop]
  // );

  // const renderSliderImage = () =>
  //   mediaSliderMediaList?.map((el, index) => {
  //     if (
  //       selectedDesktop &&
  //       el.organizationMediaSizeType === OrganizationMediaSizeType.PC
  //     ) {
  //       return (
  //         <Grid
  //           item
  //           xs={12}
  //           md={12}
  //           lg={12}
  //           key={el.organizationMediaId}
  //           sx={{
  //             display: "flex",
  //             justifyContent: "center",
  //           }}
  //         >
  //           <OrgMediaFieldItem
  //             filePathType={filePathType}
  //             index={index}
  //             organizationMediaId={el.organizationMediaId}
  //             targetId={targetId}
  //             backgroundImageUrl={el.uploadFilePath}
  //             className={classes.item}
  //             enableTitle={enableTitle}
  //             enableYoutubeUrl={enableYoutubeUrl}
  //             enableLinkURL={enableLinkURL}
  //             enableDescription={enableDescription}
  //             tagGroup={tagGroup}
  //             onDeleteItemClick={
  //               onDeleteItemClick
  //                 ? () => {
  //                     onDeleteItemClick(el, () => {
  //                       removeSlider(index);
  //                     });
  //                   }
  //                 : undefined
  //             }
  //             media={el}
  //             handleChangeFile={handleChangeSliderFile}
  //             handleCancelFile={handleCancelSliderFile}
  //             isSliderImage={useSliderImage}
  //           />
  //         </Grid>
  //       );
  //     }
  //     if (
  //       !selectedDesktop &&
  //       el.organizationMediaSizeType === OrganizationMediaSizeType.MOBILE
  //     ) {
  //       return (
  //         <Grid
  //           item
  //           xs={12}
  //           md={12}
  //           lg={12}
  //           key={el.organizationMediaId}
  //           sx={{
  //             display: "flex",
  //             justifyContent: "center",
  //           }}
  //         >
  //           <OrgMediaFieldItem
  //             filePathType={filePathType}
  //             index={index}
  //             organizationMediaId={el.organizationMediaId}
  //             targetId={targetId}
  //             backgroundImageUrl={el.uploadFilePath}
  //             className={classes.item}
  //             enableTitle={enableTitle}
  //             enableYoutubeUrl={enableYoutubeUrl}
  //             enableLinkURL={enableLinkURL}
  //             enableDescription={enableDescription}
  //             tagGroup={tagGroup}
  //             onDeleteItemClick={
  //               onDeleteItemClick
  //                 ? () => {
  //                     onDeleteItemClick(el, () => {
  //                       removeSlider(index);
  //                     });
  //                   }
  //                 : undefined
  //             }
  //             media={el}
  //             handleChangeFile={handleChangeSliderFile}
  //             handleCancelFile={handleCancelSliderFile}
  //             isSliderImage={useSliderImage}
  //           />
  //         </Grid>
  //       );
  //     }
  //     return undefined;
  //   });

  if (enableSort) {
    return (
      <div className={classes.root}>
        <DndProvider backend={HTML5Backend}>
          <Grid container spacing={3}>
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
            {items?.map((el, index) => (
              <DragItem
                key={el.organizationMediaId}
                id={el.organizationMediaId as string}
                onMoveItem={handleMoveItem}
                onDropItem={handleDropItem}
                type="IMG"
              >
                {({ ref }) => (
                  <Grid
                    item
                    xs={12}
                    md={useOneItemAtOnce ? 12 : 6}
                    lg={useOneItemAtOnce ? 12 : 6}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
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
    <div className={classes.root}>
      <Grid container spacing={3}>
        {/* {useSliderImage && renderSliderImage()}
        {useSliderImage && shouldShowAddSlider && (
          <Grid
            item
            xs={12}
            md={12}
            lg={12}
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              flexDirection: "column",
            }}
          >
            <NewImageUploadManager
              handleSelectFile={handleSelectSliderNewFile}
              isSlider
            />
          </Grid>
        )} */}
        {useItemImage &&
          items?.map((el, index) => (
            <Grid
              item
              xs={12}
              md={useOneItemAtOnce ? 12 : 6}
              lg={useOneItemAtOnce ? 12 : 6}
              key={el.organizationMediaId}
              sx={{
                display: "flex",
                justifyContent: "flex-start",
                flexDirection: "column",
              }}
            >
              <OrgMediaFieldItem
                filePathType={filePathType}
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
                onDeleteItemClick={
                  onDeleteItemClick
                    ? () => {
                        onDeleteItemClick(el, () => {
                          remove(index);
                        });
                      }
                    : undefined
                }
                media={mediaList?.[index]}
                handleChangeFile={handleChangeFile}
                handleCancelFile={handleCancelFile}
                imageOnly={imageOnly}
                enableMediaSizeSetting={enableMediaSizeSetting}
              />
            </Grid>
          ))}
        {useItemImage && shouldShowAddItem && (
          <Grid
            item
            xs={12}
            md={useOneItemAtOnce ? 12 : 6}
            lg={useOneItemAtOnce ? 12 : 6}
            sx={{
              display: "flex",
              justifyContent: "flex-start",
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

export default OrgMediaField;
