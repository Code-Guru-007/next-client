import { createContext } from "react";
import { OrgChartReportVariables } from "interfaces/entities";
import {
  FilterValues,
  TableFilterConditionGroup,
} from "@eGroupAI/material-module/DataTable";
import { FilterSearch } from "@eGroupAI/typings/apis";
import { ChartReportDataSource } from "interfaces/payloads";
import { ValueType } from "@eGroupAI/material-lab/FilterDropDown";

export interface OrgChartReportDialogContextProps {
  orgChartVariables?: OrgChartReportVariables[];
  filterConditionGroups?: TableFilterConditionGroup[];
  isValidateForm?: boolean;
  validateForm?: boolean;
  setIsAbleToSave?: React.Dispatch<React.SetStateAction<boolean>>;
  filterSearch?: FilterSearch;
  dataSourceListPayload?: ChartReportDataSource[];
  closeReportDialog?: () => void;
  defaultFilterValues?: FilterValues;
  detailedDefaultFilterValues?: { [x: string]: ValueType };
}

const OrgChartReportDialogContext = createContext<
  Partial<OrgChartReportDialogContextProps>
>({});

export default OrgChartReportDialogContext;
