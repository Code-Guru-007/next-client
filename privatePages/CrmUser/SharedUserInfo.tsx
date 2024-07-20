import React, { FC, useMemo, useState, useEffect, useCallback } from "react";

import { ServiceModuleValue, Table } from "interfaces/utils";
import { useRouter } from "next/router";
import Stack from "@mui/material/Stack";
import ListItemText from "@mui/material/ListItemText";
// import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useReduxDialog } from "@eGroupAI/redux-modules/dialogs";
import { useSelector } from "react-redux";
import { OrganizationUser } from "interfaces/entities";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import useOrgUser from "utils/useOrgUser";

import useStaticColumns from "utils/useStaticColumns";

import Grid from "@eGroupAI/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import { makeStyles } from "@mui/styles";
import DynamicFieldWithAction from "components/DynamicField/DynamicFieldWithAction";

import clsx from "clsx";

import { UpdateOrgUserApiPayload } from "interfaces/payloads";
import useUpdateUserApiPayload from "utils/useUpdateUserApiPayload";
import TagAutocompleteWithAction from "components/TagAutocompleteWithAction";
import useOrgTagsByGroups from "utils/useOrgTagsByGroups";
import useOrgTagGroups from "utils/useOrgTagGroups";
import InfoHistoryDialog, {
  DIALOG as HISTORY_DIALOG,
  RecordTarget,
} from "components/InfoHistoryDialog";
import { useSettingsContext } from "minimal/components/settings";
import { getWordLibrary } from "redux/wordLibrary/selectors";

const useStyles = makeStyles(() => ({
  editSectionContainer: {
    borderRadius: 0,
    boxShadow: "none",
    marginBottom: 0,
    borderBottom: "1px solid #EEEEEE",
  },
  headerEditSectionContainer: {
    borderRadius: 0,
    boxShadow: "none",
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    display: "none",
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 999,
  },
  showLoader: {
    display: "flex",
  },
  lightOpacity: {
    background: "rgba(255,255,255,0.6)",
  },
  darkOpacity: {
    background: "rgba(33, 43, 54, 0.6)",
  },
}));

export type OptionType = {
  optionId: string;
  label: string;
  value: string;
};

export interface SharedUserInfoProps {
  orgUser?: OrganizationUser;
  sharedOrgId?: string;
  readable?: boolean;
  writable?: boolean;
  deletable?: boolean;
}

