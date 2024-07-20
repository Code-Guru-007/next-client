import React, { FC } from "react";

import { useRouter } from "next/router";
import Stack from "@mui/material/Stack";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ResponsiveTabs from "components/ResponsiveTabs";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";

import Iconify from "minimal/components/iconify";
import Scrollbar from "minimal/components/scrollbar";

import { RoleTargetAuth } from "interfaces/entities";

import AnchorItem, { Data } from "./CrmUserAnchorItem";

export interface TabDataItem {
  label: string;
  value: string;
}

export interface CrmUserContentDrawerProps {
  isOpen?: boolean;
  onClickAway?: () => void;
  contentRef?: React.RefObject<HTMLDivElement>;
  orgColumnsGroup?: any;
  targetRoles?: RoleTargetAuth;
  readable?: boolean;
  handleScrollTo?: (groupId?: string) => void;
  tabValue?: string;
  tabData?: TabDataItem[];
}

const CrmUserContentDrawer: FC<CrmUserContentDrawerProps> = (props) => {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    isOpen = false,
    onClickAway,
    orgColumnsGroup,
    targetRoles,
    readable,
    handleScrollTo,
    tabValue,
    tabData,
  } = props;

  const groupLabelKeysPermissionAllowed = Object.keys(orgColumnsGroup).filter(
    (key) =>
      readable &&
      targetRoles &&
      (targetRoles[key]?.includes("READ") ||
        targetRoles[key]?.includes("WRITE"))
  );

  const { query, push, pathname } = useRouter();

  const handleClose = () => {
    if (onClickAway) onClickAway();
  };

  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ py: 2, pr: 1, pl: 2.5 }}
    >
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        目錄
      </Typography>

      <IconButton onClick={handleClose}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  const renderAnchorItem = () => {
    const result: Data[] = [];

    groupLabelKeysPermissionAllowed.map((key) =>
      result.push({
        id: key,
        title: orgColumnsGroup[key][0].organizationColumnGroup.columnGroupName,
        items: [],
      })
    );

    const sideTitle = result.map((data) => (
      <AnchorItem
        key={data.id}
        data={data}
        offset={137}
        handleScrollTo={handleScrollTo}
      />
    ));

    return (
      <>
        <Typography variant="subtitle2" sx={{ px: 2.5, mt: 3, mb: 1 }}>
          {wordLibrary?.["dynamic field group"] ?? "動態欄位群組"} (
          {result.length})
        </Typography>
        <Scrollbar sx={{ height: 1 }}>{sideTitle}</Scrollbar>
      </>
    );
  };

  return (
    <Drawer
      open={isOpen}
      onClose={handleClose}
      anchor="right"
      PaperProps={{
        sx: { width: 320 },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "transparent",
        },
      }}
    >
      {renderHead}
      <ResponsiveTabs
        value={tabValue}
        tabData={tabData}
        onChange={(value) => {
          push({
            pathname,
            query: {
              ...query,
              tab: value,
            },
          });
        }}
        isDrawer
      />
      <Divider sx={{ borderStyle: "dashed" }} />
      {renderAnchorItem()}
    </Drawer>
  );
};

export default CrmUserContentDrawer;
