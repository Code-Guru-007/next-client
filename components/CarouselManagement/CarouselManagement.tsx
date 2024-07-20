import React, { FC, useState, useMemo, ReactElement, ReactNode } from "react";

import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import { Locale, PageType } from "interfaces/utils";

import IconButton from "components/IconButton/StyledIconButton";
import Tooltip, { TooltipProps } from "@eGroupAI/material/Tooltip";
import EditIcon from "@mui/icons-material/Edit";
import EditSectionHeader from "components/EditSectionHeader";
import { Item } from "./typing";
import CarouselSortDialog, {
  CarouselSortDialogProps,
} from "./CarouselSortDialog";
import CarouselEditDialog, {
  CarouselEditDialogProps,
} from "./CarouselEditDialog";
import CarouselManagementContext from "./CarouselManagementContext";
import { EditableCarouselListProps } from "./EditableCarouselList";

export interface CarouselManageProps {
  pageType: PageType;
  targetId?: string;
  title?: string;
  onDeleteItemClick?: (selectedItem: Item, closeEditDialog: () => void) => void;
  items?: Item[];
  onItemClick?: CarouselSortDialogProps["onItemClick"];
  onCreateItemClick?: CarouselSortDialogProps["onCreateItemClick"];
  onItemOrderChange?: EditableCarouselListProps["onItemOrderChange"];
  SortDialogProps?: Omit<CarouselSortDialogProps, "open">;
  EditDialogProps?: Omit<
    CarouselEditDialogProps,
    "open" | "form" | "renderForm" | "pageType"
  >;
  renderForm?: CarouselEditDialogProps["renderForm"];
  form?: CarouselEditDialogProps["form"];
  children?: (items?: Item[]) => ReactElement | null;
  disableEditable?: boolean;
  actions?: ReactNode;
  editTooltip?: TooltipProps["title"];
  editIcon?: ReactNode;
}

const CarouselManagement: FC<CarouselManageProps> = function (props) {
  const {
    pageType,
    targetId,
    title,
    onDeleteItemClick,
    onItemOrderChange,
    onItemClick,
    onCreateItemClick,
    items,
    SortDialogProps,
    EditDialogProps,
    renderForm,
    form,
    children,
    disableEditable,
    actions,
    editTooltip = "",
    editIcon = <EditIcon />,
  } = props;
  const [selectedItem, setSelectedItem] = useState<Item>();
  const [selectedLocale, setSelectedLocale] = useState<Locale>(Locale.ZH_TW);
  const {
    isOpen: isSortDialogOpen,
    handleClose: closeSortDialog,
    handleOpen: openSortDialog,
  } = useIsOpen(false);
  const {
    isOpen: isEditDialogOpen,
    handleClose: closeEditDialog,
    handleOpen: openEditDialog,
  } = useIsOpen(false);

  const value = useMemo(
    () => ({
      selectedItem,
      setSelectedItem,
      selectedLocale,
      setSelectedLocale,
      isSortDialogOpen,
      closeSortDialog,
      openSortDialog,
      isEditDialogOpen,
      closeEditDialog,
      openEditDialog,
    }),
    [
      closeEditDialog,
      closeSortDialog,
      isEditDialogOpen,
      isSortDialogOpen,
      openEditDialog,
      openSortDialog,
      selectedItem,
      selectedLocale,
    ]
  );

  return (
    <CarouselManagementContext.Provider value={value}>
      <CarouselSortDialog
        {...SortDialogProps}
        open={isSortDialogOpen}
        onClose={() => {
          if (SortDialogProps?.onClose) {
            SortDialogProps?.onClose();
          }
          closeSortDialog();
        }}
        items={items}
        onItemClick={(item) => {
          setSelectedItem(item);
          if (!disableEditable) {
            openEditDialog();
          }
          if (onItemClick) {
            onItemClick(item);
          }
        }}
        onCreateItemClick={(e) => {
          openEditDialog();
          if (onCreateItemClick) {
            onCreateItemClick(e);
          }
        }}
        onItemOrderChange={onItemOrderChange}
      />
      <CarouselEditDialog
        {...EditDialogProps}
        pageType={pageType}
        targetId={targetId}
        open={isEditDialogOpen}
        onClose={() => {
          if (EditDialogProps?.onClose) {
            EditDialogProps?.onClose();
          }
          closeEditDialog();
          setSelectedItem(undefined);
        }}
        renderForm={renderForm}
        form={form}
        onDeleteClick={(item) => {
          if (onDeleteItemClick && item) {
            onDeleteItemClick(item, () => {
              closeEditDialog();
              setSelectedItem(undefined);
            });
          }
        }}
      />
      <EditSectionHeader primary={title}>
        <Tooltip title={editTooltip}>
          <IconButton onClick={openSortDialog} disabled={!items}>
            {editIcon}
          </IconButton>
        </Tooltip>
        {actions}
      </EditSectionHeader>
      {children && children(items)}
    </CarouselManagementContext.Provider>
  );
};

export default CarouselManagement;
