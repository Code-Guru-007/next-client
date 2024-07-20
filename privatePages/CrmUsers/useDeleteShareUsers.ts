import { useCallback } from "react";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useReduxDialog } from "@eGroupAI/redux-modules";
import useStateRef from "@eGroupAI/hooks/useStateRef";
import { FilterSearch } from "@eGroupAI/typings/apis";
import { KeyedMutator } from "swr";
import { DIALOG as DELETE_DIALOG } from "./ConfirmDeleteShareDialog";

type UseDeleteShareUsersArgs = {
  organizationId: string;
  checkedAll: boolean;
  filterSearch?: FilterSearch;
  mutate: KeyedMutator<any>;
  targetIdList: string[];
  excludedTargetIdList?: string[];
};

export default function useDeleteShareUsers({
  organizationId,
  checkedAll,
  filterSearch,
  mutate,
  targetIdList,
  excludedTargetIdList,
}: UseDeleteShareUsersArgs) {
  const { excute: deleteOrgTargetShare, isLoading: isShareDeleting } =
    useAxiosApiWrapper(apis.org.deleteOrgTargetShare, "Delete");
  const {
    openDialog: openConfirmDeleteDialog,
    closeDialog: closeConfirmDeleteDialog,
  } = useReduxDialog(DELETE_DIALOG);
  const [selectedDeleteOrgId, setSelectedDeleteOrgId, selectedDeleteOrgIdRef] =
    useStateRef("");

  const handleSelectedDeleteOrgId = (e) => {
    setSelectedDeleteOrgId(e.target.value);
  };

  const handleDeleteShareUsers = useCallback(() => {
    openConfirmDeleteDialog({
      primary: `您確定要刪除已分享的使用者嗎？`,
      onConfirm: () => {
        if (organizationId) {
          const { startIndex, size, ...filterObject } =
            filterSearch as FilterSearch;
          deleteOrgTargetShare({
            organizationId,
            sharerOrganizationId: selectedDeleteOrgIdRef.current,
            filterObject: checkedAll ? filterObject : undefined,
            targetIdList: checkedAll ? undefined : targetIdList,
            isSelected: checkedAll ? 0 : 1,
            excludedTargetIdList,
          })
            .then(() => {
              closeConfirmDeleteDialog();
              setSelectedDeleteOrgId("");
              mutate();
            })
            .catch(() => {});
        }
      },
    });
  }, [
    checkedAll,
    closeConfirmDeleteDialog,
    deleteOrgTargetShare,
    excludedTargetIdList,
    filterSearch,
    mutate,
    openConfirmDeleteDialog,
    organizationId,
    selectedDeleteOrgIdRef,
    setSelectedDeleteOrgId,
    targetIdList,
  ]);

  return {
    handleSelectedDeleteOrgId,
    handleDeleteShareUsers,
    isShareDeleting,
    selectedDeleteOrgId,
  };
}
