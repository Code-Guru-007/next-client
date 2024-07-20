import { RootState } from "../root";

export const getLastUpdateTime = (state: RootState) =>
  state.articleBulletinLastUpdateTime.lastUpdateTime;
