import { fetcher } from "@eGroupAI/hooks/apis/fetchers";
import makeGetHook from "@eGroupAI/hooks/apis/makeGetHook";

export type PathParams = {
  organizationId?: string;
  organizationUserId?: string;
};

const useOrgUserFinanceSummary = makeGetHook<
  {
    [year: string]: {
      [month: string]: {
        month: number;
        income: number;
        expenditure: number;
      };
    };
  },
  PathParams
>(
  "/organizations/{{organizationId}}/users/{{organizationUserId}}/finance-summary",
  fetcher
);
export default useOrgUserFinanceSummary;
