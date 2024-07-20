import React, { Children, cloneElement, FC, isValidElement } from "react";
import { useSelector } from "react-redux";
import Tooltip from "@eGroupAI/material/Tooltip";
import { getWordLibrary } from "redux/wordLibrary/selectors";

export interface ValidComponentWrapperProps {
  hasPermission: boolean;
  /**
   * Button status without permission.
   */
  type?: "disabled" | "hidden";
}

const ValidComponentWrapper: FC<ValidComponentWrapperProps> = function ({
  hasPermission,
  type = "hidden",
  children,
}) {
  const wordLibrary = useSelector(getWordLibrary);

  if (!hasPermission && type === "disabled") {
    const items = Children.map(children, (child) => {
      if (isValidElement(child)) {
        return cloneElement(child as React.ReactElement, {
          disabled: true,
        });
      }
      return undefined;
    });

    const tooltipTitle =
      wordLibrary?.["you do not have permission to perform this operation"] ??
      "您沒有操作權限";

    return (
      <Tooltip title={tooltipTitle}>
        <span>{items}</span>
      </Tooltip>
    );
  }

  if (!hasPermission && type === "hidden") {
    return null;
  }

  return <>{children}</>;
};

export default ValidComponentWrapper;
