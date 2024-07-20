import React, { FC } from "react";

import { makeStyles, useTheme } from "@mui/styles";
import { useSelector } from "react-redux";
import { getSelectedOrg } from "@eGroupAI/redux-modules/memberOrgs";

import ListItem from "@eGroupAI/material/ListItem";
import ListItemIcon from "@eGroupAI/material/ListItemIcon";
import ListItemText from "@eGroupAI/material/ListItemText";
import BusinessIcon from "@mui/icons-material/Business";
import { Tooltip } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(0, 0),
    color: "#646464",

    "& .MuiTypography-root": {
      color: "#646464",
    },
    "& .MuiListItemIcon-root": {
      minWidth: "unset",
      marginRight: theme.spacing(1),
      color: "#646464",
      "& .MuiSvgIcon-root": {
        width: 20,
        height: 20,
      },
    },
  },
}));

export interface OrgNameButtonProps {
  shouldMiniItem?: boolean;
}

const OrgNameButton: FC<OrgNameButtonProps> = function ({ shouldMiniItem }) {
  const classes = useStyles();
  const theme = useTheme();
  const organization = useSelector(getSelectedOrg);

  return (
    <ListItem className={classes.root}>
      {!shouldMiniItem ? (
        <>
          <ListItemIcon>
            <BusinessIcon sx={{ color: theme.palette.text.primary }} />
          </ListItemIcon>
          <Tooltip title={organization?.organizationName || ""}>
            <ListItemText
              primary={organization?.organizationName}
              primaryTypographyProps={{
                noWrap: true,
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
              sx={{
                "& span.MuiTypography-root": {
                  color: theme.palette.text.primary,
                },
                maxWidth: { sm: "150px", xs: "70px" },
              }}
            />
          </Tooltip>
        </>
      ) : (
        <BusinessIcon sx={{ color: theme.palette.text.primary }} />
      )}
    </ListItem>
  );
};

export default OrgNameButton;
