import { RootState } from "redux/root";

export const getBulletin = (state: RootState) => state.createBulletin.values;
export const getBulletinId = (state: RootState) =>
  state.createBulletin.values.bulletinId;
