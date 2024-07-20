import React, { useState } from "react";

import ListItemText from "@eGroupAI/material/ListItemText";
import Paper from "@eGroupAI/material/Paper";
import Typography from "@eGroupAI/material/Typography";

import IconButton from "@eGroupAI/material/IconButton";
import Menu from "@eGroupAI/material/Menu";
import MenuItem from "@eGroupAI/material/MenuItem";
import Box from "@eGroupAI/material/Box";
import Badge from "@eGroupAI/material/Badge";
import Chip from "@eGroupAI/material/Chip";
import Link from "@eGroupAI/material/Link";
import RadioInput from "@eGroupAI/material/RadioInput";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

import Avatar from "@eGroupAI/material/Avatar";

import { useTheme } from "@mui/styles";
import { useSelector } from "react-redux";
import { styled } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import { egPalette } from "@eGroupAI/material/stylesheet/themeOptions";
import { getWordLibrary } from "redux/wordLibrary/selectors";

const useStyles = makeStyles((theme) => ({
  bageIcon: {
    "&.MuiEgIconButton-colorText": {
      backgroundColor: theme.palette.primary.light,
    },
    "&.MuiEgIconButton-colorText:hover": {
      backgroundColor: theme.palette.primary.light,
    },
  },
  dropicon: {
    "&.MuiEgIconButton-colorText": {
      backgroundColor: theme.palette.grey[700],
    },
    "&.MuiEgIconButton-colorText:hover": {
      backgroundColor: theme.palette.grey[500],
    },
  },
  notification: {
    "&.MuiEgIconButton-colorText": {
      backgroundColor: theme.palette.grey[700],
    },
    "&.MuiEgIconButton-colorText:hover": {
      backgroundColor: theme.palette.grey[500],
    },
  },
}));

const StyledOptionItem = styled(MenuItem)(({ theme }) => ({
  padding: "7px 16px",
  "&:hover": {
    background: `${theme.palette.primary.dark}`,
  },
}));
const StyledNotificationItem = styled(MenuItem)(({ theme }) => ({
  padding: "7px 20px",
  "&:hover": {
    background: `${theme.palette.primary.dark}`,
  },
}));

