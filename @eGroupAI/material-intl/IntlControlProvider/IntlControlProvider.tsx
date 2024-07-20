import React, { FC, useState, useEffect, useMemo } from "react";
import { IntlProvider, IntlConfig } from "react-intl";

export type SetMessages = (messages: IntlConfig["messages"]) => void;
export type SetLocale = (locale: string) => void;

export type IntlControlWrapperProps = {
  setLocale: SetLocale;
  setMessages: SetMessages;
  locale: string;
};

export const IntlControlContext = React.createContext<IntlControlWrapperProps>({
  setLocale: () => {},
  setMessages: () => {},
  locale: "en",
});
export interface IntlControlProviderProps {
  /** Callback function that triggers when component mount and
   * usually use to load third part library locale e.g., moment.
   * function(locale: string) => void */
  onMount?: (locale: string, setMessages: SetMessages) => void;
  /** Callback function that triggers when locale changed.
   * function(locale: string) => void */
  onUpdateLocale?: (locale: string, setMessages: SetMessages) => void;
  /**
   * Initialize IntlProvider with messages.
   */
  messages?: IntlConfig["messages"];
  defaultLocale: string;
  locale: string;
}

export interface IntlControlProviderState {
  locale: string;
  messages?: IntlConfig["messages"];
}

const IntlControlProvider: FC<IntlControlProviderProps> = (props) => {
  const {
    onMount,
    onUpdateLocale,
    locale: localeProp,
    messages: messagesProp,
    defaultLocale,
  } = props;
  const [locale, setLocale] = useState(localeProp);
  const [messages, setMessages] = useState(messagesProp);

  useEffect(() => {
    if (onMount) {
      onMount(locale, setMessages);
    }
  }, []);

  useEffect(() => {
    if (onUpdateLocale) {
      onUpdateLocale(locale, setMessages);
    }
  }, [locale]);

  const intlContext = useMemo(
    () => ({
      setLocale,
      setMessages,
      locale,
    }),
    [locale]
  );

  return (
    <IntlControlContext.Provider value={intlContext}>
      <IntlProvider
        locale={locale}
        key={locale}
        messages={messages}
        defaultLocale={defaultLocale}
      />
    </IntlControlContext.Provider>
  );
};

export default IntlControlProvider;
