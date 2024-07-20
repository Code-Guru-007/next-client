import { Value, ValueType, Option } from "./types";

export const optionToValueType = (
  option: Option,
  defaultMinNumber: number | null,
  defaultMaxNumber: number | null
): ValueType => {
  let defaultValue: ValueType = [];
  switch (option.type) {
    case "CHOICEMULTI":
      defaultValue = [];
      break;
    case "DATETIME_RANGE":
    case "DATE_RANGE":
      defaultValue = [null, null];
      break;
    case "NUMBER_RANGE":
      defaultValue = option.items?.map((el) => Number(el.value)) || [
        defaultMinNumber,
        defaultMaxNumber,
      ];
      break;
    // deepcode ignore DuplicateCaseBody: <CHOICEMULTI_TEXT is different type from CHOICEMULTI>
    case "CHOICEMULTI_TEXT":
      defaultValue = [];
      break;
    default:
  }
  return defaultValue;
};

export const optionsToValue = (
  options: Option[],
  defaultMinNumber: number | null,
  defaultMaxNumber: number | null,
  defaultValues?: Value
): Value => {
  const value = options.reduce((a, b) => {
    const defaultValue = optionToValueType(
      b,
      defaultMinNumber,
      defaultMaxNumber
    );
    return {
      ...a,
      [b.filterId]: defaultValue,
    };
  }, {});
  return {
    ...value,
    ...defaultValues,
  };
};

// used when parse JSON string returned from uncontrolled autocomplete input for Item[]
export const parseFilterValueToDetectItemsJSONString = (filterValue: {
  [key: string]: ValueType;
}): { [key: string]: ValueType } => {
  const parsedValue = Object.keys(filterValue)
    .map((key) => {
      const value = filterValue[key];
      switch (typeof value) {
        case "string":
          try {
            const v = JSON.parse(value);
            if (typeof v === "string") return { [key]: [v] };
            if (typeof v === "number") return { [key]: [`${v}`] };
            return { [key]: v };
          } catch (err) {
            return { [key]: [value] };
          }
        case "object":
          return { [key]: value };
        // deepcode ignore DuplicateCaseBody: <default is the object and need be defined>
        default:
          return { [key]: value };
      }
    })
    .reduce((a, b) => ({ ...a, ...b }), {});
  return parsedValue;
};
