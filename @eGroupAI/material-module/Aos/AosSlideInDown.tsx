import React, { forwardRef } from "react";

import AosCore, { AosCoreProps } from "./AosCore";

const AosSlideInDown = forwardRef<HTMLDivElement, AosCoreProps>(
  (props, ref) => {
    const { from, to, ...other } = props;
    return (
      <AosCore
        ref={ref}
        from={{
          opacity: 0,
          transform: "translate3d(0, -2000px, 0)",
        }}
        to={{
          opacity: 1,
          transform: "translate3d(0, 0, 0)",
        }}
        {...other}
      />
    );
  }
);

export default AosSlideInDown;
