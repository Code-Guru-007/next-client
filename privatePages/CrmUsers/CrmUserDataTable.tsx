import React, { useCallback, useMemo, useState } from "react";

import PermissionValid from "components/PermissionValid";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import getDispositionFileName from "@eGroupAI/utils/getDispositionFileName";
import FileSaver from "file-saver";
import { getGlobalLocale } from "components/PrivateLayout/selectors";

import useReduxSnackbar from "@eGroupAI/redux-modules/snackbars/useReduxSnackbar";
import { SnackbarProps } from "@eGroupAI/material/Snackbar";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { SNACKBAR as GLOBAL_SNACKBAR } from "components/App";

import useIsOpen from "@eGroupAI/hooks/useIsOpen";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import useOrgUserTableFilterSearch from "utils/useOrgUserTableFilterSearch";
import useDataTableFilterColumns from "utils/useDataTableFilterColumns";
import { useSelector } from "react-redux";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import {
  EachRowState,
  useDataTable,
} from "@eGroupAI/material-module/DataTable";
import { TableRowProps } from "@eGroupAI/material/TableRow";
import { useReduxDialog } from "@eGroupAI/redux-modules";

import {
  CreateOrgSmsesApiPayload,
  OrganizationEvent,
  BatchUpdateOrgUserColumnApiPayload,
} from "interfaces/payloads";

import Paper from "@eGroupAI/material/Paper";
import Tooltip from "@eGroupAI/material/Tooltip";
import StyledSearchBar from "@eGroupAI/material-module/DataTable/StyledSearchBar";

import I18nDataTable from "components/I18nDataTable";
import CreateUserInfoFilledUrlDialog from "components/CreateUserInfoFilledUrlDialog";
import SendSmsDialog, {
  Values as SendSmsValues,
  SendSmsDialogProps,
} from "components/SendSmsDialog";
import UserInfoDialog, {
  DIALOG as USER_DIALOG,
} from "components/UserInfoDialog";
import { ServiceModuleValue, Table, SmsSendType } from "interfaces/utils";
import SendCustomSesDialog from "components/SendCustomSesDialog";
import UserDataTableRow from "components/UserDataTableRow";
import { OrganizationUser } from "interfaces/entities";
import { FilterSearch } from "@eGroupAI/typings/apis";
import SendCustomSmsDialog from "components/SendCustomSmsDialog";

import CrmUsersEventDialog, {
  DIALOG as EVENT_DIALOG,
} from "components/EventDialog";

import {
  TagAddDialog,
  TAG_ADD_DIALOG,
  TagDeleteDialog,
  TAG_DELETE_DIALOG,
} from "components/DatatableToolDialogs";

import SelectiveExportDialog, {
  DIALOG as EXPORT_DIALOG,
} from "components/SelectiveExportDialog";

import { Button, IconButton } from "@mui/material";
import Iconify from "minimal/components/iconify/iconify";
import { UserExportDialogApiPayload } from "components/SelectiveExportDialog/UserExportDialogContext";

import ImportIconButton from "./ImportIconButton";

import ShareCrmUsersDialog, {
  DIALOG as SHARE_DIALOG,
  Values as ShareCrmUsersValues,
} from "./ShareCrmUsersDialog";

import UsersDynamicInfoEditDialog from "./UsersDynamicInfoEditDialog";

import ConfirmDeleteShareDialog from "./ConfirmDeleteShareDialog";
import spliceIntoArrays from "./spliceIntoArrays";
import useDeleteShareUsers from "./useDeleteShareUsers";

