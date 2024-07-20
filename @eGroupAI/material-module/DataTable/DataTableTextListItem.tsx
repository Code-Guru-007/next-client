import React from "react";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { styled } from "@mui/material/styles";
import Typography from "@eGroupAI/material/Typography";
import { ListItemProps } from "@eGroupAI/material/ListItem";
import StyledListItem from "./StyledListItem";
import { RoleType } from "./typing";

export const TextListItemWrapper = styled("div")({
  lineHeight: "35px",
  display: "flex",
  alignItems: "center",
  padding: "6px 0px",
});

const NameComponent = styled("div")({
  height: "35px",
  lineHeight: "35px",
  display: "flex",
  alignItems: "center",
  padding: "6px 10px 6px 0px",
});

const ValueComponent = styled("div")({
  height: "35px",
  lineHeight: "35px",
  width: "auto",
  display: "flex",
  alignItems: "center",
  padding: "6px 0px 6px 10px",
});

const ReduceComponent = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-end",
  overflow: "visible",
  color: theme.palette.grey[300],
  width: "160px",
  height: "28px",
  lineHeight: "28px",
  padding: "0px 0px 0px 0px",
}));

export interface DataTableTextListItemProps extends ListItemProps {
  /**
   *Object Key and Value
   */
  itemData?: RoleType;
  /**
   * reduce Icon for abbreviationals
   * @default false
   */
  isShortHand?: boolean;
  /**
   * boolean isPopoverShow
   */
  isPopoverShow?: boolean;
  /**
   * mouse event on hover reduce
   */
  onHoverReduce?: (event: React.MouseEvent<HTMLElement>) => void;
  /**
   * mouse event leave from reduce
   */
  onLeaveReduce?: () => void;
}

const DataTableTextListItem = (props: DataTableTextListItemProps) => {
  const {
    itemData,
    isShortHand = false,
    isPopoverShow = false,
    onHoverReduce,
    onLeaveReduce,
    ...other
  } = props;
  return (
    <StyledListItem
      {...other}
      sx={{
        height: "35px",
        verticalAlign: "center",
        padding: 0,
      }}
    >
      {isPopoverShow && (
        <>
          <NameComponent>
            <Typography variant="h5" color="primary">
              {itemData?.name}
            </Typography>
          </NameComponent>
          <ValueComponent>
            <Typography variant="h5" color="default">
              {itemData?.value}
            </Typography>
          </ValueComponent>
        </>
      )}
      {!isPopoverShow && itemData && (
        <>
          <NameComponent>
            <Typography variant="h5" color="primary">
              {itemData?.name}
            </Typography>
          </NameComponent>
          <ValueComponent>
            <Typography variant="h5" color="default">
              {itemData?.value}
            </Typography>
          </ValueComponent>
        </>
      )}
      {isShortHand && (
        <ReduceComponent>
          <span onMouseEnter={onHoverReduce} onMouseLeave={onLeaveReduce}>
            <MoreHorizIcon fontSize="medium" color="inherit" />
          </span>
        </ReduceComponent>
      )}
    </StyledListItem>
  );
};

export default DataTableTextListItem;
