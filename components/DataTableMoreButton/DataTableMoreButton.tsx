import React from "react";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { styled } from "@mui/material/styles";

const ReduceComponent = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-end",
  overflow: "visible",
  color: theme.palette.grey[300],
  width: "160px",
  height: "35px",
  lineHeight: "28px",
  padding: "0px 0px 0px 0px",
}));

export interface DataTableTextListItemProps {
  onHoverReduce?: (event: React.MouseEvent<HTMLElement>) => void;
  /**
   * mouse event leave from reduce
   */
  onLeaveReduce?: () => void;
}

const DataTableTextListItem = (props: DataTableTextListItemProps) => {
  const { onHoverReduce, onLeaveReduce } = props;
  return (
    <ReduceComponent>
      <span
        onMouseEnter={onHoverReduce}
        onMouseLeave={onLeaveReduce}
        style={{
          display: "block",
          width: "100%",
          textAlign: "center",
        }}
      >
        <MoreHorizIcon fontSize="medium" color="inherit" />
      </span>
    </ReduceComponent>
  );
};

export default DataTableTextListItem;
