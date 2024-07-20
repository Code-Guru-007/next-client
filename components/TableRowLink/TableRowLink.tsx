import React, { FC } from "react";

import NextLink from "next/link";
import TableRow, { TableRowProps } from "@eGroupAI/material/TableRow";

export interface TableRowLinkProps extends TableRowProps {
  href: string;
}

const TableRowLink: FC<TableRowLinkProps> = function ({ href, ...other }) {
  return (
    <NextLink prefetch href={href} passHref legacyBehavior>
      <TableRow {...other} />
    </NextLink>
  );
};

export default TableRowLink;
