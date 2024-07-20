import React, { FC, useState } from "react";
import PermissionValid, {
  PermissionValidProps,
} from "components/PermissionValid";

export interface PermissionValidGroupProps {
  schema: PermissionValidProps[];
}

/**
 * If PermissionValid need multiple condition you can use group.
 */
const PermissionValidGroup: FC<PermissionValidGroupProps> = function (props) {
  const { schema, children } = props;
  const [hasPermissions, setHasPermissions] = useState<boolean[]>([]);

  return (
    <>
      {schema.map((el) => (
        <PermissionValid
          key={el.vaildLoginId}
          setHasPermissions={setHasPermissions}
          {...el}
        />
      ))}
      {hasPermissions.includes(true) && children}
    </>
  );
};

export default PermissionValidGroup;
