import React, { FC } from "react";

import Image from "next/legacy/image";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import parseOrgMediaListToImgSrc from "utils/parseOrgMediaListToImgSrc";

import { makeStyles } from "@mui/styles";
import { Box, CircularProgress, Typography } from "@mui/material";

import EditSectionHeader from "components/EditSectionHeader";
import IconButton from "components/IconButton/StyledIconButton";
import Iconify from "minimal/components/iconify";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import { OrganizationSolution } from "interfaces/entities";
import { Locale, PageType } from "interfaces/utils";
import { KeyedMutator } from "swr";
import { AxiosResponse } from "axios";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import apis from "utils/apis";
import clsx from "clsx";
import parseUpdateMediaPromises from "utils/parseUpdateMediaPromises";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";
import parseCreateMediaListApiPayload from "utils/parseCreateMediaListApiPayload";

import SolutionInfoEditDialog from "./SolutionInfoEditDialog";
import SolutionInfoEditForm, {
  FORM as SOLUTION_INFO_EDIT_FORM,
} from "./SolutionInfoEditForm";

export interface SolutionInfoEditorProps {
  solutionId: string;
  solutionInfo?: OrganizationSolution;
  selectedLocale: Locale;
  onEditClose?: () => void;
  loading?: boolean;
  infoMutate?: KeyedMutator<AxiosResponse<OrganizationSolution, any>>;
}

const useStyles = makeStyles(() => ({
  loader: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  showLoader: {
    display: "flex",
  },
}));

