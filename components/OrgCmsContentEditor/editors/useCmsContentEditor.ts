import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo/getDeviceInfo";
import useAxiosApiWrapper from "utils/useAxiosApiWrapper";
import { useSelector } from "react-redux";
import apis from "utils/apis";
import parseCmsContentApiPayload from "utils/parseCmsContentApiPayload";
import { Locale } from "interfaces/utils";
import parseUpdateMediaPromises from "utils/parseUpdateMediaPromises";
import { CmsContentEditorProps, CmsContentFormProps } from "../typings";

export default function useCmsContentEditor(props: CmsContentEditorProps) {
  const { data } = props;
  const organizationId = useSelector(getSelectedOrgId);
  const { excute: updateOrgCmsContent, isLoading: isUpdating } =
    useAxiosApiWrapper(apis.org.updateOrgCmsContent, "Update");

  const handleSubmit =
    (selectedLocale: Locale): CmsContentFormProps["onSubmit"] =>
    (values, mutate, handleClose) => {
      const promises: Promise<unknown>[] = parseUpdateMediaPromises(
        organizationId,
        selectedLocale,
        values.organizationMediaList
      );
      promises.push(
        updateOrgCmsContent(
          parseCmsContentApiPayload(
            organizationId,
            data,
            values,
            selectedLocale
          )
        )
      );
      Promise.all(promises)
        .then(() => {
          mutate();
          if (handleClose) {
            handleClose();
          }
        })
        .catch((err) => {
          apis.tools.createLog({
            function: "DatePicker: handleSubmit",
            browserDescription: window.navigator.userAgent,
            jsonData: {
              data: err,
              deviceInfo: getDeviceInfo(),
            },
            level: "ERROR",
          });
        });
    };

  return {
    handleSubmit,
    isUpdating,
  };
}