const badgeIcons = {
  img1: (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
      <path
        d="M12 5.25C13.245 5.25 14.2425 4.245 14.2425 3C14.2425 1.755 13.245 0.75 12 0.75C10.755 0.75 9.75 1.755 9.75 3C9.75 4.245 10.755 5.25 12 5.25ZM6 5.25C7.245 5.25 8.2425 4.245 8.2425 3C8.2425 1.755 7.245 0.75 6 0.75C4.755 0.75 3.75 1.755 3.75 3C3.75 4.245 4.755 5.25 6 5.25ZM6 6.75C4.2525 6.75 0.75 7.6275 0.75 9.375V10.5C0.75 10.9125 1.0875 11.25 1.5 11.25H10.5C10.9125 11.25 11.25 10.9125 11.25 10.5V9.375C11.25 7.6275 7.7475 6.75 6 6.75ZM12 6.75C11.7825 6.75 11.535 6.765 11.2725 6.7875C11.2875 6.795 11.295 6.81 11.3025 6.8175C12.1575 7.44 12.75 8.2725 12.75 9.375V10.5C12.75 10.7625 12.6975 11.0175 12.615 11.25H16.5C16.9125 11.25 17.25 10.9125 17.25 10.5V9.375C17.25 7.6275 13.7475 6.75 12 6.75Z"
        fill="white"
      />
    </svg>
  ),
  img2: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M9.6925 0.6925C9.4075 0.4075 9.025 0.25 8.6275 0.25H1.75C0.925 0.25 0.2575 0.925 0.2575 1.75L0.25 12.25C0.25 13.075 0.9175 13.75 1.7425 13.75H12.25C13.075 13.75 13.75 13.075 13.75 12.25V5.3725C13.75 4.975 13.5925 4.5925 13.3075 4.315L9.6925 0.6925ZM4 10.75C3.5875 10.75 3.25 10.4125 3.25 10C3.25 9.5875 3.5875 9.25 4 9.25C4.4125 9.25 4.75 9.5875 4.75 10C4.75 10.4125 4.4125 10.75 4 10.75ZM4 7.75C3.5875 7.75 3.25 7.4125 3.25 7C3.25 6.5875 3.5875 6.25 4 6.25C4.4125 6.25 4.75 6.5875 4.75 7C4.75 7.4125 4.4125 7.75 4 7.75ZM4 4.75C3.5875 4.75 3.25 4.4125 3.25 4C3.25 3.5875 3.5875 3.25 4 3.25C4.4125 3.25 4.75 3.5875 4.75 4C4.75 4.4125 4.4125 4.75 4 4.75ZM8.5 4.75V1.375L12.625 5.5H9.25C8.8375 5.5 8.5 5.1625 8.5 4.75Z"
        fill="white"
      />
    </svg>
  ),
  img3: (
    <svg width="12" height="15" viewBox="0 0 12 15" fill="none">
      <path
        d="M5.99999 0.25C5.65499 0.25 5.30249 0.28 4.94999 0.355C2.87999 0.7525 1.22999 2.425 0.839993 4.495C0.479993 6.4525 1.19999 8.2525 2.50499 9.415C2.82749 9.7 2.99999 10.0975 2.99999 10.5175V12.25C2.99999 13.075 3.67499 13.75 4.49999 13.75H4.70999C4.97249 14.2 5.44499 14.5 5.99999 14.5C6.55499 14.5 7.03499 14.2 7.28999 13.75H7.49999C8.32499 13.75 8.99999 13.075 8.99999 12.25V10.5175C8.99999 10.105 9.16499 9.7 9.47999 9.4225C10.5675 8.4625 11.25 7.06 11.25 5.5C11.25 2.5975 8.90249 0.25 5.99999 0.25ZM6.37499 8.5H5.62499V6.5575L4.25249 5.1925L4.78499 4.66L5.99999 5.875L7.21499 4.66L7.74749 5.1925L6.37499 6.565V8.5ZM7.12499 12.25C7.11749 12.25 7.10999 12.2425 7.10249 12.2425V12.25H4.89749V12.2425C4.88999 12.2425 4.88249 12.25 4.87499 12.25C4.66499 12.25 4.49999 12.085 4.49999 11.875C4.49999 11.665 4.66499 11.5 4.87499 11.5C4.88249 11.5 4.88999 11.5075 4.89749 11.5075V11.5H7.10249V11.5075C7.10999 11.5075 7.11749 11.5 7.12499 11.5C7.33499 11.5 7.49999 11.665 7.49999 11.875C7.49999 12.085 7.33499 12.25 7.12499 12.25ZM7.12499 10.75H4.87499C4.66499 10.75 4.49999 10.585 4.49999 10.375C4.49999 10.165 4.66499 10 4.87499 10H7.12499C7.33499 10 7.49999 10.165 7.49999 10.375C7.49999 10.585 7.33499 10.75 7.12499 10.75Z"
        fill="white"
      />
    </svg>
  ),
  img4: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M14 0.5H2C1.175 0.5 0.5075 1.175 0.5075 2L0.5 15.5L3.5 12.5H14C14.825 12.5 15.5 11.825 15.5 11V2C15.5 1.175 14.825 0.5 14 0.5ZM5.75 7.25H4.25V5.75H5.75V7.25ZM8.75 7.25H7.25V5.75H8.75V7.25ZM11.75 7.25H10.25V5.75H11.75V7.25Z"
        fill="white"
      />
    </svg>
  ),
};

function SmallIcon({ type }) {
  const theme = useTheme();

  return (
    <div
      style={{
        width: "28px",
        height: "28px",
        borderRadius: "50%",
        background: theme.palette.primary.light,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 20px 10px 0",
      }}
    >
      {badgeIcons[type]}
    </div>
  );
}

