import React, { FC } from "react";
import List, { ListProps } from "@eGroupAI/material/List";
import Box from "@eGroupAI/material/Box";
import Typography from "@eGroupAI/material/Typography";
import { Popover } from "@eGroupAI/material";

import { getWordLibrary } from "redux/wordLibrary/selectors";
import { useSelector } from "react-redux";

import DataTableTextListItem from "./DataTableTextListItem";
import { RoleType } from "./typing";

export interface DataTableTextListProps extends ListProps {
  /**
   * limit-count of shown list items
   * @default 3
   */
  limitShow?: number | undefined;
  /**
   * Data to be listed
   */
  renderData?: RoleType[];
  /**
   * reduce Icon for abbreviationals
   */
  shortHandIcon?: React.ReactNode;
  /**
   * Set  Popover anchorEl to TableCell.
   */
  handlePopoverOpen?: (event: React.MouseEvent<HTMLLIElement>) => void;
  /**
   * Set  Popover anchorEl to null.
   */
  handlePopoverClose?: () => void;
}

const DataTableTextList: FC<DataTableTextListProps> = (props) => {
  const { limitShow = 3, renderData = [], ...other } = props;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleHover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleLeave = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popper" : undefined;

  const wordLibrary = useSelector(getWordLibrary);

  return (
    <div>
      <List {...other}>
        {renderData?.map((data, i) =>
          i < limitShow ? (
            <DataTableTextListItem itemData={data} key={data.name} />
          ) : null
        )}
        {renderData.length > limitShow && (
          <DataTableTextListItem
            aria-describedby={id}
            isShortHand
            onHoverReduce={handleHover}
            onLeaveReduce={handleLeave}
          />
        )}
        {renderData.length === 0 && (
          <Typography color="textSecondary">
            {wordLibrary?.["no information found"] ?? "查無資料"}
          </Typography>
        )}
      </List>

      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: "none",
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        disableRestoreFocus
      >
        <Box paddingLeft="30px" paddingRight="30px">
          <div style={{ padding: "24px 18px" }}>
            {renderData?.map((data) => (
              <DataTableTextListItem itemData={data} key={data.name} />
            ))}
          </div>
        </Box>
      </Popover>
    </div>
  );
};

export default DataTableTextList;