const SolutionInfoEditor: FC<SolutionInfoEditorProps> = function (props) {
  const {
    solutionId,
    solutionInfo,
    selectedLocale,
    onEditClose,
    loading,
    infoMutate,
  } = props;
  const classes = useStyles();

  const organizationId = useSelector(getSelectedOrgId);
  const { isOpen, handleClose, handleOpen } = useIsOpen(false);
  const editDialogTitle = solutionInfo?.organizationSolutionName;

  const sliderImage = parseOrgMediaListToImgSrc(
    solutionInfo?.organizationMediaSliderList?.[0]?.organizationMediaList
  );
  const contentImages = solutionInfo?.organizationMediaList?.map((el) =>
    parseOrgMediaListToImgSrc([el])
  );

  const { excute: createOrgSolution, isLoading: isCreatingSolution } =
    useAxiosApiWrapper(apis.org.createOrgSolution, "Create");
  const { excute: updateOrgSolution, isLoading: isUpdatingSolution } =
    useAxiosApiWrapper(apis.org.updateOrgSolution, "Update");

  return (
    <Box position={"relative"} p={"20px"}>
      <Box className={clsx(classes.loader, loading && classes.showLoader)}>
        <CircularProgress />
      </Box>
      <SolutionInfoEditDialog
        title={`${editDialogTitle}管理`}
        pageType={PageType.SOLUTIONDETAIL}
        targetId={solutionId}
        open={isOpen}
        updating={isUpdatingSolution || isCreatingSolution}
        onClose={() => {
          handleClose();
          if (onEditClose) onEditClose();
        }}
        solutionInfo={solutionInfo}
        selectedLocale={selectedLocale}
        renderForm={() => (
          <SolutionInfoEditForm
            solutionInfo={solutionInfo}
            selectedLocale={selectedLocale}
            onSubmit={(values, sliderId) => {
              // update org solution slider list
              let mediaSliderList = {
                primaryId: "",
                organizationMediaSliderId: "",
                organizationSolutionId: "",
              };
              if (sliderId) {
                mediaSliderList = {
                  ...mediaSliderList,
                  primaryId: sliderId,
                  organizationMediaSliderId: sliderId,
                };
              }
              if (solutionInfo?.organizationSolutionId) {
                mediaSliderList = {
                  ...mediaSliderList,
                  organizationSolutionId: solutionInfo.organizationSolutionId,
                };
              }
              // update org solution media list
              const promises: Promise<unknown>[] = parseUpdateMediaPromises(
                organizationId,
                selectedLocale,
                values.organizationMediaList
              );
              if (solutionInfo?.organizationSolutionId)
                promises.push(
                  updateOrgSolution({
                    organizationId,
                    organizationSolutionId:
                      solutionInfo?.organizationSolutionId as string,
                    organizationSolutionName: values.organizationSolutionName,
                    organizationSolutionDescription:
                      values.organizationSolutionDescription,
                    organizationSolutionURL: values.organizationSolutionURL,
                    organizationMediaSliderList: [mediaSliderList],
                    locale: selectedLocale,
                  })
                );
              else {
                promises.push(
                  createOrgSolution({
                    organizationId,
                    organizationSolutionName: values.organizationSolutionName,
                    organizationSolutionDescription:
                      values.organizationSolutionDescription,
                    organizationSolutionURL: values.organizationSolutionURL,
                    organizationMediaList: parseCreateMediaListApiPayload(
                      values.organizationMediaList
                    ),
                    organizationMediaSliderList: [mediaSliderList],
                    locale: selectedLocale,
                  })
                );
              }
              Promise.all(promises)
                .then(() => {
                  if (infoMutate) infoMutate();
                  handleClose();
                })
                .catch((err) => {
                  apis.tools.createLog({
                    function: "updateOrgProduct: error",
                    browserDescription: window.navigator.userAgent,
                    jsonData: {
                      data: err,
                      deviceInfo: getDeviceInfo(),
                    },
                    level: "ERROR",
                  });
                });
            }}
          />
        )}
        infoMutate={infoMutate}
        form={SOLUTION_INFO_EDIT_FORM}
      />
      <EditSectionHeader primary="解決方案資訊">
        <IconButton onClick={handleOpen}>
          <Iconify icon="solar:pen-bold" />
        </IconButton>
      </EditSectionHeader>
      <Stack direction="column" marginBottom={2}>
        <ListItemText
          primary="解決方案名稱"
          secondary={solutionInfo?.organizationSolutionName}
          primaryTypographyProps={{
            typography: "body2",
            color: "text.secondary",
            mb: 0.5,
          }}
          secondaryTypographyProps={{
            typography: "subtitle2",
            color: "text.primary",
            component: "span",
          }}
        />
      </Stack>
      <Stack direction="column" marginBottom={2}>
        <ListItemText
          primary="解決方案連結"
          secondary={solutionInfo?.organizationSolutionURL}
          primaryTypographyProps={{
            typography: "body2",
            color: "text.secondary",
            mb: 0.5,
          }}
          secondaryTypographyProps={{
            typography: "subtitle2",
            color: "text.primary",
            component: "span",
          }}
        />
      </Stack>
      <Stack direction="column" marginBottom={2}>
        <ListItemText
          primary="解決方案說明"
          secondary={solutionInfo?.organizationSolutionDescription}
          primaryTypographyProps={{
            typography: "body2",
            color: "text.secondary",
            mb: 0.5,
          }}
          secondaryTypographyProps={{
            typography: "subtitle2",
            color: "text.primary",
            component: "span",
          }}
        />
      </Stack>
      <Stack direction="column" marginBottom={3}>
        <ListItemText
          primary="背景圖片"
          secondary={
            <Image src={sliderImage.desktop || ""} width={400} height={200} />
          }
          primaryTypographyProps={{
            typography: "body2",
            color: "text.secondary",
            mb: 1,
          }}
          secondaryTypographyProps={{
            border: sliderImage.desktop ? "none" : "1px dashed gray",
            borderRadius: 1,
            maxWidth: 400,
            typography: "subtitle2",
            color: "text.primary",
            component: "span",
            display: "flex",
            alignItems: "center",
          }}
        />
      </Stack>
      <Stack direction="column" marginBottom={2}>
        <ListItemText
          primary="圖示編輯器（建議比例1:1）"
          secondary={
            contentImages?.length !== 0 ? (
              contentImages?.map((el, index) => (
                <Box
                  sx={{
                    border: `1px ${el.normal ? "solid" : "dashed"} gray`,
                    borderRadius: 2,
                    padding: "8px 20px",
                    my: 1,
                    textAlign: "center",
                    minHeight: 142,
                    minWidth: 142,
                  }}
                >
                  <Image
                    src={el.normal || ""}
                    width={100}
                    height={100}
                    style={{
                      border: "1px dashed gray",
                      maxWidth: 100,
                      maxHeight: 100,
                    }}
                  />
                  <Typography
                    sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                    fontSize={12}
                  >
                    {solutionInfo?.organizationMediaList?.[index]
                      ?.organizationMediaTitle || ""}
                  </Typography>
                </Box>
              ))
            ) : (
              <Box
                sx={{
                  border: `1px dashed gray`,
                  borderRadius: 2,
                  padding: "8px 20px",
                  my: 1,
                  textAlign: "center",
                  minHeight: 142,
                  minWidth: 142,
                }}
              >
                <Image
                  src={""}
                  width={100}
                  height={100}
                  style={{
                    border: "1px dashed gray",
                    maxWidth: 100,
                    maxHeight: 100,
                  }}
                />
                <Typography
                  sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                  fontSize={12}
                >
                  {""}
                </Typography>
              </Box>
            )
          }
          primaryTypographyProps={{
            typography: "body2",
            color: "text.secondary",
            mb: 0.5,
          }}
          secondaryTypographyProps={{
            typography: "subtitle2",
            color: "text.primary",
            component: "span",
            display: "flex",
            flexWrap: "nowrap",
            alignItems: "center",
            gap: 2,
          }}
        />
      </Stack>
    </Box>
  );
};

export default SolutionInfoEditor;
