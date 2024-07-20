import React from "react";
import PrivateLayout from "components/PrivateLayout";
import { Main } from "@eGroupAI/material-layout";
import { Box, CircularProgress, Container } from "@eGroupAI/material";
import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";

import { makeStyles } from "@mui/styles";
import clsx from "clsx";
import EditSectionHeader from "components/EditSectionHeader";
import EditSection from "components/EditSection";
import { useSettingsContext } from "minimal/components/settings";

const useStyles = makeStyles(() => ({
  tabContainer: {
    borderRadius: 0,
    boxShadow: "none",
    padding: 0,
    marginBottom: 0,
    "& .MuiTabs-indicator": {
      height: 2,
    },
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "none",
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 999,
  },
  showLoader: {
    display: "flex",
  },
  lightOpacity: {
    background: "rgba(255,255,255,0.6)",
  },
  darkOpacity: {
    background: "rgba(33, 43, 54, 0.6)",
  },
}));

const ActivityRecords = function () {
  const classes = useStyles();
  const settings = useSettingsContext();

  const { isValidating: isLoading } = useMemberInfo();

  return (
    <PrivateLayout title="Activities">
      <Main>
        <Container maxWidth={false}>
          <Box
            className={clsx(classes.loader, isLoading && classes.showLoader, {
              [classes.lightOpacity]: settings.themeMode === "light",
              [classes.darkOpacity]: settings.themeMode !== "light",
            })}
          >
            <CircularProgress />
          </Box>
          <EditSection>
            <EditSectionHeader primary="Coming Soon ..." />
          </EditSection>
        </Container>
      </Main>
    </PrivateLayout>
  );
};

export default ActivityRecords;
