import { useMemo } from "react";
import { Values } from "components/DynamicField";
import { ShareReurl } from "interfaces/entities";

export default function useDefaultUserValues(data?: ShareReurl) {
  const defaultValues: Values = useMemo(() => {
    const { organizationUser } = data || {};
    if (!organizationUser) return {};
    let result = {
      organizationUserAddress: organizationUser.organizationUserAddress || "",
      organizationUserArea: organizationUser.organizationUserArea || "",
      organizationUserCity: organizationUser.organizationUserCity || "",
      organizationUserEmail: organizationUser.organizationUserEmail || "",
      organizationUserGender: organizationUser.organizationUserGender
        ? String(organizationUser.organizationUserGender)
        : undefined,
      organizationUserIdCardNumber:
        organizationUser.organizationUserIdCardNumber || "",
      organizationUserNameZh: organizationUser.organizationUserNameZh || "",
      organizationUserNameEn: organizationUser.organizationUserNameEn || "",
      organizationUserPhone: organizationUser.organizationUserPhone || "",
      organizationUserZIPCode: organizationUser.organizationUserZIPCode || "",
      organizationUserBirth: organizationUser.organizationUserBirth || "",
    };
    if (organizationUser.dynamicColumnTargetList) {
      result = {
        ...result,
        ...organizationUser.dynamicColumnTargetList.reduce(
          (p, a) => ({
            ...p,
            [a.organizationColumn.columnId]: a.columnTargetValue,
          }),
          {}
        ),
      };
    }
    return result;
  }, [data]);

  return defaultValues;
}