const SharedUserInfo: FC<SharedUserInfoProps> = function (props) {
  const wordLibrary = useSelector(getWordLibrary);
  const {
    orgUser,
    sharedOrgId,
    readable = false,
    writable = false,
    deletable = false,
  } = props;
  const [mutableOrgUser, setMutableOrgUser] = useState<
    OrganizationUser | undefined
  >(orgUser);

  const classes = useStyles();
  const settings = useSettingsContext();
  const router = useRouter();

  // const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);

  const { excute: createOrgTargetTags, isLoading: isTagCreating } =
    useAxiosApiWrapper(apis.org.createOrgTargetTags, "Create");
  const { excute: deleteOrgTargetTag, isLoading: isTagDeleting } =
    useAxiosApiWrapper(apis.org.deleteOrgTargetTag, "Delete");

  const { data: updatedOrgUser, isValidating } = useOrgUser(
    {
      organizationId: sharedOrgId as string,
      organizationUserId: router.query.userId as string,
    },
    {
      locale,
    }
  );

  useEffect(() => {
    setMutableOrgUser(updatedOrgUser);
  }, [updatedOrgUser]);

  const columns = useStaticColumns(Table.USERS, "isEdit", sharedOrgId);
  const getUpdatePayload = useUpdateUserApiPayload(
    mutableOrgUser?.dynamicColumnTargetList
  );

  const [dynamicOptions, setDynamicOptions] = useState<{
    [name: string]: OptionType[] | undefined;
  }>({});

  useEffect(() => {
    columns?.map((el) => {
      const { columnType } = el;
      if (el.sortKey && columnType) {
        const elOption = el.keyValueMap
          ? Object.keys(el.keyValueMap).map((key) => ({
              optionId: key,
              label: key,
              value: el.keyValueMap ? el.keyValueMap[key] || "" : "",
            }))
          : undefined;

        setDynamicOptions((prev) => ({
          ...prev,
          [el?.sortKey as string]: elOption,
        }));
      }
      return null;
    });
  }, [columns]);

  const { openDialog: openHistoryDialog } = useReduxDialog(HISTORY_DIALOG);

  const [recordTarget, setRecordTarget] = useState<RecordTarget>({});

  const { excute: updateOrgUser } = useAxiosApiWrapper(
    apis.org.updateOrgUser,
    "Update"
  );

  const matchMutate = useSwrMatchMutate();

  const { data } = useOrgTagGroups(
    {
      organizationId: sharedOrgId,
    },
    {
      locale,
      serviceModuleValue: ServiceModuleValue.CRM_USER,
    }
  );
  const tags = useOrgTagsByGroups(data?.source);

  const handleTagAdded = async (p) => {
    createOrgTargetTags(p)
      .then(() => {
        matchMutate(
          new RegExp(
            `^/organizations/${sharedOrgId as string}/users/${
              mutableOrgUser?.organizationUserId
            }\\?`,
            "g"
          )
        );
      })
      .catch(() => {});
  };

  const handleTagDeleted = async (p) => {
    deleteOrgTargetTag(p)
      .then(() => {
        matchMutate(
          new RegExp(
            `^/organizations/${sharedOrgId as string}/users/${
              mutableOrgUser?.organizationUserId
            }\\?`,
            "g"
          )
        );
      })
      .catch(() => {});
  };

  const defaultValues = useMemo(() => {
    if (!mutableOrgUser) return {};
    const dynamics = mutableOrgUser.dynamicColumnTargetList?.reduce(
      (a, b) => ({
        ...a,
        [b.organizationColumn.columnId]: b.columnTargetValue,
      }),
      {}
    );
    return {
      organizationUserAddress: mutableOrgUser.organizationUserAddress || "",
      organizationUserArea: mutableOrgUser.organizationUserArea || "",
      organizationUserCity: mutableOrgUser.organizationUserCity || "",
      organizationUserEmail: mutableOrgUser.organizationUserEmail || "",
      organizationUserGender: mutableOrgUser.organizationUserGender
        ? String(mutableOrgUser.organizationUserGender)
        : undefined,
      organizationUserIdCardNumber:
        mutableOrgUser.organizationUserIdCardNumber || "",
      organizationUserNameZh: mutableOrgUser.organizationUserNameZh || "",
      organizationUserNameEn: mutableOrgUser.organizationUserNameEn || "",
      organizationUserPhone: mutableOrgUser.organizationUserPhone || "",
      organizationUserZIPCode: mutableOrgUser.organizationUserZIPCode || "",
      organizationUserBirth: mutableOrgUser.organizationUserBirth || "",
      ...dynamics,
    };
  }, [mutableOrgUser]);

  const [values, setValues] = useState(defaultValues);

  useEffect(() => {
    setValues(defaultValues);
  }, [defaultValues]);

  const handleClickHistory = (r?: RecordTarget) => {
    if (r) {
      setRecordTarget(r);
      openHistoryDialog();
    }
  };

  const handleSaveValue = useCallback(
    (name, newValue, remarkValues) => {
      let payload: Omit<
        UpdateOrgUserApiPayload,
        "organizationId" | "organizationUserId"
      >;
      if (mutableOrgUser) {
        payload = getUpdatePayload(
          { [name]: newValue.value },
          defaultValues,
          newValue.targetId,
          {
            [name]: remarkValues,
          },
          mutableOrgUser.organizationUserId
        );
      } else {
        payload = getUpdatePayload(
          { [name]: newValue.value },
          defaultValues,
          newValue.targetId,
          {
            [name]: remarkValues,
          }
        );
      }

      if (mutableOrgUser) {
        return updateOrgUser({
          organizationId: sharedOrgId as string,
          organizationUserId: mutableOrgUser.organizationUserId,
          ...payload,
        })
          .then(() => {
            matchMutate(
              new RegExp(
                `^/organizations/${sharedOrgId as string}/users/${
                  mutableOrgUser.organizationUserId
                }\\?`,
                "g"
              )
            );
            setValues((prev) => ({
              ...prev,
              [name]: newValue.value,
            }));
            return "success";
          })
          .catch((err) => {
            apis.tools.createLog({
              function: "updateOrgUser: error",
              browserDescription: window.navigator.userAgent,
              jsonData: {
                data: err,
                deviceInfo: getDeviceInfo(),
              },
              level: "ERROR",
            });
          });
      }
      return undefined;
    },
    [
      mutableOrgUser,
      getUpdatePayload,
      defaultValues,
      updateOrgUser,
      sharedOrgId,
      matchMutate,
    ]
  );

  const renderContent = useCallback(() => {
    if (!columns || !mutableOrgUser) return undefined;
    return columns.map((el) => (
      <Grid item xs={12} key={el.id}>
        <Stack direction="column">
          <ListItemText
            primaryTypographyProps={{
              typography: "body2",
              color: "text.secondary",
              mb: 0.5,
            }}
          >
            {wordLibrary?.[el.columnName] ?? el.columnName}
            {el.isEditFix === 1 ? (
              <span style={{ color: "red" }}> *</span>
            ) : undefined}
          </ListItemText>
          <DynamicFieldWithAction
            value={values[el.sortKey as string]}
            name={el.sortKey as string}
            // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-non-null-assertion
            columnType={el.columnType!}
            options={dynamicOptions[el.sortKey as string]}
            format={el.format}
            label={el.columnName}
            boldText
            handleClickHistory={handleClickHistory}
            handleChange={handleSaveValue}
            readable={readable}
            writable={writable}
            deletable={deletable}
          />
        </Stack>
      </Grid>
    ));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, dynamicOptions, mutableOrgUser, values]);

  return (
    <>
      {mutableOrgUser && (
        <InfoHistoryDialog
          targetId={mutableOrgUser.organizationUserId}
          recordTarget={recordTarget}
        />
      )}
      <EditSection
        sx={{ marginBottom: 2 }}
        className={classes.editSectionContainer}
      >
        {mutableOrgUser && (
          <TagAutocompleteWithAction
            targetId={mutableOrgUser.organizationUserId}
            selectedTags={
              mutableOrgUser.organizationTagTargetList?.map(
                (el) => el.organizationTag
              ) || []
            }
            options={tags || []}
            writable={writable}
            deletable={deletable}
            sharedOrgId={sharedOrgId}
            onAddTag={handleTagAdded}
            onRemoveTag={handleTagDeleted}
            isLoading={isTagCreating || isTagDeleting}
          />
        )}
      </EditSection>
      <EditSection className={classes.headerEditSectionContainer}>
        <EditSectionHeader
          primary={
            wordLibrary?.["service recipient information"] ?? "服務對象資訊"
          }
        />
        <Grid container spacing={2} position="relative">
          <div
            className={clsx(
              classes.loader,
              isValidating && classes.showLoader,
              {
                [classes.lightOpacity]: settings.themeMode === "light",
                [classes.darkOpacity]: settings.themeMode !== "light",
              }
            )}
          >
            <CircularProgress />
          </div>
          {renderContent()}
        </Grid>
      </EditSection>
    </>
  );
};

export default SharedUserInfo;
