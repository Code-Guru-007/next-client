import React, { FC } from "react";

import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import { ServiceModuleValue } from "interfaces/utils";
import { OrganizationTag } from "interfaces/entities";

import IconButton from "components/IconButton/StyledIconButton";
import EditSectionHeader from "components/EditSectionHeader";
import EditSectionDialog, {
  EditSectionDialogProps,
} from "components/EditSectionDialog";
import Iconify from "minimal/components/iconify";
import TagsForm from "./TagsForm";
import TagList from "../TagList";

export interface TagsEditorProps {
  targetId: string;
  serviceModuleValue: ServiceModuleValue;
  tags?: OrganizationTag[];
  onClose?: EditSectionDialogProps["onClose"];
  hideEdit?: boolean;
}

const TagsEditor: FC<TagsEditorProps> = function (props) {
  const { targetId, serviceModuleValue, tags, onClose, hideEdit } = props;
  const { isOpen, handleClose, handleOpen } = useIsOpen(false);

  return (
    <>
      <EditSectionDialog
        primary="標籤管理"
        open={isOpen}
        onClose={() => {
          handleClose();
          if (onClose) {
            onClose();
          }
        }}
        disableSelectLocale
        hideSubmitButton
        renderForm={() => (
          <TagsForm
            targetId={targetId}
            serviceModuleValue={serviceModuleValue}
            selectedTags={tags}
          />
        )}
      />
      <EditSectionHeader primary="標籤管理">
        {!hideEdit && (
          <IconButton onClick={handleOpen}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        )}
      </EditSectionHeader>
      <TagList
        tags={tags?.map((el) => ({
          name: el.tagName,
          color: el.tagColor,
        }))}
      />
    </>
  );
};

export default TagsEditor;
