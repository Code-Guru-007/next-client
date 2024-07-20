import { isValid } from "@eGroupAI/utils/dateUtils";
import {
  Option,
  Value as FilterValue,
  ValueType,
} from "@eGroupAI/material-lab/FilterDropDown";
import {
  Equal,
  FilterConditionGroup,
  FilterSearch,
  Range,
} from "@eGroupAI/typings/apis";
import { optionToValueType } from "@eGroupAI/material-lab/FilterDropDown/utils";

import { Column, EachRowState, RowState } from "./typing";

export type FilterOptionsGroup = {
  filterConditionList: Option[];
  filterConditionGroupName: FilterConditionGroup["filterConditionGroupName"];
}[];

export type Item = {
  label: string;
  value: string;
};

export type Value = {
  [name: string]:
    | number[]
    | (number | null)[]
    | (Date | null)[]
    | string[]
    | Item[];
};

export type FilterValues = {
  [key: number]: {
    [name: string]:
      | number[]
      | (number | null)[]
      | (Date | null)[]
      | string[]
      | Item[];
  };
};

export const compare2StringArray = (
  arr1: (string | number)[],
  arr2: (string | number)[]
): boolean => {
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;
  const filteredArr = arr1.reduce<(string | number)[]>((a, b) => {
    if (arr2.includes(b)) return [...a, b];
    return a;
  }, []);
  if (arr1.length !== filteredArr.length) return false;
  return true;
};

export const compare2Equals = (obj1: Equal[], obj2: Equal[]): boolean => {
  if (!obj1 || !obj2) return false;
  if (obj1.length !== obj2.length) return false;
  const keys1 = obj1.map(({ columnId }) => columnId || "");
  const keys2 = obj2.map(({ columnId }) => columnId || "");
  if (!compare2StringArray(keys1, keys2)) return false;
  const values1 = obj1.reduce<string[]>((a, b) => {
    if (b.value) return [...a, ...b.value];
    return [...a];
  }, []);
  const values2 = obj2.reduce<string[]>((a, b) => {
    if (b.value) return [...a, ...b.value];
    return [...a];
  }, []);
  if (!compare2StringArray(values1, values2)) return false;
  return true;
};

export const compare2Ranges = (obj1: Range[], obj2: Range[]): boolean => {
  if (!obj1 || !obj2) return false;
  if (obj1.length !== obj2.length) return false;
  const keys1 = obj1.map(({ columnId }) => columnId || "");
  const keys2 = obj2.map(({ columnId }) => columnId || "");
  if (!compare2StringArray(keys1, keys2)) return false;
  const values1 = obj1.reduce<(string | number)[]>(
    (a, b) => [...a, b.from, b.to],
    []
  );
  const values2 = obj2.reduce<(string | number)[]>(
    (a, b) => [...a, b.from, b.to],
    []
  );
  if (!compare2StringArray(values1, values2)) return false;
  return true;
};

export const compare2FilterObjects = (
  o1: FilterSearch | undefined,
  o2: FilterSearch | undefined
): boolean => {
  if (!o1 || !o2) return false;
  return (
    o1.startIndex === o2.startIndex &&
    o1.size === o2.size &&
    o1.locale === o2.locale &&
    compare2Equals(o1.equal as Equal[], o2.equal as Equal[]) &&
    compare2Ranges(o1.range as Range[], o2.range as Range[])
  );
};

export const compare2FilterValueArray = (
  values1: ValueType[],
  values2: ValueType[]
): boolean => {
  if (!values1 || !values2) return false;
  if (values1.length !== values2.length) return false;

  const strArr1 = values1.reduce<string[]>((a, b) => {
    if (typeof b[0] === "number" || typeof b[1] === "number") return a;
    if (isValid(b[0]) || isValid(b[1])) {
      const parsedToISODate = b.map((bb) => new Date(bb).toISOString());
      return [...a, ...parsedToISODate];
    }
    if (typeof b[0] === "string") {
      const parsedToString = b.map((bb) => bb as string);
      return [...a, ...parsedToString];
    }
    return a;
  }, []);
  const strArr2 = values2.reduce<string[]>((a, b) => {
    if (typeof b[0] === "number" || typeof b[1] === "number") return a;
    if (isValid(b[0]) || isValid(b[1])) {
      const parsedToISODate = b.map((bb) => new Date(bb).toISOString());
      return [...a, ...parsedToISODate];
    }
    if (typeof b[0] === "string") {
      const parsedToString = b.map((bb) => bb as string);
      return [...a, ...parsedToString];
    }
    return a;
  }, []);

  if (!compare2StringArray(strArr1, strArr2)) return false;
  return true;
};

export const getParsedFilterValues = (obj: FilterValues): FilterValues => {
  const re = Object.keys(obj).reduce<FilterValues>((a, key) => {
    const valueObj = obj[key] || {};
    const value = Object.keys(valueObj).reduce<{ [x: string]: ValueType }>(
      (a, k) => {
        if (valueObj[k].filter((v) => v !== null).length === 0) return a;
        return { ...a, [key]: valueObj[k] };
      },
      {}
    );
    return { ...a, [Number(key)]: value };
  }, {});
  return re;
};

