import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Step } from "react-joyride";

import { OnboardingTourType } from "@eGroupAI/typings/apis";
import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";
import moduleRouteMapping from "utils/moduleRouteMapping";
import { useSelector } from "react-redux";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import { ServiceModuleValue } from "interfaces/utils";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { getApiLoadingStates } from "@eGroupAI/redux-modules/apis/selectors";

import useOnBoardingTour from "../apis/useOnBoardingTour";
import useOnboardingTourUserProgress from "../apis/useOnboardingTourUserProgress";

export interface TutorialPropType {
  moduleKey?: ServiceModuleValue;
  tabKey?: string;
  pageLoading?: boolean;
}

function getElementWithXPath(xPath: string) {
  return document.evaluate(
    xPath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
}

const getTourByTabKey = (
  moduleTutorialArray: OnboardingTourType[] = [],
  tabKey: string
): OnboardingTourType => {
  const tutorialByTabkey = moduleTutorialArray.filter(({ tabType }) =>
    tabType.toLowerCase().includes((tabKey || "").toLowerCase())
  );

  const tourXPathResolved = tutorialByTabkey.map(({ steps, ...others }) => {
    const stepsXPathResolved = steps.map(
      ({ target: targetXPathString, ...other }, index) => {
        const xPathTarget = getElementWithXPath(`${targetXPathString}`);
        // const xPathTarget = getElementWithXPath(
        //   `//*[@id='__next']/div/div/main/main/div/div/div[3]/div/div[1]/div[4]/div/div[1]/div[2]/div/div/div/table`
        // );
        if (!xPathTarget)
          // eslint-disable-next-line no-console
          console.warn(
            `target XPath: ${targetXPathString} not fount - `,
            xPathTarget
          );
        return {
          ...other,
          target: xPathTarget,
          disableBeacon: index === 0,
          placement: "bottom",
        } as Step;
      }
    );

    return {
      ...others,
      steps: stepsXPathResolved,
    } as OnboardingTourType;
  });

  return tourXPathResolved[0] as OnboardingTourType;
};

export default function useOnboardingTutorialParams(props?: TutorialPropType) {
  const { moduleKey: moduleParam, tabKey: tabParam } = props || {};

  const { query, pathname } = useRouter();
  const { data: memberInfo } = useMemberInfo();
  const locale = useSelector(getGlobalLocale);
  const organizationId = useSelector(getSelectedOrgId);

  // get onBoarding tutorial JSON data from API
  const { data: onBoardingTutorialData, isValidating: isFetchingJSON } =
    useOnBoardingTour(undefined, {
      locale,
    });

  const {
    data: userProgress,
    isValidating: isFetchingUserProgress,
    mutate,
  } = useOnboardingTourUserProgress(
    {
      organizationId,
      memberId: memberInfo?.loginId || "",
    },
    { locale }
  );

  const apiFetching = useSelector(getApiLoadingStates);
  const isRequestingApi = useMemo(
    () =>
      isFetchingJSON ||
      isFetchingUserProgress ||
      Object.keys(apiFetching).length > 0,
    [apiFetching, isFetchingJSON, isFetchingUserProgress]
  );

  const [tourTutorial, setTourTutorial] = useState<OnboardingTourType>();
  const [tabByPath, setTabByPath] = useState<string>(
    (query.tab as string) || ""
  );
  const [tourId, setTourId] = useState<string>("");
  const [memberTourStepId, setMemberTourStepId] = useState<string>("");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [tourStatus, setTourStatus] = useState<string>("");

  /**
   * Find module by path.
   */
  const moduleNameByPath = useMemo(() => {
    const modules = Object.keys(moduleRouteMapping);
    let result = "";
    let subModuleName = "";
    for (let i = 0; i < modules.length; i += 1) {
      const moduleName = modules[i];
      if (moduleName) {
        const modulePaths = moduleRouteMapping[moduleName];
        if (modulePaths?.includes(pathname)) {
          result = moduleName as ServiceModuleValue;
          if (
            (result === ServiceModuleValue.ARTICLE ||
              result === ServiceModuleValue.BULLETIN) &&
            pathname.includes("/edit")
          ) {
            subModuleName = `${moduleName}_EDITING`;
            setTabByPath(subModuleName);
          }
          break;
        }
      }
    }
    return result;
  }, [pathname]);

  const moduleKey = useMemo(
    () => moduleParam || moduleNameByPath,
    [moduleNameByPath, moduleParam]
  );
  const tabKey = useMemo(() => tabParam || tabByPath, [tabParam, tabByPath]);

  const userTourProgress = useMemo(
    () =>
      userProgress?.content.filter(
        ({ onboardingTourStep }) =>
          onboardingTourStep.serviceModuleValue === moduleKey &&
          onboardingTourStep.serviceSubModuleValue.toLowerCase() ===
            tabKey?.toLowerCase()
      )[0],
    [moduleKey, tabKey, userProgress?.content]
  );

  useEffect(() => {
    if (userTourProgress) {
      setCurrentStepIndex(userTourProgress.memberOnboardingTourStepIndex);
      setTourStatus(userTourProgress.memberOnboardingTourStepStatus);
    } else {
      setTourStatus("COMPLETED");
    }
  }, [userTourProgress, userTourProgress?.memberOnboardingTourStepId]);

  useEffect(() => {
    if (query.tab && query.tab !== "") setTabByPath(query.tab as string);
    return () => {
      setTabByPath("");
    };
  }, [query.tab]);

  useEffect(() => {
    if (memberInfo?.loginId) {
      setTourId(
        userTourProgress?.onboardingTourStep.onboardingTourStepId ||
          `user_tour-${memberInfo.loginId}-${moduleKey}-tab_${tabKey}`
      );
      setMemberTourStepId(userTourProgress?.memberOnboardingTourStepId || "");
    }
    return () => {
      setTourId("");
      setMemberTourStepId("");
    };
  }, [
    moduleKey,
    tabKey,
    memberInfo?.loginId,
    userTourProgress?.onboardingTourStep.onboardingTourStepId,
    userTourProgress?.memberOnboardingTourStepId,
  ]);

  useEffect(() => {
    if (!isRequestingApi) {
      if (onBoardingTutorialData && onBoardingTutorialData[moduleKey]) {
        setTourTutorial(
          getTourByTabKey(onBoardingTutorialData[moduleKey], tabKey)
        );
      }
    }
  }, [moduleKey, onBoardingTutorialData, isRequestingApi, tabKey]);

  useEffect(() => {
    const abortController = new AbortController();
    return () => {
      abortController.abort();
    };
  }, []);

  return {
    tourId,
    steps: tourTutorial?.steps,
    currentStepIndex,
    tourStatus,
    memberOnboardingTourStepId: memberTourStepId,
    mutate,
  };
}
