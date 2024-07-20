export type Item = {
  label: string;
  value: string;
};

export type ValueType =
  | number[]
  | (number | null)[]
  | (Date | null)[]
  | string[]
  | Item[];

export type Value = {
  [name: string]: ValueType;
};

export type OptionType =
  | "CHOICEMULTI"
  | "DATE_RANGE"
  | "DATETIME_RANGE"
  | "NUMBER_RANGE"
  | "CHOICEMULTI_TEXT";

export type Option = {
  filterId: string;
  filterKey: string;
  filterName: string;
  columnId: string;
  type: OptionType | string;
  icon?: string;
  items?: Item[];
  disabled?: boolean;
  filterGroupName?: string;
  filterGroupIndex?: number;
  filterValue?: ValueType;
  targetType?: string;
};

export type NumberRangeStates = {
  [key: string]: boolean;
};
