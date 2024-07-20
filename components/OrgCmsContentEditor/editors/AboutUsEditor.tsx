/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { IconButton, Tooltip } from "@mui/material";
import Iconify from "minimal/components/iconify";
import EditSectionLoader from "components/EditSectionLoader";
import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import EditSectionDialog from "components/EditSectionDialog";

import { Locale } from "interfaces/utils";
import { FormProvider } from "react-hook-form";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
import Image from "minimal/components/image";
import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import { OrganizationMedia } from "interfaces/entities";
import AboutUsForm, { FORM } from "./AboutUsForm";
import { CmsContentEditorProps } from "../typings";
import useCmsContentEditor from "./useCmsContentEditor";
import useCmsContentForm from "./useCmsContentForm";

const AboutUsEditor: FC<CmsContentEditorProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const { isOpen, handleClose, handleOpen } = useIsOpen(false);
  const [dialogElementShow, setDialogElementShow] = useState<boolean>(false);
  const {
    data,
    onEditClose,
    primary,
    openAddDialog,
    setOpenAddDialog,
    tableSelectedLocale,
    loading = false,
    useOneItemAtOnce = true,
  } = props;
  const { handleSubmit, isUpdating } = useCmsContentEditor(props);

  const [selectedEditItem, setSelectedEditItem] = useState<OrganizationMedia>();
  const { methods } = useCmsContentForm({
    cmsContentId: data?.organizationCmsContentId || "",
    selectedLocale: tableSelectedLocale || Locale.ZH_TW,
  });

  useEffect(() => {
    if (openAddDialog) handleOpen();
  }, [openAddDialog]);

  useEffect(() => {
    if (openAddDialog && !isOpen) setOpenAddDialog(false);
    if (dialogElementShow && !isOpen) setDialogElementShow(false);
    if (!isOpen) setSelectedEditItem(undefined);
  }, [isOpen]);

  if (loading) return <EditSectionLoader />;

  return (
    <>
      <FormProvider {...methods}>
        <EditSectionDialog
          updating={isUpdating}
          renderForm={(selectedLocale) => (
            <AboutUsForm
              dialogElementShow={dialogElementShow}
              onSubmit={handleSubmit(selectedLocale)}
              selectedLocale={selectedLocale}
              cmsContentId={data?.organizationCmsContentId}
              handleClose={() => {
                handleClose();
                if (onEditClose) onEditClose();
              }}
              selectedEditItem={selectedEditItem}
              setSelectedEditItem={setSelectedEditItem}
              useOneItemAtOnce={useOneItemAtOnce}
            />
          )}
          form={FORM}
          tableSelectedLocale={tableSelectedLocale}
          primary={primary}
          open={isOpen}
          onClose={() => {
            handleClose();
            if (onEditClose) onEditClose();
          }}
        />
      </FormProvider>
      <EditSection>
        <EditSectionHeader primary={primary}>
          <Tooltip title="關於我們">
            <IconButton
              onClick={() => {
                handleOpen();
                setSelectedEditItem(data?.organizationMediaList?.[0]);
                setDialogElementShow(true);
              }}
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>
        </EditSectionHeader>
        <Stack direction="column" marginBottom={2}>
          <ListItemText
            primary={wordLibrary?.description ?? "描述"}
            secondary={data?.organizationCmsContentDescription}
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
            primary="圖片"
            primaryTypographyProps={{
              typography: "body2",
              color: "text.secondary",
              mb: 0.5,
            }}
          />
          <Image
            src={
              data?.organizationMediaList?.[0]?.uploadFile.uploadFilePath || ""
            }
            alt="about us image"
            ratio="16/9"
          />
        </Stack>
      </EditSection>
    </>
  );
};

export default AboutUsEditor;
