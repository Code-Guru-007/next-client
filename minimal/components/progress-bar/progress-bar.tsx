/* eslint-disable no-restricted-globals */

"use client";

import { useEffect } from "react";
import NProgress from "nprogress";
import StyledProgressBar from "./styles";

type PushStateInput = [
  data: any,
  unused: string,
  url?: string | URL | null | undefined
];

export default function ProgressBar() {
  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    const handleAnchorClick = (event: MouseEvent) => {
      const isFroalaLink = (event.currentTarget as HTMLElement).closest(
        ".fr-element"
      );
      const isFroalaViewLink = (event.currentTarget as HTMLElement).closest(
        ".froala-editor-view-text-indent"
      );
      const isSimpleWrapperLink = (event.currentTarget as HTMLElement).closest(
        ".simplebar-wrapper"
      );
      const targetUrl = (event.currentTarget as HTMLAnchorElement).href;
      const currentUrl = location.href;
      if (
        !isFroalaLink &&
        !isFroalaViewLink &&
        !isSimpleWrapperLink &&
        targetUrl !== "" &&
        targetUrl !== currentUrl
      ) {
        NProgress.start();
      }
    };

    const handleMutation: MutationCallback = () => {
      const anchorElements = document.querySelectorAll("a");
      anchorElements.forEach((anchor) =>
        anchor.addEventListener("click", handleAnchorClick)
      );
    };

    const mutationObserver = new MutationObserver(handleMutation);
    mutationObserver.observe(document, { childList: true, subtree: true });

    window.history.pushState = new Proxy(window.history.pushState, {
      apply: (target, thisArg, argArray: PushStateInput) => {
        NProgress.done();
        return target.apply(thisArg, argArray);
      },
    });
  });

  return <StyledProgressBar />;
}
