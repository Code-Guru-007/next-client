import { Condition, Results } from "../typings";

const getHasPermission = (conds: Condition[], results: Results): boolean => {
  if (conds.length === 0) {
    return false;
  }
  const ResultsMap = {
    MODULE: results.hasModulePermission,
    TARGET: results.hasMemberTargetPermission,
    MEMBER: results.hasVaildLoginIdPermission,
    ORG_OWNER: results.hasOrgOwnerPermission,
  };
  /**
   * Find first operator index.
   */
  const firstOperatorIndex = conds.findIndex(
    (el) => el === "AND" || el === "OR"
  );
  if (firstOperatorIndex === -1) {
    const val = conds[0];
    return val ? ResultsMap[val] : false;
  }
  /**
   * Find the operator prev and next value for calculate.
   */
  const tempConds = [...conds];
  const operatorFirst = tempConds[firstOperatorIndex];
  const operatorPrev = tempConds[firstOperatorIndex - 1];
  const operatorNext = tempConds[firstOperatorIndex + 1];
  if (!operatorFirst || !operatorPrev || !operatorNext) {
    return false;
  }

  /**
   * Assign first hasPermission.
   */
  let hasPermission = false;

  if (operatorFirst === "AND") {
    hasPermission = ResultsMap[operatorPrev] && ResultsMap[operatorNext];
  } else if (operatorFirst === "OR") {
    hasPermission = ResultsMap[operatorPrev] || ResultsMap[operatorNext];
  }
  tempConds.splice(firstOperatorIndex - 1, 3);

  /**
   * Assign rest hasPermission.
   */
  for (let i = 0; i < tempConds.length; i += 2) {
    const operator = tempConds[i];
    const next = tempConds[i + 1];
    if (operator && next) {
      if (operator === "AND") {
        hasPermission = hasPermission && ResultsMap[next];
      } else if (operator === "OR") {
        hasPermission = hasPermission || ResultsMap[next];
      }
    }
  }

  return hasPermission;
};

export default getHasPermission;
