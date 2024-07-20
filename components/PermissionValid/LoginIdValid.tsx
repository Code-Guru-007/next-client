import React, { FC } from "react";
import useMemberInfo from "@eGroupAI/hooks/apis/useMemberInfo";
import ValidComponentWrapper from "./ValidComponentWrapper";

export interface LoginIdValidProps {
  vaildLoginId: string;
  type: "disabled" | "hidden";
}

const LoginIdValid: FC<LoginIdValidProps> = function ({
  vaildLoginId,
  type,
  children,
}) {
  const { data } = useMemberInfo();
  const hasPermission = data?.loginId === vaildLoginId;

  return (
    <ValidComponentWrapper hasPermission={hasPermission} type={type}>
      {children}
    </ValidComponentWrapper>
  );
};

export default LoginIdValid;
