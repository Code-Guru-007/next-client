import React, {
  FC,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import { Table } from "interfaces/utils";
import { useRouter } from "next/router";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import apis from "utils/apis";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { OrganizationUser } from "interfaces/entities";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import useOrgUser from "utils/useOrgUser";
import parseDynamicColumnValue from "utils/parseDynamicColumnValue";

import useStaticColumns from "utils/useStaticColumns";

import Box from "@eGroupAI/material/Box";
import Typography from "@eGroupAI/material/Typography";
import Grid from "@eGroupAI/material/Grid";
import EditSection from "components/EditSection";
import EditSectionHeader from "components/EditSectionHeader";
import { makeStyles } from "@mui/styles";
import DynamicFieldWithAction from "components/DynamicField/DynamicFieldWithAction";
import GroupLabel from "components/GroupLabel";

import clsx from "clsx";

import { UpdateOrgUserApiPayload } from "interfaces/payloads";
import getOrgColumnGroupByGroup from "utils/getOrgColumnsGroupByGroup";
import useUpdateUserApiPayload from "utils/useUpdateUserApiPayload";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import { ColumnType } from "@eGroupAI/typings/apis";

const useStyles = makeStyles(() => ({
  textField: {
    display: "flex",
    marginRight: 2,
    wordBreak: "break-word",
    "& .MuiTypography-root": {
      fontSize: "15px",
      zIndex: 1,
    },
  },
  textTitle: {
    padding: "8px 0 8px 0",
  },
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
  hiddenContainer: {
    display: "none",
  },
}));

export type OptionType = {
  optionId: string;
  label: string;
  value: string;
};

export interface UserInfoPreviewProps {
  orgUser?: OrganizationUser;
  previewValue?: Omit<
    UpdateOrgUserApiPayload,
    "organizationId" | "organizationUserId"
  >;
  readable?: boolean;
  isPreview: boolean;
}

const UserInfoPreview: FC<UserInfoPreviewProps> = function (props) {
  const { orgUser, readable = false, previewValue, isPreview } = props;
  const [mutableOrgUser, setMutableOrgUser] = useState<
    OrganizationUser | undefined
  >(orgUser);

  const classes = useStyles();
  const router = useRouter();

  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const organizationUserId = router.query.userId as string;
  const contentRef = useRef<HTMLDivElement>(null);

  const [preVal, setPreVal] =
    useState<
      Omit<UpdateOrgUserApiPayload, "organizationId" | "organizationUserId">
    >();

  useEffect(() => {
    setPreVal(previewValue);
  }, [previewValue]);

  const { data: updatedOrgUser } = useOrgUser(
    {
      organizationId,
      organizationUserId,
    },
    {
      locale,
    }
  );
  useEffect(() => {
    setMutableOrgUser(updatedOrgUser);
  }, [updatedOrgUser]);

  const columns = useStaticColumns(Table.USERS, "isEdit", organizationId);
  const { data: orgColumns } = useOrgDynamicColumns(
    {
      organizationId,
    },
    {
      columnTable: "ORGANIZATION_USER",
    }
  );
  const getUpdatePayload = useUpdateUserApiPayload(
    mutableOrgUser?.dynamicColumnTargetList,
    orgColumns?.source
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

    orgColumns?.source.map((el) => {
      const elOption = el.organizationOptionList?.map((o) => ({
        optionId: o.organizationOptionId,
        label: o.organizationOptionName,
        value: o.organizationOptionName,
      }));

      setDynamicOptions((prev) => ({
        ...prev,
        [el.columnId]: elOption,
      }));
      return null;
    });
  }, [orgColumns?.source, columns]);

  const { excute: updateOrgUser } = useAxiosApiWrapper(
    apis.org.updateOrgUser,
    "Update"
  );

  const matchMutate = useSwrMatchMutate();
  const wordLibrary = useSelector(getWordLibrary);
  const [shouldMutate, setShouldMutate] = useState<boolean>(false);

  const handleMutate = useCallback(() => {
    if (shouldMutate) {
      matchMutate(
        new RegExp(
          `^/organizations/${organizationId}/users/${organizationUserId}\\?`,
          "g"
        )
      );
      setShouldMutate(false);
    }
  }, [matchMutate, organizationId, organizationUserId, shouldMutate]);

  const orgColumnsGroupByGroup = useMemo(
    () => getOrgColumnGroupByGroup(orgColumns?.source),
    [orgColumns?.source]
  );

  useEffect(() => {
    if (shouldMutate) {
      handleMutate();
    }
  }, [handleMutate, shouldMutate]);

  const defaultValues = useMemo(() => {
    if (!mutableOrgUser) return {};
    const dynamics = mutableOrgUser.dynamicColumnTargetList?.reduce((a, b) => {
      const uploadFileName = mutableOrgUser.uploadFileList?.find(
        (el) => el.uploadFileId === b.columnTargetValue
      )?.uploadFileName;
      return {
        ...a,
        [b.organizationColumn.columnId]: { ...b, uploadFileName },
      };
    }, {});
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

  const handleSaveValue = useCallback(
    (name, newValues, remarkValues) => {
      let payload: Omit<
        UpdateOrgUserApiPayload,
        "organizationId" | "organizationUserId"
      >;
      if (mutableOrgUser) {
        payload = getUpdatePayload(
          {
            [name]: typeof newValues === "object" ? newValues.value : newValues,
          },
          defaultValues,
          newValues.targetId,
          {
            [name]: remarkValues,
          },
          organizationUserId
        );
      } else {
        payload = getUpdatePayload(
          {
            [name]: typeof newValues === "object" ? newValues.value : newValues,
          },
          defaultValues,
          newValues.targetId,
          {
            [name]: remarkValues,
          }
        );
      }

      if (mutableOrgUser) {
        return updateOrgUser({
          organizationId,
          organizationUserId,
          ...payload,
        })
          .then(() => {
            setShouldMutate(true);
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
      organizationUserId,
      updateOrgUser,
      organizationId,
    ]
  );

  const renderStaticColumnContents = useCallback(() => {
    if (!preVal) return undefined;
    const staticColumns = (key, label) => (
      <Grid item xs={12} key={key}>
        <Box display="flex" alignItems="center" className={classes.textField}>
          <Typography variant="body1" className={classes.textTitle}>
            {label} :{" "}
          </Typography>
          {key === "organizationUserGender" ? (
            <DynamicFieldWithAction
              value={preVal[key] === "1" ? "男" : "女"}
              name={key}
              columnType={ColumnType.TEXT}
              label={label}
              boldText
              handleChange={handleSaveValue}
              readable={readable}
            />
          ) : (
            <DynamicFieldWithAction
              value={preVal[key]}
              name={key}
              columnType={ColumnType.TEXT}
              label={label}
              boldText
              handleChange={handleSaveValue}
              readable={readable}
            />
          )}
        </Box>
      </Grid>
    );

    return Object.keys(preVal).map((key) => {
      switch (key) {
        case "organizationUserNameZh":
          return staticColumns(
            key,
            wordLibrary?.["chinese name"] ?? "中文姓名"
          );
        case "organizationUserNameEn":
          return staticColumns(
            key,
            `${wordLibrary?.["english name"] ?? "英文姓名"}`
          );
        case "organizationUserPhone":
          return staticColumns(key, "聯絡電話");
        case "organizationUserEmail":
          return staticColumns(key, "電子郵件");
        case "organizationUserGender":
          return staticColumns(key, "性別");
        case "organizationUserZIPCode":
          return staticColumns(
            key,
            `${wordLibrary?.["postal code"] ?? "郵遞區號"}`
          );
        case "organizationUserCity":
          return staticColumns(key, "城市");
        case "organizationUserArea":
          return staticColumns(key, `${wordLibrary?.region ?? "地區"}`);
        case "organizationUserAddress":
          return staticColumns(key, `${wordLibrary?.address ?? "地址"}`);
        case "organizationUserIdCardNumber":
          return staticColumns(
            key,
            `${wordLibrary?.["id number"] ?? "身份證字號"}`
          );
        case "organizationUserBirth":
          return staticColumns(key, "生日");
        default:
          return undefined;
      }
    });
  }, [
    classes.textField,
    classes.textTitle,
    handleSaveValue,
    preVal,
    readable,
    wordLibrary,
  ]);

  const renderDynamicColumnContents = useCallback(
    () =>
      Object.keys(orgColumnsGroupByGroup).map((key) => (
        <>
          <React.Fragment key={key}>
            {key !== "none" && (
              <Grid item xs={12}>
                <GroupLabel
                  label={
                    orgColumnsGroupByGroup[key][0].organizationColumnGroup
                      ?.columnGroupName
                  }
                />
              </Grid>
            )}
            {orgColumnsGroupByGroup[key]?.map((el) =>
              (preVal?.dynamicColumnTargetList || [])
                .filter(
                  (pre) => pre.organizationColumn.columnId === el.columnId
                )
                .map((d) => (
                  <Grid item xs={12} key={el.columnId}>
                    <Box
                      display="flex"
                      alignItems="center"
                      className={classes.textField}
                    >
                      <Typography
                        variant="body1"
                        className={clsx(classes.textTitle, "dynamicField")}
                      >
                        {wordLibrary?.[el.columnName] ?? el.columnName}
                        {el.isRequired ? (
                          <>
                            <span style={{ color: "red" }}> *</span>
                            <span> : </span>
                          </>
                        ) : (
                          ": "
                        )}
                      </Typography>
                      <DynamicFieldWithAction
                        value={d.columnTargetValue}
                        name={el.columnId}
                        columnType={el.columnType}
                        isRelatedServiceModule={Boolean(
                          el.isRelatedServiceModule
                        )}
                        columnTargetRelatedTargetId={d.columnTargetId}
                        columnRelatedServiceModuleValue={
                          el.columnRelatedServiceModuleValue
                        }
                        label={`${el.columnName}`}
                        options={dynamicOptions[el.columnId]}
                        format={(value) =>
                          parseDynamicColumnValue(
                            el.columnType,
                            value as string
                          )
                        }
                        boldText
                        handleChange={handleSaveValue}
                        readable={readable}
                        isEditor={el.isEditor === 1}
                        hasValidator={el.hasValidator === 1}
                        validator={el.columnValidatorRegex}
                        hasRemark={el.hasValueRemark === 1}
                        requiredRemark={el.isRequiredValueRemark === 1}
                        numberUnit={el.columnNumberUnit}
                        numberDecimal={el.columnNumberOfDecimal}
                        remarkList={d ? d.columnTargetValueRemarkList : []}
                        uploadFile={(mutableOrgUser?.uploadFileList || []).find(
                          (li) => li.uploadFileId === d?.columnTargetValue
                        )}
                        required={el.isRequired === 1}
                        isUniqueValue={el.isUniqueValue}
                      />
                    </Box>
                  </Grid>
                ))
            )}
          </React.Fragment>
        </>
      )),
    [
      classes.textField,
      classes.textTitle,
      dynamicOptions,
      handleSaveValue,
      mutableOrgUser?.uploadFileList,
      orgColumnsGroupByGroup,
      preVal?.dynamicColumnTargetList,
      readable,
      wordLibrary,
    ]
  );

  return (
    <>
      <EditSection
        className={clsx(
          classes.headerEditSectionContainer,
          !isPreview && classes.hiddenContainer
        )}
        ref={contentRef}
      >
        <EditSectionHeader primary={wordLibrary?.information ?? "資訊"} />
        <Grid container spacing={2} position="relative">
          {renderStaticColumnContents()}
          {renderDynamicColumnContents()}
        </Grid>
      </EditSection>
    </>
  );
};

export default UserInfoPreview;
