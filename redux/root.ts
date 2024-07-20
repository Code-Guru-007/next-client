import { combineReducers } from "redux";
import { apis } from "@eGroupAI/redux-modules/apis";
import { dialogs } from "@eGroupAI/redux-modules/dialogs";
import { snackbars } from "@eGroupAI/redux-modules/snackbars";
import { memberOrgs } from "@eGroupAI/redux-modules/memberOrgs";
import privateLayout from "components/PrivateLayout/reducers";

// import { persistReducer } from "redux-persist";
// import storage from "redux-persist/lib/storage";
import steps from "./steps";
import froalaEditor from "./froalaEditor";
import filledUserInfo from "./filledUserInfo";
import importUsersDialog from "./importUsersDialog";
import createUserInfoFilledUrlDialog from "./createUserInfoFilledUrlDialog";
import eventDialog from "./eventDialog";
import dynamicColumns from "./dynamicColumns";
import createBulletin from "./createBulletin";
import wordLibrary from "./wordLibrary";
import articleBulletinLastUpdateTime from "./articleBulletinLastUpdateTime";

export const rootReducer = combineReducers({
  dialogs,
  snackbars,
  memberOrgs,
  apis,
  privateLayout,
  steps,
  froalaEditor,
  filledUserInfo,
  // filledUserInfo: persistReducer(
  //   {
  //     key: "filledUserInfo",
  //     storage,
  //     whitelist: ["values"],
  //   },
  //   filledUserInfo
  // ),
  eventDialog,
  importUsersDialog,
  createUserInfoFilledUrlDialog,
  dynamicColumns,
  createBulletin,
  wordLibrary,
  articleBulletinLastUpdateTime,
});

export type RootState = ReturnType<typeof rootReducer>;
