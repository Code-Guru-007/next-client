import React, { FC, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MyComponentProps } from "react-froala-wysiwyg/FroalaEditorView";
import Lightbox from "minimal/components/lightbox";
import { Box } from "@mui/material";

const DefaultFroalaEditorView = dynamic(
  async () => {
    const values = await Promise.all([
      import("react-froala-wysiwyg/FroalaEditorView"),
    ]);
    return values[0];
  },
  {
    loading: () => <div />,
    ssr: false,
  }
);

const FroalaEditorView: FC<MyComponentProps> = function (props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const div = divRef?.current;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLImageElement;
      if (target.tagName === "IMG") {
        setImageUrl(target.src);
        setIsOpen(true);
      }
    };
    div?.addEventListener("click", handleClick);

    return () => {
      div?.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    // Set links to open in a new page
    const div = divRef.current;
    const setLinkTargetBlank = () => {
      if (div) {
        const links = div.getElementsByTagName("a");
        for (let i = 0; i < links.length; i++) {
          links[i]?.setAttribute("target", "_blank");
        }
      }
    };
    setLinkTargetBlank();
    // Observer to handle dynamic content changes
    const observer = new MutationObserver(setLinkTargetBlank);
    if (div) {
      observer.observe(div, { childList: true, subtree: true });
    }
    return () => {
      if (div) {
        observer.disconnect();
      }
    };
  }, [divRef]);

  return (
    <Box ref={divRef} sx={{ "& .fr-view": { position: "relative" } }}>
      <DefaultFroalaEditorView {...props} />
      {isOpen && imageUrl && (
        <Lightbox
          open={isOpen}
          close={() => setIsOpen(false)}
          slides={[{ src: imageUrl }]}
          disabledVideo
          disabledTotal
          disabledCaptions
          disabledSlideshow
          disabledThumbnails
          disabledFullscreen
          className="fr-lightbox-img"
        />
      )}
    </Box>
  );
};

export default FroalaEditorView;
