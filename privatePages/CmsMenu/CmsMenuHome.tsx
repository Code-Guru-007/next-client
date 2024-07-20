/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from "react";

import { useSelector } from "react-redux";

import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";

import Iconify from "minimal/components/iconify";

import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import Tooltip from "@eGroupAI/material/Tooltip";

import EditSectionLoader from "components/EditSectionLoader";
import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import IconButton from "components/IconButton/StyledIconButton";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import useOrgCmsPageMenu from "utils/useOrgCmsPageMenu";
import { Locale, PageType } from "interfaces/utils";
import { OrganizationCmsPageMenu } from "interfaces/entities";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import CmsPageMenuDialog from "./CmsPageMenuDialog";

export interface CmsMenuHomeProps {
  tableSelectedLocale?: Locale;
  openEditDialog: boolean;
  setOpenEditDialog: (val: boolean) => void;
}

const CmsMenuHome: FC<CmsMenuHomeProps> = function (props) {
  const { openEditDialog, setOpenEditDialog, tableSelectedLocale } = props;

  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);

  const { isOpen, handleClose, handleOpen } = useIsOpen(false);

  const [selectedLocale, setSelectedLocale] = useState<Locale>(
    tableSelectedLocale || Locale.ZH_TW
  );

  const [selectedOrgCmsPageMenu, setSelectedOrgCmsPageMenu] =
    useState<OrganizationCmsPageMenu>();

  const { excute: updateOrgCmsPageMenu, isLoading: isUpdating } =
    useAxiosApiWrapper(apis.org.updateOrgCmsPageMenu, "Update");

  const { data, mutate } = useOrgCmsPageMenu(
    {
      organizationId,
    },
    {
      locale: tableSelectedLocale,
      PAGE_TYPE_: PageType.INDEX,
    }
  );

  useEffect(() => {
    if (openEditDialog) handleOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openEditDialog]);

  useEffect(() => {
    if (openEditDialog && !isOpen) {
      if (setOpenEditDialog) setOpenEditDialog(false);
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!data?.source) return <EditSectionLoader />;

  return (
    <>
      <CmsPageMenuDialog
        onSubmit={async (values) => {
          try {
            if (selectedOrgCmsPageMenu) {
              await updateOrgCmsPageMenu({
                organizationId,
                organizationCmsPageMenuId:
                  selectedOrgCmsPageMenu.organizationCmsPageMenuId,
                organizationCmsPageMenuTitle: values.title,
                locale: selectedLocale || Locale.ZH_TW,
              });
              handleClose();
              setSelectedOrgCmsPageMenu(undefined);
              mutate();
            }
          } catch (error) {
            apis.tools.createLog({
              function: "updateOrgCmsPageMenu: error",
              browserDescription: window.navigator.userAgent,
              jsonData: {
                data: error,
                deviceInfo: getDeviceInfo(),
              },
              level: "ERROR",
            });
          }
        }}
        loading={isUpdating}
        title="首頁"
        tableSelectedLocale={selectedLocale || Locale.ZH_TW}
        handleSelectedLocale={setSelectedLocale}
        open={isOpen}
        values={{
          title: selectedOrgCmsPageMenu?.organizationCmsPageMenuTitle || "",
        }}
        onClose={() => {
          handleClose();
          setSelectedOrgCmsPageMenu(undefined);
          mutate();
        }}
      />
      <EditSection>
        <EditSectionHeader primary="首頁">
          <Tooltip title="編輯首頁">
            <IconButton
              onClick={() => {
                setSelectedOrgCmsPageMenu(data?.source[0]);
                setOpenEditDialog(true);
              }}
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
        </EditSectionHeader>
        <Stack direction="column" marginBottom={2}>
          <ListItemText
            primary={wordLibrary?.type ?? "類型"}
            secondary={data?.source[0]?.organizationCmsPageMenuPageType}
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
            primary={wordLibrary?.title ?? "標題"}
            secondary={data?.source[0]?.organizationCmsPageMenuTitle}
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
      </EditSection>
    </>
  );
};

export default CmsMenuHome;
