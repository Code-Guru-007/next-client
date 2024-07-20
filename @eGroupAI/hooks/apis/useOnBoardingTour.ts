import { OnboardingTourAPIData } from "@eGroupAI/typings/apis";
import { fetcher, mockFetcher } from "./fetchers";
import makeGetHook from "./makeGetHook";

export const useOnBoardingTourMock = makeGetHook<OnboardingTourAPIData>(
  "/onboarding-tours",
  mockFetcher
);

const useOnBoardingTour = makeGetHook<OnboardingTourAPIData>(
  "/onboarding-tours",
  fetcher
);

export default useOnBoardingTour;