function NotificiationUserMenu() {
  const wordLibrary = useSelector(getWordLibrary);
  const classes = useStyles();
  const theme = useTheme();
  const [anchorEl3, setAnchorEl3] = React.useState<null | HTMLElement>(null);
  const openMenu3 = Boolean(anchorEl3);
  const handleClick3 = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl3(event.currentTarget);
  };

  const handleClose3 = () => {
    setAnchorEl3(null);
  };

  const [anchorEl4, setAnchorEl4] = React.useState<null | HTMLElement>(null);
  const openMenu4 = Boolean(anchorEl4);
  const handleClick4 = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl4(event.currentTarget);
  };

  const handleClose4 = () => {
    setAnchorEl4(null);
  };

  const notifications = [
    {
      title: "Tommy Chavez",
      desc: "9+ Lorem Ipsum",
      time: "14mn ago",
      isNew: true,
      isRead: false,
      type: "img1",
    },
    {
      title: "Russell Burgess",
      desc: "Lorem Ipsum",
      time: "18mn ago",
      isNew: false,
      isRead: false,
      type: "img2",
    },
    {
      title: "Laurel Bond",
      desc: "4 Lorem Ipsum",
      time: "1 hr ago",
      isNew: false,
      isRead: false,
      type: "img3",
    },
    {
      title: "Walter Butler",
      desc: "9+ Lorem Ipsum",
      time: "14mn ago",
      isNew: true,
      isRead: false,
      type: "img4",
    },
    {
      title: "Tommy Chavez",
      desc: "9+ Lorem Ipsum",
      time: "14mn ago",
      isNew: false,
      isRead: false,
      type: "img2",
    },
    {
      title: "Laurel Bond",
      desc: "Lorem Ipsum",
      time: "30mn ago",
      isNew: false,
      isRead: true,
      type: "img4",
    },
    {
      title: "Walter Butler",
      desc: "5 Lorem Ipsum",
      time: "2hr 14mn ago",
      isNew: false,
      isRead: true,
      type: "img1",
    },
  ];

  const stringAvatar = (name, isNtf) => ({
    sx: {
      width: isNtf ? "56px" : "40px",
      height: isNtf ? "56px" : "40px",
      bgcolor: isNtf ? theme.palette.grey[600] : theme.palette.primary.light,
      fontWeight: "700",
      fontSize: isNtf ? "18px" : "13px",
      color: isNtf ? theme.palette.primary.light : theme.palette.grey[700],
      marginRight: isNtf ? "20px" : "10px",
    },
    children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
  });

  const options = [
    { title: "Tommy Chavez", value: 0, code: "TC" },
    { title: "Russell Burgess", value: 1, code: "RB" },
  ];

  const [selectedOption, setSelectedOption] = useState(options[0]);
  return (
    <>
      <IconButton
        aria-label="notification"
        sx={{
          padding: "10px",
          marginRight: "10px",
          background: theme.palette.grey[600],
        }}
        onClick={handleClick3}
      >
        <Badge
          color="error"
          variant="dot"
          sx={{
            "& .MuiBadge-badge": {
              transform: "scale(0.8) translate(5%, -50%)",
            },
          }}
        >
          <svg width="20" height="20" viewBox="0 0 16 20" fill="none">
            <path
              d="M8 20C9.1 20 10 19.1 10 18H6C6 19.1 6.89 20 8 20ZM14 14V9C14 5.93 12.36 3.36 9.5 2.68V2C9.5 1.17 8.83 0.5 8 0.5C7.17 0.5 6.5 1.17 6.5 2V2.68C3.63 3.36 2 5.92 2 9V14L0 16V17H16V16L14 14Z"
              fill={egPalette.text[3]}
            />
          </svg>
        </Badge>
      </IconButton>
      <IconButton
        size="large"
        sx={{
          backgroundColor: theme.palette.primary.light,
          width: "40px",
          height: "40px",
          "&:hover": { backgroundColor: theme.palette.primary.light },
        }}
        className={classes.bageIcon}
        onClick={handleClick4}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          sx={{ padding: "7px" }}
          badgeContent={
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 14"
              fill="none"
              style={{
                transform: openMenu4 ? "rotate(180deg)" : "initial",
              }}
            >
              <path
                d="M7.28601 14C11.152 14 14.286 10.866 14.286 7C14.286 3.13401 11.152 0 7.28601 0C3.42002 0 0.286011 3.13401 0.286011 7C0.286011 10.866 3.42002 14 7.28601 14Z"
                fill={theme.palette.primary.main}
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.28104 9.76605C7.18584 9.76627 7.09406 9.73056 7.02404 9.66605L3.38804 6.10905C3.35511 6.07607 3.32912 6.03683 3.3116 5.99363C3.29408 5.95044 3.28539 5.90418 3.28604 5.85758C3.2867 5.81097 3.29668 5.76497 3.3154 5.72229C3.33412 5.6796 3.3612 5.6411 3.39504 5.60905C3.46371 5.5434 3.55504 5.50677 3.65004 5.50677C3.74504 5.50677 3.83638 5.5434 3.90504 5.60905L7.28104 8.90905L10.661 5.60905C10.7296 5.54068 10.8222 5.50191 10.919 5.50105C11.0158 5.49909 11.1094 5.53497 11.18 5.60105C11.2139 5.63437 11.2408 5.67416 11.259 5.71805C11.2774 5.76136 11.2866 5.80801 11.286 5.85505C11.2855 5.90267 11.2754 5.9497 11.2564 5.99333C11.2373 6.03697 11.2096 6.07632 11.175 6.10905L7.53904 9.66205C7.46944 9.72834 7.37715 9.76554 7.28104 9.76605Z"
                fill="white"
                stroke="white"
                strokeWidth="0.5"
              />
            </svg>
          }
        >
          <Typography
            // weight="bold"
            sx={{
              fontSize: "13px",
              color: `${theme.palette.grey[700]} !important`,
            }}
          >
            {selectedOption?.code}
          </Typography>
        </Badge>
      </IconButton>
      <Menu
        id="notification-menu"
        anchorEl={anchorEl3}
        open={openMenu3}
        onClose={handleClose3}
        MenuListProps={{
          "aria-labelledby": "notification-button",
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          marginTop: "10px",
          ".MuiPaper-root::-webkit-scrollbar": {
            backgroundColor: theme.palette.grey[600],
            width: "4px",
          },
          ".MuiPaper-root::-webkit-scrollbar-thumb": {
            backgroundColor: "#DEDEDE", // This color is not defined in themeOptions
            borderRadius: "2px",
          },
        }}
      >
        <Paper
          sx={{
            width: "320px",
            color: theme.palette.grey[300],
            padding: "0 5px",
            "& .MuiEgTypography-root": {
              color: "black",
            },
          }}
        >
          <Box sx={{ padding: "4px 6px 4px 20px" }}>
            <Typography
              sx={{
                color: "black",
                fontSize: "15px",
                fontWeight: "500",
              }}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              Notifications
              <IconButton
                aria-label="more"
                sx={{ color: theme.palette.grey[300] }}
                className={classes.notification}
              >
                <MoreHorizIcon />
              </IconButton>
            </Typography>
            <Box>
              <Chip
                label="Read"
                sx={{
                  marginRight: "10px",
                  background: theme.palette.grey[600],
                  color: theme.palette.grey[300],
                  fontSize: "15px",
                  width: "60px",
                  padding: "2px 0 2.46px 0",
                  "&:hover": { background: theme.palette.grey[600] },
                  "& span": { padding: 0 },
                }}
              />
              <Chip
                label="Not Read"
                sx={{
                  background: "transparent",
                  color: theme.palette.grey[300],
                  fontSize: "15px",
                  width: "90px",
                  padding: "2px 0 2.46px 0",
                  "&:hover": { background: theme.palette.grey[600] },
                  "& span": { padding: 0 },
                }}
              />
            </Box>
          </Box>
          <Box sx={{ padding: "8px 10px 4px 20px" }}>
            <Typography
              sx={{
                color: "black",
                fontSize: "15px",
                fontWeight: "500",
              }}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              New
              <Link
                component="button"
                underline="none"
                sx={{
                  color: theme.palette.primary.main,
                  fontFamily: theme.typography.fontFamily,
                  fontSize: "15px",
                  fontWeight: "300",
                }}
              >
                More
              </Link>
            </Typography>
          </Box>
          {notifications.map(
            (item) =>
              !item.isRead && (
                <StyledNotificationItem onClick={handleClose3} key={item.title}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    badgeContent={<SmallIcon type={item.type} />}
                  >
                    <Avatar {...stringAvatar(item.title, true)} />
                  </Badge>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontSize: "15px", color: "black" }}>
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <span
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: theme.palette.grey[300],
                          }}
                        >
                          {item.desc}
                        </span>
                        <span
                          style={{
                            display: "block",
                            fontSize: "12px",
                            color: item.isNew
                              ? theme.palette.primary.main
                              : theme.palette.grey[300],
                          }}
                        >
                          {item.time}
                        </span>
                      </>
                    }
                    sx={{ color: theme.palette.grey[300] }}
                  />
                  {item.isNew && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path
                        d="M4 8C6.20914 8 8 6.20914 8 4C8 1.79086 6.20914 0 4 0C1.79086 0 0 1.79086 0 4C0 6.20914 1.79086 8 4 8Z"
                        fill={theme.palette.primary.main}
                      />
                    </svg>
                  )}
                </StyledNotificationItem>
              )
          )}
        </Paper>
      </Menu>
      <Menu
        id="option-menu"
        anchorEl={anchorEl4}
        open={openMenu4}
        onClose={handleClose4}
        MenuListProps={{
          "aria-labelledby": "option-button",
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          marginTop: "10px",
          ".MuiPaper-root::-webkit-scrollbar": {
            backgroundColor: theme.palette.grey[600],
            width: "4px",
          },
          ".MuiPaper-root::-webkit-scrollbar-thumb": {
            backgroundColor: "#DEDEDE", // This color is not defined in themeOptions
            borderRadius: "2px",
          },
        }}
      >
        <Paper
          sx={{
            width: "320px",
            color: theme.palette.grey[300],
            padding: "0 5px",
            "& li": { minHeight: "54px" },
          }}
        >
          {options.map((item) => (
            <StyledOptionItem
              onClick={() => setSelectedOption(item)}
              key={item.title}
            >
              <Avatar {...stringAvatar(item.title, false)} />
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      fontSize: "15px",
                      color: "black",
                      "&.MuiTypography-root": {
                        color: "black",
                      },
                    }}
                  >
                    {item.title}
                  </Typography>
                }
                sx={{ color: theme.palette.grey[300] }}
              />
              <RadioInput
                name="option"
                label=""
                checked={selectedOption?.value === item.value}
                sx={{
                  ".Mui-checked .MuiSvgIcon-root:nth-child(2)": {
                    transform: "scale(0.8)",
                  },
                  ".MuiRadio-root": { padding: "9px 0" },
                  marginRight: "0px",
                }}
              />
            </StyledOptionItem>
          ))}
          <MenuItem
            sx={{ "&:hover": { background: theme.palette.primary.dark } }}
          >
            <svg
              width="21"
              height="19"
              viewBox="0 0 21 19"
              fill="none"
              style={{ margin: "3px 15px 3px 13px" }}
            >
              <path
                d="M10.5 4.29167V2.20833C10.5 1.0625 9.56254 0.125 8.41671 0.125H2.16671C1.02087 0.125 0.083374 1.0625 0.083374 2.20833V16.7917C0.083374 17.9375 1.02087 18.875 2.16671 18.875H18.8334C19.9792 18.875 20.9167 17.9375 20.9167 16.7917V6.375C20.9167 5.22917 19.9792 4.29167 18.8334 4.29167H10.5ZM8.41671 16.7917H2.16671V14.7083H8.41671V16.7917ZM8.41671 12.625H2.16671V10.5417H8.41671V12.625ZM8.41671 8.45833H2.16671V6.375H8.41671V8.45833ZM8.41671 4.29167H2.16671V2.20833H8.41671V4.29167ZM18.8334 16.7917H10.5V6.375H18.8334V16.7917ZM16.75 8.45833H12.5834V10.5417H16.75V8.45833ZM16.75 12.625H12.5834V14.7083H16.75V12.625Z"
                fill={theme.palette.grey[300]}
              />
            </svg>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    fontSize: "15px",
                    color: "black",
                    "&.MuiTypography-root": {
                      color: "black",
                    },
                  }}
                >
                  {wordLibrary?.["create organization"] ?? "建立單位"}
                </Typography>
              }
              sx={{ color: theme.palette.grey[300] }}
            />
          </MenuItem>
        </Paper>
      </Menu>
    </>
  );
}

export default NotificiationUserMenu;
