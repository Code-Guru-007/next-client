export type Values = {
  [name: string]: string | number | null | undefined;
};

export type RemarkValues = {
  [columnId: string]: {
    organizationOptionId: string;
    organizationOptionName: string;
    columnTargetValueRemark?: string;
  }[];
};

export type RemarkValue = {
  organizationOptionId: string;
  organizationOptionName: string;
  columnTargetValueRemark?: string;
}[];

export type CheckboxArray = {
  optionId: string;
  label: string;
  value: string;
  isChecked: boolean;
}[];
