import React, {
  PropsWithChildren,
  Children,
  useState,
  ReactNode,
  useEffect,
} from "react";

import makeStyles from "@mui/styles/makeStyles";

import {
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  TableRowProps,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DataTableCell from "./DataTableCell";
import DataTableRowCheckbox from "./StyledDataTableRowCheckbox";
import { DataTableRowCheckboxProps } from "./DataTableRowCheckbox";

const useStyles = makeStyles(
  () => ({
    firstCell: {
      whiteSpace: "nowrap",
      width: "50px",
      verticalAlign: "top",
    },
    detailCell: {
      paddingBottom: 0,
      paddingTop: 0,
    },
  }),
  {
    name: "MuiEgDataTableRow",
  }
);

export interface DataTableRowProps<Data> extends TableRowProps {
  collapse?: boolean;
  checkbox?: boolean;
  dataId?: string;
  data?: Data;
  detail?: ReactNode;
  DataTableRowCheckboxProps?: Pick<
    DataTableRowCheckboxProps<Data>,
    "defaultChecked" | "checked"
  >;
}

const DataTableRow = <Data,>(
  props: PropsWithChildren<DataTableRowProps<Data>>
) => {
  const classes = useStyles();
  const {
    children,
    collapse,
    checkbox,
    dataId,
    data,
    detail,
    DataTableRowCheckboxProps,
    ...other
  } = props;
  const [open, setOpen] = useState(false);
  const colSpan = Children.toArray(children).length;
  const enableCheckbox = checkbox && typeof dataId !== "undefined";

  const searchWord = localStorage.getItem("searchWord");

  useEffect(() => {
    const tbodyElement = document?.getElementsByClassName(
      "MuiTableBody-root"
    )[0] as HTMLElement;
    if (tbodyElement) {
      const regex = searchWord ? new RegExp(searchWord, "gi") : null;

      const highlightText = (node: HTMLElement) => {
        const walker = document.createTreeWalker(
          node,
          NodeFilter.SHOW_TEXT,
          null
        );
        let textNode = walker.nextNode();
        const nodesToReplace: { oldNode: Node; newNode: Node }[] = [];
        while (textNode) {
          if (
            textNode.nodeValue &&
            regex?.test(textNode.nodeValue.toLowerCase())
          ) {
            const span = document.createElement("span");
            span.innerHTML = textNode.nodeValue.replace(
              regex,
              `<span style="color: #ec623f;">${searchWord}</span>`
            );
            nodesToReplace.push({ oldNode: textNode, newNode: span });
          }
          textNode = walker.nextNode();
        }
        nodesToReplace.forEach(({ oldNode, newNode }) => {
          oldNode?.parentNode?.replaceChild(newNode, oldNode);
        });
      };

      const removeHighlight = (node: HTMLElement) => {
        const spans = node.querySelectorAll('span[style="color: #ec623f;"]');
        spans.forEach((span) => {
          const parent = span.parentNode;
          if (parent) {
            parent.replaceChild(
              document.createTextNode(span.textContent || ""),
              span
            );
            parent.normalize();
          }
        });
      };

      removeHighlight(tbodyElement);
      if (searchWord && searchWord.trim()) {
        highlightText(tbodyElement);
      }
    }
  }, [searchWord]);

  return (
    <>
      <TableRow {...other}>
        {(collapse || enableCheckbox) && (
          <DataTableCell className={classes.firstCell} align="left">
            {collapse && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(!open);
                }}
              >
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            )}
            {enableCheckbox && (
              <DataTableRowCheckbox
                dataId={dataId as string}
                data={data}
                size="small"
                {...DataTableRowCheckboxProps}
              />
            )}
          </DataTableCell>
        )}
        {children}
      </TableRow>
      {collapse && (
        <TableRow>
          <TableCell className={classes.detailCell} colSpan={colSpan + 1}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              {detail}
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default DataTableRow;
