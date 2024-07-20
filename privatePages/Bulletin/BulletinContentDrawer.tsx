import React, { FC } from "react";

import Stack from "@mui/material/Stack";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import { useRouter } from "next/router";
import ResponsiveTabs, { TabDataItem } from "components/ResponsiveTabs";

import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import Iconify from "minimal/components/iconify";
import Scrollbar from "minimal/components/scrollbar";
import AnchorItem, { Data } from "./BulletinContentAnchorItem";

export interface BulletinContentDrawerProps {
  isOpen?: boolean;
  onClickAway?: () => void;
  contentRef?: React.RefObject<HTMLDivElement>;
  tabValue?: string;
  tabData?: TabDataItem[];
}

const BulletinContentDrawer: FC<BulletinContentDrawerProps> = (props) => {
  const { isOpen = false, onClickAway, contentRef, tabValue, tabData } = props;
  const wordLibrary = useSelector(getWordLibrary);
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
        {wordLibrary?.["table of contents and header navigation"] ??
          "目錄清單與標題導覽"}
      </Typography>

      <IconButton onClick={handleClose}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  const renderAnchorItem = () => {
    const tags = contentRef?.current?.querySelectorAll("h1, h2");
    const result: Data[] = [];
    let h1Index = -1;
    tags?.forEach((el, index) => {
      const tag = el;
      if (tag.tagName === "H1") {
        h1Index += 1;
        result.push({
          id: h1Index,
          title: tag.textContent || "",
          items: [],
        });
        // force update element id
        tag.id = `${h1Index}`;
      } else if (tag.tagName === "H2") {
        if (result.length === 0) {
          h1Index += 1;
          result.push({
            id: h1Index,
            title: "",
            items: [],
          });
        }
        result[result.length - 1]?.items.push({
          id: index,
          text: tag.textContent || "",
        });
        // force update element id
        tag.id = `${h1Index}-${index}`;
      }
    });
    const sideTitle = result.map((data) => (
      <AnchorItem key={data.id} data={data} />
    ));

    return <Scrollbar sx={{ height: 1 }}>{sideTitle}</Scrollbar>;
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
      {tabValue && (
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
      )}
      <Divider sx={{ borderStyle: "dashed" }} />
      {renderAnchorItem()}
    </Drawer>
  );
};

export default BulletinContentDrawer;
