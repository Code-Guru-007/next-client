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
import apis from "utils/apis";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useSelector } from "react-redux";
import { OrganizationPartner } from "interfaces/entities";
import useSwrMatchMutate from "@eGroupAI/hooks/useSwrMatchMutate";
import { getGlobalLocale } from "components/PrivateLayout/selectors";
import useOrgPartner from "utils/useOrgPartner";
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

import { UpdateOrgPartnerApiPayload } from "interfaces/payloads";
import getOrgColumnGroupByGroup from "utils/getOrgColumnsGroupByGroup";
import useUpdatePartnerApiPayload from "utils/useUpdatePartnerApiPayload";
import useOrgDynamicColumns from "utils/useOrgDynamicColumns";
import { ColumnType } from "@eGroupAI/typings/apis";

import { getWordLibrary } from "redux/wordLibrary/selectors";

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
}));

export type OptionType = {
  optionId: string;
  label: string;
  value: string;
};

export interface PartnerInfoPreviewProps {
  orgPartner?: OrganizationPartner;
  previewValue?: Omit<
    UpdateOrgPartnerApiPayload,
    "organizationId" | "organizationPartnerId"
  >;
  readable?: boolean;
}

const PartnerInfoPreview: FC<PartnerInfoPreviewProps> = function (props) {
  const { orgPartner, readable = false, previewValue } = props;
  const [mutableOrgPartner, setMutableOrgPartner] = useState<
    OrganizationPartner | undefined
  >(orgPartner);

  const classes = useStyles();
  const router = useRouter();

  const organizationId = useSelector(getSelectedOrgId);
  const locale = useSelector(getGlobalLocale);
  const organizationPartnerId = router.query.partnerId as string;
  const contentRef = useRef<HTMLDivElement>(null);
  const wordLibrary = useSelector(getWordLibrary);

  const [preVal, setPreVal] =
    useState<
      Omit<
        UpdateOrgPartnerApiPayload,
        "organizationId" | "organizationPartnerId"
      >
    >();

  useEffect(() => {
    setPreVal(previewValue);
  }, [previewValue]);

  const { data: updatedOrgPartner } = useOrgPartner(
    {
      organizationId,
      organizationPartnerId,
    },
    {
      locale,
    }
  );
  useEffect(() => {
    setMutableOrgPartner(updatedOrgPartner);
  }, [updatedOrgPartner]);

  const columns = useStaticColumns(Table.PARTNERS, "isEdit", organizationId);
  const { data: orgColumns } = useOrgDynamicColumns(
    {
      organizationId,
    },
    {
      columnTable: "ORGANIZATION_PARTNER",
    }
  );
  const getUpdatePayload = useUpdatePartnerApiPayload(
    mutableOrgPartner?.dynamicColumnTargetList,
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

  const { excute: updateOrgPartner } = useAxiosApiWrapper(
    apis.org.updateOrgPartner,
    "Update"
  );

  const matchMutate = useSwrMatchMutate();

  const [shouldMutate, setShouldMutate] = useState<boolean>(false);

  const handleMutate = useCallback(() => {
    if (shouldMutate) {
      matchMutate(
        new RegExp(
          `^/organizations/${organizationId}/partners/${organizationPartnerId}\\?`,
          "g"
        )
      );
      setShouldMutate(false);
    }
  }, [matchMutate, organizationId, organizationPartnerId, shouldMutate]);

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
    if (!mutableOrgPartner) return {};
    const dynamics = mutableOrgPartner.dynamicColumnTargetList?.reduce(
      (a, b) => {
        const uploadFileName = mutableOrgPartner.uploadFileList?.find(
          (el) => el.uploadFileId === b.columnTargetValue
        )?.uploadFileName;
        return {
          ...a,
          [b.organizationColumn.columnId]: { ...b, uploadFileName },
        };
      },
      {}
    );
    return {
      // eslint-disable-next-line no-console
      organizationPartnerNameZh:
        mutableOrgPartner.organizationPartnerNameZh || "",
      organizationPartnerNameEn:
        mutableOrgPartner.organizationPartnerNameEn || "",
      organizationPartnerCountry:
        mutableOrgPartner.organizationPartnerCountry || "",
      organizationPartnerCity: mutableOrgPartner.organizationPartnerCity || "",
      organizationPartnerArea: mutableOrgPartner.organizationPartnerArea || "",
      organizationPartnerZIPCode:
        mutableOrgPartner.organizationPartnerZIPCode || "",
      organizationPartnerAddress:
        mutableOrgPartner.organizationPartnerAddress || "",
      organizationPartnerWebsite:
        mutableOrgPartner.organizationPartnerWebsite || "",
      organizationPartnerInvoiceTaxIdNumber:
        mutableOrgPartner.organizationPartnerInvoiceTaxIdNumber || "",
      organizationPartnerTelephone:
        mutableOrgPartner.organizationPartnerTelephone || "",
      organizationPartnerFax: mutableOrgPartner.organizationPartnerFax || "",

      ...dynamics,
    };
  }, [mutableOrgPartner]);

  const handleSaveValue = useCallback(
    (name, newValues, remarkValues) => {
      let payload: Omit<
        UpdateOrgPartnerApiPayload,
        "organizationId" | "organizationPartnerId"
      >;
      if (mutableOrgPartner) {
        payload = getUpdatePayload(
          {
            [name]: typeof newValues === "object" ? newValues.value : newValues,
          },
          defaultValues,
          // eslint-disable-next-line no-console
          {
            [name]: remarkValues,
          },
          organizationPartnerId
        );
      } else {
        payload = getUpdatePayload(
          {
            [name]: typeof newValues === "object" ? newValues.value : newValues,
          },
          defaultValues,
          // eslint-disable-next-line no-console
          {
            [name]: remarkValues,
          }
        );
      }

      if (mutableOrgPartner) {
        return updateOrgPartner({
          organizationId,
          organizationPartnerId,
          ...payload,
        })
          .then(() => {
            setShouldMutate(true);
            return "success";
          })
          .catch((err) => {
            apis.tools.createLog({
              function: "updateOrgPartner: error",
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
      mutableOrgPartner,
      getUpdatePayload,
      defaultValues,
      organizationPartnerId,
      updateOrgPartner,
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
          {}
          <DynamicFieldWithAction
            value={preVal[key]}
            name={key}
            columnType={ColumnType.TEXT}
            label={label}
            boldText
            handleChange={handleSaveValue}
            readable={readable}
          />
          {}
        </Box>
      </Grid>
    );

    return Object.keys(preVal).map((key) => {
      switch (key) {
        case "organizationPartnerNameZh":
          return staticColumns(
            key,
            `${wordLibrary?.["chinese name"] ?? "中文姓名"}`
          );
        case "organizationPartnerNameEn":
          return staticColumns(
            key,
            `${wordLibrary?.["english name"] ?? "英文姓名"}`
          );
        case "organizationPartnerCountry":
          return staticColumns(key, wordLibrary?.country ?? "國家");
        case "organizationPartnerCity":
          return staticColumns(key, `${wordLibrary?.city ?? "城市"}`);
        case "organizationPartnerArea":
          return staticColumns(key, `${wordLibrary?.region ?? "地區"}`);
        case "organizationPartnerZIPCode":
          return staticColumns(
            key,
            `${wordLibrary?.["postal code"] ?? "郵遞區號"}`
          );
        case "organizationPartnerAddress":
          return staticColumns(key, `${wordLibrary?.address ?? "地址"}`);
        case "organizationPartnerWebsite":
          return staticColumns(key, `${wordLibrary?.website ?? "網站"}`);
        case "organizationPartnerInvoiceTaxIdNumber":
          return staticColumns(key, `${wordLibrary?.ubn ?? "統編"}`);
        case "organizationPartnerTelephone":
          return staticColumns(key, `${wordLibrary?.phone ?? "電話"}`);
        case "organizationPartnerFax":
          return staticColumns(key, `${wordLibrary?.fax ?? "傳真"}`);
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
                        uploadFile={(
                          mutableOrgPartner?.uploadFileList || []
                        ).find(
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
      mutableOrgPartner?.uploadFileList,
      orgColumnsGroupByGroup,
      preVal?.dynamicColumnTargetList,
      readable,
      wordLibrary,
    ]
  );

  return (
    <>
      <EditSection
        className={classes.headerEditSectionContainer}
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

export default PartnerInfoPreview;