export const compare2FilterValues = (
  o1: FilterValues,
  o2: FilterValues
): boolean => {
  if (!o1 || !o2) return false;
  if (Object.keys(o1).length !== Object.keys(o2).length) return false;
  const obj1 = Object.values(o1).reduce<Value>((a, b) => ({ ...a, ...b }), {});
  const obj2 = Object.values(o2).reduce<Value>((a, b) => ({ ...a, ...b }), {});
  const valuedObj1 = Object.fromEntries(
    Object.entries(obj1).filter(([, value]) => value.length !== 0)
  );
  const valuedObj2 = Object.fromEntries(
    Object.entries(obj2).filter(([, value]) => value.length !== 0)
  );
  const keys1 = Object.keys(valuedObj1) || [];
  const keys2 = Object.keys(valuedObj2) || [];
  if (!compare2StringArray(keys1, keys2)) return false;
  const values1 = Object.values(valuedObj1) || [];
  const values2 = Object.values(valuedObj2) || [];
  if (!compare2FilterValueArray(values1, values2)) return false;
  return true;
};

export const asc = <Item>(data: Item[], key: string) =>
  data.sort((a, b) => {
    if (a[key] === b[key]) {
      return 0;
    }
    return b[key] > a[key] ? 1 : -1;
  });

export const desc = <Item>(data: Item[], key: string) =>
  data.sort((a, b) => {
    if (a[key] === b[key]) {
      return 0;
    }
    return a[key] > b[key] ? 1 : -1;
  });

export const getFilterValueCount = (value: FilterValue): [number, boolean] => {
  let hasTriggerRange = false;
  const list = Object.values(value)
    .reduce<ValueType[]>((a, b) => {
      const isNumberArray =
        typeof b[0] === "number" || typeof b[1] === "number";
      const isDateArray = isValid(b[0]) || isValid(b[1]);
      if (isNumberArray || isDateArray) {
        hasTriggerRange = true;
        return a;
      }
      return [...a, ...b] as ValueType[];
    }, [])
    .filter(Boolean);
  return [list.length, hasTriggerRange];
};

export const getFilterValueCountV2 = (
  value: FilterValue
): [number, boolean] => {
  let hasTriggerRange = false;
  if (typeof value !== "object") return [0, false];
  const list = Object.values(value)
    .reduce<ValueType[]>((a, b) => {
      const isNumberArray = typeof b[0] === "number";
      if (isNumberArray) {
        hasTriggerRange = true;
        return [...a, b.join(",")] as ValueType[];
      }
      const isDateArray = typeof isValid(b[0]) && isValid(b[1]);
      if (isDateArray) {
        hasTriggerRange = true;
        return [...a, b.join(",")] as ValueType[];
      }
      if (typeof b[0] === "object") {
        return [...a, ...b] as ValueType[];
      }
      if (typeof b[0] === "string") {
        return [...a, ...b] as ValueType[];
      }
      return a;
    }, [])
    .filter(Boolean);
  return [list.length, hasTriggerRange];
};

export const convertFilterObject2Payload = (
  filterObject?: FilterSearch,
  filterOptionGroup?: FilterOptionsGroup
) => {
  if (!filterObject) return undefined;
  const {
    startIndex,
    size,
    equal: equalArray,
    range: rangeArray,
  } = filterObject;

  const filterConditionList = filterOptionGroup?.reduce<Option[]>(
    (a, b) => [...a, ...b.filterConditionList],
    []
  );

  const equalObject =
    equalArray
      ?.map(({ filterKey, value, columnId }) => {
        if (!columnId) return {};
        let equalOption;
        if (columnId)
          equalOption =
            filterConditionList?.find((el) => el.columnId === columnId) || {};
        const filterId = `${filterKey}-${equalOption.columnId}-${equalOption.filterName}`;

        return {
          [filterId]: value,
        };
      })
      .reduce((a, b) => ({ ...a, ...b }), {}) || {};

  const rangeObject =
    rangeArray
      ?.map(({ filterKey, from, to, columnId }) => {
        if (!columnId) return {};
        let rangeOption;
        if (columnId)
          rangeOption =
            filterConditionList?.find((el) => el.columnId === columnId) || {};
        const filterId = `${filterKey}-${rangeOption.columnId}-${rangeOption.filterName}`;
        return {
          [filterId]: [from, to],
        };
      })
      .reduce((a, b) => ({ ...a, ...b }), {}) || {};

  const filterOptionsObject = { ...equalObject, ...rangeObject };
  const filterValues = filterOptionGroup
    ? filterOptionGroup
        .map(({ filterConditionList }, index) => ({
          [index]: filterConditionList
            .map((option) => {
              if (option.type === "CHOICEMULTI_TEXT") {
                return {
                  [option.filterId]: option.items?.filter(({ value }) =>
                    filterOptionsObject[option.filterId]?.includes(value)
                  ),
                };
              }
              return {
                [option.filterId]: filterOptionsObject[option.filterId]
                  ? filterOptionsObject[option.filterId]
                  : optionToValueType(option, null, null),
              };
            })
            .reduce((a, b) => ({ ...a, ...b }), {}),
        }))
        .reduce((a, b) => ({ ...a, ...b }), {})
    : {};

  return {
    startIndex,
    size,
    equal: equalObject,
    range: rangeObject,
    filterValues,
  };
};

export const getSelectedColumnIds = <Data>(
  number: number,
  columns: Column<Data>[]
): string[] =>
  columns
    .slice(0, number)
    .map((el) => el.id)
    .filter((el) => el !== undefined) as string[];

export const getNextEachRowState = <Data>(
  prev: EachRowState<Data>,
  state: Partial<RowState<Data>>
) => {
  const next = { ...prev };
  const keys = Object.keys(next);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i] as string;
    next[key] = {
      ...(next[key] as RowState<Data>),
      ...state,
    };
  }
  return next;
};

export const checkedDisplayRowState = <Data>(
  prev: EachRowState<Data>,
  checked: boolean
) => {
  const next = { ...prev };
  const keys = Object.keys(next);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i] as string;
    if (next[key]?.display) {
      next[key] = {
        ...(next[key] as RowState<Data>),
        checked,
      };
    }
  }
  return next;
};
