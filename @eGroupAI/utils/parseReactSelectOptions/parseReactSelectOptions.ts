import getIn from "../getIn";

/**
 * Parse react options for react select.
 * @Deprecated
 */
export default function parseReactSelectOptions(options) {
  const { labelPath = [], valuePath = [], options: selectOptions } = options;
  return selectOptions.map((el) => ({
    ...el,
    label: getIn(el, labelPath),
    value: getIn(el, valuePath),
  }));
}
