import {
  EntityList,
  OnboardingTourUserProgress,
  OnboardingTourUserProgressAPIResponseData,
} from "@eGroupAI/typings/apis";
import { fetcher, mockFetcher } from "./fetchers";
import makeGetHook from "./makeGetHook";

export const useOnboardingTourUserProgressMock = makeGetHook<
  EntityList<OnboardingTourUserProgress>
>(
  "/organizations/4aba77788ae94eca8d6ff330506af944/members/4b9d0d7bd1784847868a6c079b71337d/onboarding-tours",
  mockFetcher
);

const useOnboardingTourUserProgress =
  makeGetHook<OnboardingTourUserProgressAPIResponseData>(
    "/organizations/{{organizationId}}/members/{{memberId}}/onboarding-tours",
    fetcher
  );

export default useOnboardingTourUserProgress;
