import React, { FC } from "react";
import {
  IntlControlContext,
  IntlControlWrapperProps,
} from "./IntlControlProvider";

const WrapperWithIntlControlConsumer = (
  WrapperComponent: FC<IntlControlWrapperProps>
) => {
  const IntlControlWrapper = (props: IntlControlWrapperProps) => (
    <IntlControlContext.Consumer>
      {({ setLocale, setMessages, locale }) => (
        <WrapperComponent
          {...props}
          setLocale={setLocale}
          setMessages={setMessages}
          locale={locale}
        />
      )}
    </IntlControlContext.Consumer>
  );

  IntlControlWrapper.displayName = WrapperComponent.displayName;

  return IntlControlWrapper;
};

export default WrapperWithIntlControlConsumer;
