import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "@mui/styles";
import Joyride, { CallBackProps, TooltipRenderProps } from "react-joyride";
import { useResponsive } from "minimal/hooks/use-responsive";
import { useSettingsContext } from "minimal/components/settings";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import Iconify from "minimal/components/iconify";

import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";

import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";
import useOnboardingTutorialParams from "@eGroupAI/hooks/useOnboardingTutorialParams";
import { getApiLoadingStates } from "@eGroupAI/redux-modules/apis/selectors";

// Define the prop types for the OnboardingTour component
type OnboardingTourProps = {
  initialRun?: boolean; // Determine if the tour should run initially
};

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  initialRun = true,
}) => {
  const theme = useTheme();
  const { asPath } = useRouter();

  const { data: memberInfo } = useMemberInfo();

  const {
    steps = [],
    currentStepIndex,
    tourStatus: tourStatusProp,
    memberOnboardingTourStepId,
    mutate,
  } = useOnboardingTutorialParams();

  const organizationId = useSelector(getSelectedOrgId);

  const { excute: updateMemberOnboardingTourStep } = useAxiosApiWrapper(
    apis.member.updateMemberOnboardingTourStep,
    "None"
  );

  const settings = useSettingsContext();
  const lgUp = useResponsive("up", "lg");
  const isMini = settings.themeLayout === "mini";
  const isStretch = settings.themeStretch;

  // const isTourCompleted = localStorage.getItem(`onboarding_tour-${tourId}`);
  const [tourStatus, setTourStatus] = useState<string>(
    tourStatusProp || "COMPLETED"
  );

  useEffect(() => {
    setTourStatus(tourStatusProp);
  }, [tourStatusProp]);

  const [isPageLoaded, setIsPageLoaded] = useState<boolean>(false);
  useEffect(() => {
    if (asPath !== "") {
      setIsPageLoaded(false);
    }
  }, [asPath]);

  const apiFetching = useSelector(getApiLoadingStates);
  const isRequestingApi = useMemo(
    () => Object.keys(apiFetching).length > 0,
    [apiFetching]
  );

  useEffect(() => {
    if (!isPageLoaded && !isRequestingApi) {
      setIsPageLoaded(true);
    }
  }, [isPageLoaded, isRequestingApi]);

  const [tourAvailable, setTourAvailable] = useState<boolean>(false);
  const [reOpen, setReOpen] = useState(false);
  // State to control if the tour is currently running
  const [run, setRun] = useState(initialRun);

  // State to control the current step index
  const [stepIndex, setStepIndex] = useState(currentStepIndex || 0);

  useEffect(() => {
    setStepIndex(currentStepIndex || 0);
  }, [currentStepIndex]);

  // On component mount, check if the tour has been completed previously using tourId
  useEffect(() => {
    if (
      (tourStatus === "PROGRESSING" || tourStatus === "NOT_STARTED") &&
      steps.length > 0 &&
      isPageLoaded
    ) {
      if (tourStatus === "NOT_STARTED") {
        setStepIndex(0);
      }
      setTourAvailable(true);
      setIsPageLoaded(true);
    } else setTourAvailable(false);
  }, [isPageLoaded, tourStatus, steps.length]);

  useEffect(() => {
    if (tourAvailable) setRun(initialRun);
    else setRun(false);
  }, [initialRun, tourAvailable]);

  useEffect(() => {
    if (tourAvailable) {
      setReOpen(true);
      setRun(false);
      setTimeout(() => {
        setReOpen(false);
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMini, lgUp, isStretch]);

  useEffect(() => {
    if (reOpen) {
      setRun(true);
    }
  }, [reOpen]);

  const Tooltip = ({
    backProps: { onClick: onClickBack, otherBackProps },
    // continuous,
    index,
    isLastStep,
    primaryProps: { onClick: onClickPrimary, otherPrimaryProps },
    skipProps: { onClick: onClickSkip, otherSkipProps },
    step,
    tooltipProps,
  }: TooltipRenderProps) => {
    const handleMemberTourSkip = () => {
      updateMemberOnboardingTourStep({
        organizationId,
        memberId: memberInfo?.loginId || "",
        memberOnboardingTourStepId,
        memberOnboardingTourStepIndex: steps.length - 1,
        memberOnboardingTourStepStatus: "COMPLETED",
      })
        .then((res) => {
          setTourStatus(res.data.memberOnboardingTourStepStatus);
          mutate();
        })
        .catch(() => {});
    };

    const handleMemberTourPrevious = () => {
      updateMemberOnboardingTourStep({
        organizationId,
        memberId: memberInfo?.loginId || "",
        memberOnboardingTourStepId,
        memberOnboardingTourStepIndex: stepIndex - 1 > 0 ? stepIndex - 1 : 0,
        memberOnboardingTourStepStatus: "PROGRESSING",
      })
        .then((res) => {
          setTourStatus(res.data.memberOnboardingTourStepStatus);
        })
        .catch(() => {});
    };

    const handleMemberTourNext = () => {
      updateMemberOnboardingTourStep({
        organizationId,
        memberId: memberInfo?.loginId || "",
        memberOnboardingTourStepId,
        memberOnboardingTourStepIndex:
          stepIndex === steps.length - 1 ? steps.length - 1 : stepIndex + 1,
        memberOnboardingTourStepStatus:
          stepIndex === steps.length - 1 ? "COMPLETED" : "PROGRESSING",
      })
        .then((res) => {
          setTourStatus(res.data.memberOnboardingTourStepStatus);
        })
        .catch(() => {});
    };

    return (
      <Paper
        {...tooltipProps}
        sx={{
          backgroundColor: theme.palette.background.paper,
          border: false,
          maxWidth: 480,
          minWidth: 240,
          overflow: "hidden",
          borderRadius: 1,
          padding: 2,
          paddingBottom: 1,
        }}
      >
        <Stack alignItems={"center"} sx={{ position: "relative" }}>
          <IconButton
            sx={{ position: "absolute", top: 0, right: 0 }}
            {...otherSkipProps}
            onClick={(e) => {
              handleMemberTourSkip();
              onClickSkip(e);
            }}
          >
            <Iconify icon="iconamoon:close-fill" />
          </IconButton>
          {step.title && (
            <Typography variant="h4" color="primary">
              {step.title}
            </Typography>
          )}
          {step.content && <Box sx={{ p: 1 }}>{step.content}</Box>}
        </Stack>
        <Box sx={{ padding: 1 }}>
          <Stack
            sx={{ display: "flex", alignItems: "space-between" }}
            direction="row"
          >
            {!isLastStep && (
              <Button
                {...otherSkipProps}
                size="sm"
                variant="text"
                disableFocusRipple
                onClick={(e) => {
                  handleMemberTourSkip();
                  onClickSkip(e);
                }}
              >
                跳過導引
              </Button>
            )}
            <Box flexGrow={1} />
            <Stack direction="row" spacing={1}>
              {index > 0 && (
                <Button
                  {...otherBackProps}
                  size="sm"
                  variant="outlined"
                  disableFocusRipple
                  onClick={(e) => {
                    handleMemberTourPrevious();
                    onClickBack(e);
                  }}
                >
                  上一步
                </Button>
              )}
              <Button
                {...otherPrimaryProps}
                size="sm"
                variant="contained"
                disableFocusRipple
                onClick={(e) => {
                  handleMemberTourNext();
                  onClickPrimary(e);
                }}
              >
                {!isLastStep ? "下一步" : "完成導引"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    );
  };

  // Callback handler for Joyride tour events
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data;

    // If the tour is finished or skipped, mark it as completed in localStorage
    if (status === "finished" || status === "skipped") {
      // localStorage.setItem(`onboarding_tour-${tourId}`, "true");
      setRun(false);
      return;
    }

    // Navigate to the next step
    if (type === "step:after" && action === "next") {
      setStepIndex(index + 1);
      return;
    }

    // Navigate to the previous step
    if (type === "step:after" && action === "prev") {
      if (index > 0) setStepIndex(index - 1);
      return;
    }

    // Close the tour
    if (action === "close") {
      setRun(false);
    }
  };

  // Styling for the Joyride tour
  const joyrideStyles = {
    spotlight: {
      backgroundColor: "transparent",
    },
    overlay: {
      backgroundColor: "transparent",
    },
  };

  // Render the Joyride component with provided props and configurations
  if (steps.length && steps.length !== 0 && run)
    return (
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        callback={handleJoyrideCallback}
        showSkipButton
        continuous
        showProgress
        disableOverlay
        disableOverlayClose
        styles={{
          ...joyrideStyles,
          options: {
            zIndex: theme.zIndex.drawer - 100,
          },
        }}
        tooltipComponent={Tooltip}
        debug
      />
    );
  return null;
};

export default OnboardingTour;
