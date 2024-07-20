import getIn from "@eGroupAI/utils/getIn";

export const getApiLoadingStates = (state: any) => getIn(state, ["apis"]);
