import React, { FC, ReactNode } from "react";
import getIntlNumber from "utils/getIntlNumber";

export interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    color?: string;
    name?: string;
    value?: number;
  }[];
  separator?: ReactNode;
  label?: ReactNode;
}

const CustomTooltip: FC<CustomTooltipProps> = function ({
  active,
  payload,
  separator,
  label,
}) {
  if (active && payload && payload.length) {
    return (
      <div
        className="recharts-default-tooltip"
        style={{
          margin: 0,
          padding: 10,
          backgroundColor: "rgb(255, 255, 255)",
          border: "1px solid rgb(204, 204, 204)",
          whiteSpace: "nowrap",
        }}
      >
        <p className="recharts-tooltip-label" style={{ margin: 0 }}>
          {label}
        </p>
        <ul
          className="recharts-tooltip-item-list"
          style={{ padding: 0, margin: 0 }}
        >
          {payload.map((el) => (
            <li
              key={`tooltip-item-${el.name}`}
              style={{
                display: "block",
                paddingTop: 4,
                paddingBottom: 4,
                color: el.color || "#000",
              }}
            >
              <span className="recharts-tooltip-item-name">{el.name}</span>
              <span className="recharts-tooltip-item-separator">
                {separator}
              </span>
              <span className="recharts-tooltip-item-value">
                {el.value !== undefined && getIntlNumber(el.value)} 元
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
