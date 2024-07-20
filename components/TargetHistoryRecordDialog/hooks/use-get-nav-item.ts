// types
import { OrganizationTargetHistoryRecord } from "interfaces/entities";

// ----------------------------------------------------------------------

type Props = {
  record: OrganizationTargetHistoryRecord;
};

export default function useGetNavItem(props: Props) {
  const { record } = props;

  const titleAdded = record.targetHistoryRecordTitleAdded;
  const titleDeleted = record.targetHistoryRecordTitleDeleted;
  const contentAdded = record.targetHistoryRecordContentAdded;
  const contentDeleted = record.targetHistoryRecordContentDeleted;
  const displayName = record.updater?.memberName;

  const lastActivity = record.targetHistoryRecordCreateDate || new Date();

  const lastTitleAdded = titleAdded;
  const lastTitleDeleted = titleDeleted;
  const lastContentAdded = contentAdded;
  const lastContentDeleted = contentDeleted;

  return {
    displayName,
    lastActivity,
    lastTitleAdded,
    lastTitleDeleted,
    lastContentAdded,
    lastContentDeleted,
  };
}
