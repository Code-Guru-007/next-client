import React, { FC, ReactNode } from "react";

import { OrganizationCmsSubMenu } from "interfaces/entities";
import { useSelector } from "react-redux";

import Table from "@eGroupAI/material/Table";
import TableRow from "@eGroupAI/material/TableRow";
import TableCell from "@eGroupAI/material/TableCell";
import Tooltip from "@eGroupAI/material/Tooltip";
import Button from "@eGroupAI/material/Button";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import IconButton from "components/IconButton/StyledIconButton";
import EditIcon from "@mui/icons-material/Edit";
import EditSection, { EditSectionProps } from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";

interface CmsMenuDataPanelProps extends EditSectionProps {
  primary?: ReactNode;
  subMenus?: OrganizationCmsSubMenu[];
  onEditMenuClick?: () => void;
  onEditSubMenuClick?: (subMenu: OrganizationCmsSubMenu) => void;
  renderEmpty?: () => ReactNode;
}

const CmsMenuDataPanel: FC<CmsMenuDataPanelProps> = function (props) {
  const {
    primary,
    subMenus,
    onEditMenuClick,
    onEditSubMenuClick,
    renderEmpty,
    ...other
  } = props;
  const wordLibrary = useSelector(getWordLibrary);

  const renderContent = () => {
    if (subMenus?.length) {
      return (
        <Table>
          {subMenus.map((el) => (
            <TableRow key={el.organizationCmsSubMenuId}>
              <TableCell>{el.organizationCmsSubMenuTitle}</TableCell>
              <TableCell align="right">
                <Button
                  onClick={() => {
                    if (onEditSubMenuClick) {
                      onEditSubMenuClick(el);
                    }
                  }}
                >
                  {wordLibrary?.edit ?? "編輯"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      );
    }
    if (renderEmpty) {
      return renderEmpty();
    }
    return undefined;
  };

  return (
    <EditSection {...other}>
      <EditSectionHeader primary={primary}>
        <Tooltip title="編輯選單">
          <IconButton onClick={onEditMenuClick}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </EditSectionHeader>
      {renderContent()}
    </EditSection>
  );
};

export default CmsMenuDataPanel;