function CrmUserDataTable() {
  const locale = useSelector(getGlobalLocale);
  const wordLibrary = useSelector(getWordLibrary);
  const organizationId = useSelector(getSelectedOrgId);

  const { openDialog: openUserDialog, closeDialog: closeUserDialog } =
    useReduxDialog(USER_DIALOG);
  const { openDialog: openTagDialog } = useReduxDialog(
    `${ServiceModuleValue.CRM_USER}_${TAG_ADD_DIALOG}`
  );
  const { openDialog: openTagDeleteDialog } = useReduxDialog(
    `${ServiceModuleValue.CRM_USER}_${TAG_DELETE_DIALOG}`
  );

  const { openDialog: openEventDialog, closeDialog: closeEventDialog } =
    useReduxDialog(EVENT_DIALOG);
  const { openDialog: openShareDialog, closeDialog: closeShareDialog } =
    useReduxDialog(SHARE_DIALOG);
  const { openDialog: openExportDialog, closeDialog: closeExportDialog } =
    useReduxDialog(EXPORT_DIALOG);

  const [eachRowState, setEachRowState] = useState<
    EachRowState<
      OrganizationUser & {
        TableRowProps: TableRowProps;
      }
    >
  >({});
  const [deleteState, setDeleteState] = useState<boolean>(false);
  const [checkedAll, setCheckedAll] = useState(false);
  const { openSnackbar, closeSnackbar } =
    useReduxSnackbar<SnackbarProps>(GLOBAL_SNACKBAR);

  const {
    handleChangePage,
    handleRowsPerPageChange,
    handleSearchChange,
    handleFilterValuesChange,
    handleFilterValuesSubmit,
    handleFilterValuesClear,
    handleSelectFilterView,
    payload,
    setPayload,
    submitedPayload,
    setSubmitedPayload,
    page,
    rowsPerPage,
  } = useDataTable(
    `${ServiceModuleValue.CRM_USER}-DataTable-${organizationId}`,
    {},
    {
      fromKey: "startIndex",
      enableLocalStorageCache: true,
    }
  );

  const {
    columns,
    filterConditionGroups,
    isFilterConditionGroupsValidating,
    filterSearch,
    handleFilterSubmit,
    handleFilterClear,
  } = useDataTableFilterColumns(
    Table.USERS,
    setPayload,
    payload,
    setSubmitedPayload,
    submitedPayload
  );

  const { data, isValidating, mutate } = useOrgUserTableFilterSearch(
    {
      organizationId,
    },
    filterSearch,
    undefined,
    undefined,
    !filterSearch
  );

  const { excute: createOrgSmses, isLoading: isCreatingSmses } =
    useAxiosApiWrapper(apis.org.createOrgSmses, "Create");
  const { excute: createOrgUser, isLoading: isCreatingUser } =
    useAxiosApiWrapper(apis.org.createOrgUser, "Create");
  const { excute: exportOrgUsersExcel, isLoading: isExportingBatch } =
    useAxiosApiWrapper(apis.org.exportOrgUsersExcel, "Create");
  const {
    excute: exportSelectedOrgUsersExcel,
    isLoading: isExportingBatchSelected,
  } = useAxiosApiWrapper(apis.org.exportSelectedOrgUsersExcel, "Create");
  const { excute: createOrgTargetsEvents, isLoading: isCreatingTargetsEvents } =
    useAxiosApiWrapper(apis.org.createOrgTargetsEvents, "Create");

  const { excute: createOrgTargetShare, isLoading: isCreatingTargetShare } =
    useAxiosApiWrapper(apis.org.createOrgTargetShare, "Create");

  const { excute: sendCustomSmsToAllUsers, isLoading: isSendingSmsAllUser } =
    useAxiosApiWrapper(apis.org.sendCustomSmsToAllUsers, "Create");

  const { excute: sendCustomSmsToUsers, isLoading: isSendingSmsUsers } =
    useAxiosApiWrapper(apis.org.sendCustomSmsToUsers, "Create");
  const { excute: sendCustomSesToAllUsers, isLoading: isSendingSesAllUser } =
    useAxiosApiWrapper(apis.org.sendCustomSesToAllUsers, "Create");

  const { excute: sendCustomSesToUsers, isLoading: isSendingSesUsers } =
    useAxiosApiWrapper(apis.org.sendCustomSesToUsers, "Create");
  const {
    excute: batchUpdateOrgUserColumnTarget,
    isLoading: isUpdatingUserColumn,
  } = useAxiosApiWrapper(apis.org.batchUpdateOrgUserColumnTarget, "Update");

  const [createSmsesPayload, setCreateSmsesPayload] = useState<
    Omit<
      CreateOrgSmsesApiPayload,
      "organizationId" | "organizationShareTargetType" | "filterObject"
    >
  >({
    isSelected: 0,
    smsSendType_: SmsSendType.SHARE,
    organizationSms: {
      organizationSmsSubject: "",
      organizationSmsContent: "",
      organizationShare: {
        organizationShareEditList: [],
        uploadFileTargetList: [],
        organizationFinanceTemplateList: [],
      },
    },
  });

  const {
    isOpen: isSendSmsOpen,
    handleClose: closeSendSmsDialog,
    handleOpen: openSendSmsDialog,
  } = useIsOpen(false);

  const {
    isOpen: isInfoFilledOpen,
    handleClose: closeFilledDialog,
    handleOpen: openFilledDialog,
  } = useIsOpen(false);

  const {
    isOpen: isCustomSmsOpen,
    handleClose: closeCustomSmsDialog,
    handleOpen: openCustomSmsDialog,
  } = useIsOpen(false);

  const {
    isOpen: isCustomSesOpen,
    handleClose: closeCustomSesDialog,
    handleOpen: openCustomSesDialog,
  } = useIsOpen(false);

  const {
    isOpen: isEditDialogOpen,
    handleOpen: openEditDialog,
    handleClose: closeEditDialog,
  } = useIsOpen(false);

  const selectedUsers = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => el?.checked)
        .map((el) => {
          const { TableRowProps: trp, ...other } = el?.data || {};
          return other as OrganizationUser;
        }),
    [eachRowState]
  );

  const selectedUsersIdList = useMemo(
    () => selectedUsers.map((el) => el.organizationUserId),
    [selectedUsers]
  );

  const selectedTagIdList = useMemo(
    () =>
      selectedUsers
        .filter((user) => (user?.organizationTagTargetList?.length ?? 0) > 0)
        .flatMap((user) =>
          user?.organizationTagTargetList?.map((tag) => tag?.id?.tagId)
        ),
    [selectedUsers]
  );

  const Emails = useMemo(
    () =>
      selectedUsers.reduce(
        (a, b) => ({
          ...a,
          [b.organizationUserId]: {
            organizationUserEmail: b.organizationUserEmail,
            organizationUserNameZh: b.organizationUserNameZh,
          },
        }),
        {}
      ),
    [selectedUsers]
  );

  const unSelectedUsers = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => !el?.checked)
        .map((el) => {
          const { TableRowProps: trp, ...other } = el?.data || {};
          return other as OrganizationUser;
        }),
    [eachRowState]
  );

  const excludedTargetIdList = useMemo(
    () =>
      Object.values(eachRowState)
        .filter((el) => !el?.checked)
        .map((el) => el?.data?.organizationUserId as string),
    [eachRowState]
  );

  const phoneNumbers = useMemo(
    () =>
      selectedUsers.reduce(
        (a, b) => ({
          ...a,
          [b.organizationUserId]: {
            organizationUserPhone: b.organizationUserPhone,
            organizationUserNameZh: b.organizationUserNameZh,
          },
        }),
        {}
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedUsers, isCustomSmsOpen]
  );

  const {
    handleSelectedDeleteOrgId,
    handleDeleteShareUsers,
    isShareDeleting,
    selectedDeleteOrgId,
  } = useDeleteShareUsers({
    organizationId,
    checkedAll,
    filterSearch,
    mutate,
    targetIdList: selectedUsers.map((el) => el.organizationUserId),
    excludedTargetIdList,
  });

  const tableData = useMemo(
    () =>
      !data
        ? []
        : data.source.map((el) => ({
            ...el,
            TableRowProps: {
              hover: true,
              sx: { cursor: "pointer" },
              onClick: (e) => {
                e.stopPropagation();
                window.open(`/me/crm/users/${el.organizationUserId}`, "_blank");
              },
              DataTableRowCheckboxProps: {
                onClick: (e) => {
                  e.stopPropagation();
                },
              },
            },
          })),
    [data]
  );

  const handleCheckedAllClick = useCallback(() => {
    setCheckedAll(true);
  }, []);

  const handleCheckedAllClearClick = useCallback(() => {
    setCheckedAll(false);
  }, []);

  const handleCreateOrgSmses = useCallback(
    (organizationUserList: OrganizationUser[], values: SendSmsValues) => {
      const nestArray = spliceIntoArrays(organizationUserList, 10);
      let finish = 0;
      const promises = nestArray.reduce(
        (a, b) =>
          a.then(() =>
            createOrgSmses({
              ...createSmsesPayload,
              organizationId,
              organizationShareTargetType: values.organizationShareTargetType,
              organizationSms: {
                ...createSmsesPayload.organizationSms,
                organizationSmsSubject: values.organizationSmsSubject,
                organizationSmsContent: values.organizationSmsContent,
              },
              isSelected: 1,
              smsSendType_: SmsSendType.SHARE,
              organizationUserList: b.map((el) => ({
                organizationUserId: el.organizationUserId,
                organizationUserPhone: el.organizationUserPhone as string,
              })),
            }).then(() => {
              finish += 5;
              openSnackbar({
                message: `${
                  wordLibrary?.["sending sms,please wait"] ?? "簡訊寄送中請稍候"
                }(${finish}/${organizationUserList.length})`,
                severity: "warning",
                autoHideDuration: 999999,
              });
            })
          ),
        Promise.resolve()
      );
      return promises.then(() => {
        openSnackbar({
          message: `簡訊寄送完成共${organizationUserList.length}封`,
          severity: "success",
          autoHideDuration: 4000,
        });
      });
    },
    [
      createOrgSmses,
      createSmsesPayload,
      openSnackbar,
      organizationId,
      wordLibrary,
    ]
  );

  const handleCustomSmsSubmit = async (values) => {
    try {
      if (checkedAll && selectedUsers.length === 0) {
        await sendCustomSmsToAllUsers({
          organizationId,
          filterObject: filterSearch ?? {},
          organizationSms: {
            organizationSmsSubject: values.organizationSmsSubject,
            organizationSmsContent: values.organizationSmsContent,
            organizationSmsSendDate: values.organizationSmsSendDate,
          },
        });
        closeCustomSmsDialog();
      }
      if (selectedUsers.length > 0) {
        if (values.organizationSmsSendDate)
          await sendCustomSmsToUsers({
            organizationId,
            organizationSms: {
              organizationSmsSubject: values.organizationSmsSubject,
              organizationSmsContent: values.organizationSmsContent,
              organizationSmsSendDate: values.organizationSmsSendDate,
            },
            organizationUserList: values.organizationUserList,
          });
        else
          await sendCustomSmsToUsers({
            organizationId,
            organizationSms: {
              organizationSmsSubject: values.organizationSmsSubject,
              organizationSmsContent: values.organizationSmsContent,
              organizationSmsSendDate: values.organizationSmsSendDate,
            },
            organizationUserList: values?.organizationUserList,
          });
        closeCustomSmsDialog();
      }
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: handleCustomSmsSubmit",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };
  const handleCustomSesSubmit = async (values) => {
    try {
      const organizationUserList = Object.keys(values.emails).map((key) => ({
        organizationUserId: key,
        organizationUserEmail: values.emails[key].organizationUserEmail,
      }));
      if (checkedAll && selectedUsers.length === 0) {
        await sendCustomSesToAllUsers({
          organizationId,
          filterObject: filterSearch ?? {},
          organizationSes: {
            organizationSesSubject: values.organizationSesSubject,
            organizationSesContent: values.organizationSesContent,
          },
        });
        closeCustomSesDialog();
      }
      if (selectedUsers.length > 0) {
        await sendCustomSesToUsers({
          organizationId,
          organizationSes: {
            organizationSesSubject: values.organizationSesSubject,
            organizationSesContent: values.organizationSesContent,
          },
          organizationUserList,
        });
        closeCustomSesDialog();
      }
    } catch (error) {
      apis.tools.createLog({
        function: "DatePicker: handleCustomSesSubmit",
        browserDescription: window.navigator.userAgent,
        jsonData: {
          data: error,
          deviceInfo: getDeviceInfo(),
        },
        level: "ERROR",
      });
    }
  };

  const handleSmsOnConfirm = useCallback<
    NonNullable<SendSmsDialogProps["onConfirm"]>
  >(
    async (values) => {
      if (checkedAll) {
        openSnackbar({
          message: wordLibrary?.["please wait"] ?? "請稍候",
          severity: "warning",
          autoHideDuration: 999999,
        });
        const { startIndex, size, ...filterObject } =
          filterSearch as FilterSearch;
        try {
          await createOrgSmses({
            ...createSmsesPayload,
            organizationId,
            organizationShareTargetType: values.organizationShareTargetType,
            filterObject,
            organizationSms: {
              ...createSmsesPayload.organizationSms,
              organizationSmsSubject: values.organizationSmsSubject,
              organizationSmsContent: values.organizationSmsContent,
            },
            isSelected: 0,
            smsSendType_: SmsSendType.SHARE,
            excludedTargetIdList,
          });
          closeSendSmsDialog();
          closeFilledDialog();
        } catch (error) {
          apis.tools.createLog({
            function: "DatePicker: handleSmsOnConfirm",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: error,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
        }
      } else if (!checkedAll && Object.keys(values.phoneNumbers).length > 0) {
        handleCreateOrgSmses(
          Object.keys(values.phoneNumbers).map((el) => ({
            organizationUserId: el,
            organizationUserPhone:
              values.phoneNumbers[el]?.organizationUserPhone || "",
          })),
          values
        )
          .then(() => {
            closeSendSmsDialog();
            closeFilledDialog();
          })
          .catch((err) => {
            apis.tools.createLog({
              function: "handleCreateOrgSmses: error",
              browserDescription: window.navigator.userAgent,
              jsonData: {
                data: err,
                deviceInfo: getDeviceInfo(),
              },
              level: "ERROR",
            });
          });
      }
    },
    [
      checkedAll,
      closeFilledDialog,
      closeSendSmsDialog,
      createOrgSmses,
      createSmsesPayload,
      excludedTargetIdList,
      filterSearch,
      handleCreateOrgSmses,
      openSnackbar,
      organizationId,
      wordLibrary,
    ]
  );

  const handleExportExcel = useCallback(
    (values?: Partial<UserExportDialogApiPayload>) => {
      const messageKey = "please wait";
      if (checkedAll && filterSearch) {
        openSnackbar({
          message: wordLibrary?.[messageKey] ?? "請稍後",
          severity: "warning",
          autoHideDuration: null,
        });
        const { startIndex, size, ...filterObject } =
          filterSearch as FilterSearch;
        exportOrgUsersExcel({
          organizationId,
          locale,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          filterObject,
          excludedTargetIdList,
          ...values,
        })
          .then((res) => {
            const filename = getDispositionFileName(
              res.headers["content-disposition"] as string
            );
            FileSaver.saveAs(res.data, filename);
          })
          .finally(() => {
            closeSnackbar({
              autoHideDuration: 4000,
            });
            closeExportDialog();
          })
          .catch((err) => {
            apis.tools.createLog({
              function: "DatePicker: handleExportExcel",
              browserDescription: window.navigator.userAgent,
              jsonData: {
                data: err,
                deviceInfo: getDeviceInfo(),
              },
              level: "ERROR",
            });
          });
      } else if (!checkedAll && selectedUsers.length > 0) {
        openSnackbar({
          message: wordLibrary?.[messageKey] ?? "請稍後",
          severity: "warning",
          autoHideDuration: null,
        });
        exportSelectedOrgUsersExcel({
          organizationId,
          locale,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          organizationUserList: selectedUsers,
          ...values,
        })
          .then((res) => {
            const filename = getDispositionFileName(
              res.headers["content-disposition"] as string
            );
            FileSaver.saveAs(res.data, filename);
          })
          .finally(() => {
            closeSnackbar({
              message: wordLibrary?.success ?? "成功",
              autoHideDuration: 4000,
            });
            closeExportDialog();
          })
          .catch((err) => {
            apis.tools.createLog({
              function: "DatePicker: handleExportExcel",
              browserDescription: window.navigator.userAgent,
              jsonData: {
                data: err,
                deviceInfo: getDeviceInfo(),
              },
              level: "ERROR",
            });
          });
      }
    },
    [
      checkedAll,
      filterSearch,
      selectedUsers,
      openSnackbar,
      wordLibrary,
      exportOrgUsersExcel,
      organizationId,
      locale,
      excludedTargetIdList,
      closeSnackbar,
      closeExportDialog,
      exportSelectedOrgUsersExcel,
    ]
  );

  const handleCreateOrgTargetsEvents = useCallback(
    (organizationEvent: OrganizationEvent) => {
      const nestArray = spliceIntoArrays(
        selectedUsers.map((el) => el.organizationUserId),
        10
      );
      const promises = nestArray.reduce(
        (a, b) =>
          a.then(() =>
            createOrgTargetsEvents({
              organizationId,
              isSelected: 1,
              targetIdList: b,
              organizationEvent,
            }).then(() => {})
          ),
        Promise.resolve()
      );
      return promises.then(() => {
        openSnackbar({
          message: wordLibrary?.["added successfully"] ?? "新增成功",
          severity: "success",
          autoHideDuration: 4000,
        });
      });
    },
    [
      createOrgTargetsEvents,
      openSnackbar,
      organizationId,
      selectedUsers,
      wordLibrary,
    ]
  );

  const handleConfirmEvents = useCallback(
    (organizationEvent: OrganizationEvent) => {
      if (checkedAll && unSelectedUsers.length === 0) {
        const { startIndex, size, ...filterObject } =
          filterSearch as FilterSearch;
        createOrgTargetsEvents({
          organizationId,
          isSelected: 2,
          filterObject,
          excludedTargetIdList,
          organizationEvent,
        })
          .then(() => {
            openSnackbar({
              message: wordLibrary?.["added successfully"] ?? "新增成功",
              severity: "success",
              autoHideDuration: 4000,
            });
            closeEventDialog();
          })
          .catch(() => {});
      } else if (selectedUsers.map((el) => el.organizationUserId).length > 0) {
        if (checkedAll) {
          const { startIndex, size, ...filterObject } =
            filterSearch as FilterSearch;
          createOrgTargetsEvents({
            organizationId,
            isSelected: 0,
            filterObject,
            excludedTargetIdList,
            organizationEvent,
          })
            .then(() => {
              closeEventDialog();
              openSnackbar({
                message: wordLibrary?.["added successfully"] ?? "新增成功",
                severity: "success",
                autoHideDuration: 999999,
              });
            })
            .catch(() => {});
        } else {
          handleCreateOrgTargetsEvents(organizationEvent)
            .then(() => {
              closeEventDialog();
            })
            .catch(() => {});
        }
      }
    },
    [
      checkedAll,
      unSelectedUsers.length,
      selectedUsers,
      filterSearch,
      createOrgTargetsEvents,
      organizationId,
      excludedTargetIdList,
      openSnackbar,
      closeEventDialog,
      handleCreateOrgTargetsEvents,
      wordLibrary,
    ]
  );

  const handleShareCrmUsersSubmit = useCallback(
    (value: ShareCrmUsersValues) => {
      const { memberEmail, sharerOrganizationId } = value;
      const { startIndex, size, ...filterObject } =
        filterSearch as FilterSearch;
      createOrgTargetShare({
        organizationId,
        memberEmail,
        sharerOrganizationId,
        filterObject: checkedAll ? filterObject : undefined,
        targetIdList: checkedAll
          ? undefined
          : selectedUsers.map((el) => el.organizationUserId),
        isSelected: checkedAll ? 0 : 1,
        organizationTargetRelationPermission: ["READ", "WRITE"],
        excludedTargetIdList,
      })
        .then(() => {
          closeShareDialog();
        })
        .catch(() => {});
    },
    [
      checkedAll,
      closeShareDialog,
      createOrgTargetShare,
      excludedTargetIdList,
      filterSearch,
      organizationId,
      selectedUsers,
    ]
  );

  const handleDisableToolClick = useCallback(() => {
    if (selectedUsers.length === 0) {
      openSnackbar({
        message: "請勾選資料",
        severity: "warning",
      });
    }
  }, [openSnackbar, selectedUsers.length]);

  const handleSaveDynamicInfo = useCallback(
    (payload: Omit<BatchUpdateOrgUserColumnApiPayload, "organizationId">) => {
      const { startIndex, size, ...filterObject } =
        filterSearch as FilterSearch;
      return batchUpdateOrgUserColumnTarget({
        organizationId,
        filterObject: checkedAll ? filterObject : undefined,
        targetIdList: checkedAll
          ? undefined
          : selectedUsers.map((el) => el.organizationUserId),
        isSelected: checkedAll ? 0 : 1,
        ...payload,
      })
        .then(() => "success")
        .catch((err) => {
          apis.tools.createLog({
            function: "DatePicker: handleSaveDynamicInfo",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: err,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
        });
    },
    [
      batchUpdateOrgUserColumnTarget,
      checkedAll,
      filterSearch,
      organizationId,
      selectedUsers,
    ]
  );

  const buttonTools = (
    <>
      <PermissionValid shouldBeOrgOwner modulePermissions={["CREATE"]}>
        <Button
          onClick={openUserDialog}
          variant="contained"
          startIcon={<Iconify width={15} icon="mingcute:add-line" />}
          id="table-add-button"
          data-tid="table-add-button"
        >
          {wordLibrary?.add ?? "新增"}
        </Button>
      </PermissionValid>
      <PermissionValid shouldBeOrgOwner modulePermissions={["CREATE"]}>
        <ImportIconButton />
      </PermissionValid>
    </>
  );

  const selectedToolsbar = useMemo(
    () => (
      <>
        {(checkedAll || selectedUsers.length !== 0) && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
            <Tooltip title={wordLibrary?.download ?? "下載"}>
              <div
                onClick={handleDisableToolClick}
                onKeyPress={handleDisableToolClick}
                role="button"
                tabIndex={-1}
              >
                <IconButton
                  onClick={openExportDialog}
                  disabled={
                    (!checkedAll && selectedUsers.length === 0) ||
                    (checkedAll && data?.total === excludedTargetIdList.length)
                  }
                  color="primary"
                >
                  <Iconify icon="uil:file-download" width={24} />
                </IconButton>
              </div>
            </Tooltip>
          </PermissionValid>
        )}
        {(checkedAll || selectedUsers.length !== 0) && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
            <Tooltip title="分享">
              <IconButton
                onClick={() => {
                  openShareDialog();
                }}
                disabled={
                  (!checkedAll && selectedUsers.length === 0) ||
                  (checkedAll && data?.total === excludedTargetIdList.length)
                }
                color="primary"
              >
                <Iconify icon="ic:round-share" width={24} />
              </IconButton>
            </Tooltip>
          </PermissionValid>
        )}
        {(checkedAll || selectedUsers.length !== 0) && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
            <Tooltip title="刪除分享服務對象">
              <IconButton
                onClick={handleDeleteShareUsers}
                disabled={
                  (!checkedAll && selectedUsers.length === 0) ||
                  (checkedAll && data?.total === excludedTargetIdList.length)
                }
                color="primary"
              >
                <Iconify icon="material-symbols:share-off-rounded" width={24} />
              </IconButton>
            </Tooltip>
          </PermissionValid>
        )}
        {(checkedAll || selectedUsers.length !== 0) && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
            <Tooltip title="批次建立事件">
              <div
                onClick={handleDisableToolClick}
                onKeyPress={handleDisableToolClick}
                role="button"
                tabIndex={-1}
              >
                <IconButton
                  onClick={() => {
                    openEventDialog();
                  }}
                  disabled={
                    (!checkedAll && selectedUsers.length === 0) ||
                    (checkedAll && data?.total === excludedTargetIdList.length)
                  }
                  color="primary"
                >
                  <Iconify icon="ic:round-calendar-month" width={24} />
                </IconButton>
              </div>
            </Tooltip>
          </PermissionValid>
        )}
        {(checkedAll || selectedUsers.length !== 0) && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
            <Tooltip title="批次標註服務對象">
              <div
                onClick={handleDisableToolClick}
                onKeyPress={handleDisableToolClick}
                role="button"
                tabIndex={-1}
              >
                <IconButton
                  onClick={() => {
                    openTagDialog();
                  }}
                  disabled={
                    (!checkedAll && selectedUsers.length === 0) ||
                    (checkedAll && data?.total === excludedTargetIdList.length)
                  }
                  color="primary"
                >
                  <Iconify icon="ic:round-local-offer" width={24} />
                </IconButton>
              </div>
            </Tooltip>
          </PermissionValid>
        )}
        {(checkedAll || selectedUsers.length !== 0) &&
          selectedTagIdList.length !== 0 && (
            <PermissionValid
              shouldBeOrgOwner
              modulePermissions={["DELETE_ALL"]}
            >
              <Tooltip
                title={wordLibrary?.["batch tagging delete"] ?? "批次標註刪除"}
              >
                <div
                  onClick={handleDisableToolClick}
                  onKeyPress={handleDisableToolClick}
                  role="button"
                  tabIndex={-1}
                >
                  <IconButton
                    onClick={() => {
                      openTagDeleteDialog();
                    }}
                    disabled={
                      (!checkedAll && selectedUsers.length === 0) ||
                      (checkedAll &&
                        data?.total === excludedTargetIdList.length)
                    }
                    color="primary"
                  >
                    <Iconify icon="mdi:tag-off" width={24} />
                  </IconButton>
                </div>
              </Tooltip>
            </PermissionValid>
          )}
        {(checkedAll || selectedUsers.length !== 0) && (
          <Tooltip title="批次寄送簡訊(含分享連結)">
            <div
              onClick={handleDisableToolClick}
              onKeyPress={handleDisableToolClick}
              role="button"
              tabIndex={-1}
            >
              <IconButton
                onClick={openFilledDialog}
                disabled={
                  (!checkedAll && selectedUsers.length === 0) ||
                  (checkedAll && data?.total === excludedTargetIdList.length)
                }
                color="primary"
              >
                <Iconify icon="ic:round-folder-shared" width={24} />
              </IconButton>
            </div>
          </Tooltip>
        )}
        {(checkedAll || selectedUsers.length !== 0) && (
          <Tooltip title="批次寄送簡訊">
            <div
              onClick={handleDisableToolClick}
              onKeyPress={handleDisableToolClick}
              role="button"
              tabIndex={-1}
            >
              <IconButton
                onClick={openCustomSmsDialog}
                disabled={
                  (!checkedAll && selectedUsers.length === 0) ||
                  (checkedAll && data?.total === excludedTargetIdList.length)
                }
                color="primary"
              >
                <Iconify
                  icon="material-symbols:send-to-mobile-rounded"
                  width={24}
                />
              </IconButton>
            </div>
          </Tooltip>
        )}
        {(checkedAll || selectedUsers.length !== 0) && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
            <Tooltip title="發送自定義Email">
              <div
                onClick={handleDisableToolClick}
                onKeyPress={handleDisableToolClick}
                role="button"
                tabIndex={-1}
              >
                <IconButton
                  onClick={() => {
                    openCustomSesDialog();
                  }}
                  disabled={
                    (!checkedAll && selectedUsers.length === 0) ||
                    (checkedAll && data?.total === excludedTargetIdList.length)
                  }
                  color="primary"
                >
                  <Iconify
                    icon="material-symbols:forward-to-inbox-rounded"
                    width={24}
                  />
                </IconButton>
              </div>
            </Tooltip>
          </PermissionValid>
        )}
        {(checkedAll || selectedUsers.length !== 0) && (
          <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
            <Tooltip title="批次編輯動態欄位">
              <div
                onClick={handleDisableToolClick}
                onKeyPress={handleDisableToolClick}
                role="button"
                tabIndex={-1}
              >
                <IconButton
                  onClick={() => {
                    openEditDialog();
                  }}
                  disabled={
                    (!checkedAll && selectedUsers.length === 0) ||
                    (checkedAll && data?.total === excludedTargetIdList.length)
                  }
                  color="primary"
                >
                  <Iconify
                    icon="material-symbols:edit-note-rounded"
                    width={28}
                  />
                </IconButton>
              </div>
            </Tooltip>
          </PermissionValid>
        )}
      </>
    ),
    [
      selectedTagIdList,
      checkedAll,
      selectedUsers.length,
      wordLibrary,
      handleDisableToolClick,
      openExportDialog,
      data?.total,
      excludedTargetIdList.length,
      handleDeleteShareUsers,
      openFilledDialog,
      openCustomSmsDialog,
      openShareDialog,
      openEventDialog,
      openTagDialog,
      openTagDeleteDialog,
      openCustomSesDialog,
      openEditDialog,
    ]
  );

  return (
    <>
      <UserInfoDialog
        onConfirm={(p) => {
          createOrgUser({
            organizationId,
            ...p,
          })
            .then(() => {
              mutate();
              closeUserDialog();
            })
            .catch(() => {});
        }}
        loading={isCreatingUser}
      />
      <PermissionValid shouldBeOrgOwner modulePermissions={["UPDATE_ALL"]}>
        <SelectiveExportDialog
          handleExport={handleExportExcel}
          loading={isExportingBatch || isExportingBatchSelected}
          serviceModuleValue={ServiceModuleValue.CRM_USER}
        />
      </PermissionValid>
      {filterSearch && (
        <TagAddDialog
          filterSearch={filterSearch}
          tableModule={Table.USERS}
          serviceModuleValue={ServiceModuleValue.CRM_USER}
          isCheckedAllPageRows={checkedAll}
          selectedTargetIds={selectedUsersIdList}
          excludeSelectedTargetIds={excludedTargetIdList}
          onSuccess={() => {
            mutate();
          }}
        />
      )}
      {filterSearch && (
        <TagDeleteDialog
          filterSearch={filterSearch}
          tableModule={Table.USERS}
          serviceModuleValue={ServiceModuleValue.CRM_USER}
          isCheckedAllPageRows={checkedAll}
          selectedTargetIds={selectedUsersIdList}
          excludeSelectedTargetIds={excludedTargetIdList}
          onSuccess={() => {
            setDeleteState(true);
            mutate();
          }}
          selectedTagIdList={checkedAll ? undefined : selectedTagIdList}
        />
      )}
      <UsersDynamicInfoEditDialog
        isOpen={isEditDialogOpen}
        organizationId={organizationId}
        selectedUsers={selectedUsers}
        onClose={closeEditDialog}
        onConfirm={handleSaveDynamicInfo}
        isUpdating={isUpdatingUserColumn}
      />
      <CreateUserInfoFilledUrlDialog
        onSubmit={(values) => {
          setCreateSmsesPayload((v) => ({
            ...v,
            organizationSms: {
              ...v.organizationSms,
              organizationShare: {
                ...values,
              },
            },
          }));
          openSendSmsDialog();
        }}
        open={isInfoFilledOpen}
        closeDialog={closeFilledDialog}
      />
      <SendSmsDialog
        loading={isCreatingSmses}
        open={isSendSmsOpen}
        closeDialog={closeSendSmsDialog}
        phoneNumbers={phoneNumbers}
        onConfirm={handleSmsOnConfirm}
      />
      <CrmUsersEventDialog
        organizationId={organizationId}
        onSubmit={(values) => {
          if (values)
            handleConfirmEvents({
              organizationEventTitle: values.organizationEventTitle || "",
              organizationEventDescription:
                values.organizationEventDescription || "",
              organizationEventAddress: values.organizationEventAddress || "",
              organizationEventStartDate:
                values.organizationEventStartDate || "",
              organizationEventEndDate: values.organizationEventEndDate || "",
              uploadFileList: values.uploadFileList?.length
                ? values.uploadFileList.map((el) => ({
                    uploadFileId: el.uploadFileId,
                  }))
                : undefined,
              organizationMemberList: values.organizationMemberList?.length
                ? values.organizationMemberList.map((el) => ({
                    member: {
                      loginId: el.member.loginId,
                    },
                  }))
                : undefined,
              organizationTagList: values.organizationTagList?.length
                ? values.organizationTagList.map((el) => ({
                    tagId: el.tagId,
                  }))
                : undefined,
              organizationPartnerList: values.organizationPartnerList?.length
                ? values.organizationPartnerList.map((el) => ({
                    organizationPartnerId: el.organizationPartnerId,
                  }))
                : undefined,
            });
        }}
        loading={isCreatingTargetsEvents}
      />
      <ShareCrmUsersDialog
        onSubmit={handleShareCrmUsersSubmit}
        loading={isCreatingTargetShare}
      />
      <ConfirmDeleteShareDialog
        onChange={handleSelectedDeleteOrgId}
        value={selectedDeleteOrgId}
        loading={isShareDeleting}
      />
      <SendCustomSmsDialog
        loading={isSendingSmsAllUser || isSendingSmsUsers}
        open={isCustomSmsOpen}
        closeDialog={closeCustomSmsDialog}
        isCheckedAllPageRows={checkedAll}
        phoneNumbers={phoneNumbers}
        onConfirm={handleCustomSmsSubmit}
        totalChecked={
          checkedAll && data
            ? data.total - excludedTargetIdList.length
            : selectedUsers.length
        }
      />
      <SendCustomSesDialog
        loading={isSendingSesAllUser || isSendingSesUsers}
        open={isCustomSesOpen}
        closeDialog={closeCustomSesDialog}
        emails={Emails}
        isCheckedAllPageRows={checkedAll}
        totalChecked={
          checkedAll && data
            ? data.total - excludedTargetIdList.length
            : selectedUsers.length
        }
        onConfirm={handleCustomSesSubmit}
      />
      <Paper>
        <I18nDataTable
          columns={columns}
          rowKey="organizationUserId"
          data={tableData}
          sx={{
            "&.MuiEgDataTable-table .MuiTableCell-root": {
              padding: "16px 8px",
            },
          }}
          renderDataRow={(rowData) => {
            const row = rowData as OrganizationUser;

            return (
              <UserDataTableRow
                columns={columns}
                row={row}
                key={row.organizationUserId}
                handleClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `/me/crm/users/${row.organizationUserId}`,
                    "_blank"
                  );
                }}
              />
            );
          }}
          enableRowCheckbox
          onEachRowStateChange={(state) => {
            setEachRowState(state);
          }}
          isEmpty={data?.total === 0}
          serverSide
          loading={
            isValidating || isFilterConditionGroupsValidating || !filterSearch
          }
          MuiTablePaginationProps={{
            count: data?.total ?? 0,
            page,
            rowsPerPage,
            onPageChange: handleChangePage,
            onRowsPerPageChange: handleRowsPerPageChange,
          }}
          enableReportTool
          buttonTools={buttonTools}
          selectedToolsbar={selectedToolsbar}
          payload={payload}
          filterSearch={filterSearch}
          serviceModuleValue={ServiceModuleValue.CRM_USER}
          onFilterViewSelect={handleSelectFilterView}
          enableFilter
          filterConditionGroups={filterConditionGroups}
          onFilterValuesChange={handleFilterValuesChange}
          onFilterValuesSubmit={handleFilterValuesSubmit}
          onFilterValuesClear={handleFilterValuesClear}
          filterValues={payload.filterValues}
          onSortLabelClick={(sortKey, order) => {
            setPayload((p) => ({
              ...p,
              sort: {
                sortKey,
                order: order.toUpperCase(),
              },
            }));
          }}
          onCheckedAllClick={handleCheckedAllClick}
          onCheckedAllClearClick={handleCheckedAllClearClick}
          FilterDropDownProps={{
            onSubmit: handleFilterSubmit,
            onClear: handleFilterClear,
          }}
          searchBar={
            <StyledSearchBar
              handleSearchChange={handleSearchChange}
              value={payload.query}
              placeholder={
                wordLibrary?.["search and press Enter"] ?? "搜尋並按Enter"
              }
            />
          }
          deleteState={deleteState}
          setDeleteState={setDeleteState}
        />
      </Paper>
    </>
  );
}

export default CrmUserDataTable;
