import { useCallback } from "react";
// utils
import "minimal/utils/highlight";
import ReactMarkdown from "react-markdown";
// markdown plugins
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
// @mui
import Link from "@mui/material/Link";
// routes
import { RouterLink } from "minimal/routes/components";
//
import Image from "../image";
//
import StyledMarkdown from "./styles";
import { MarkdownProps } from "./types";
import Scrollbar from "../scrollbar/scrollbar";

// ----------------------------------------------------------------------

export default function Markdown({
  sx,
  showFullImage,
  ...other
}: MarkdownProps) {
  return (
    <StyledMarkdown sx={sx} className="markdownContainer">
      <Scrollbar>
        <ReactMarkdown
          rehypePlugins={[
            rehypeRaw,
            rehypeHighlight,
            [remarkGfm, { singleTilde: false }],
          ]}
          components={{
            ...components,
            img: useCallback(
              (props) => (
                <Image
                  alt={props.alt}
                  ratio="16/9"
                  sx={{ borderRadius: showFullImage ? 0 : 2 }}
                  showFullImage={showFullImage}
                  {...props}
                />
              ),
              [showFullImage]
            ),
          }}
          {...other}
        />
      </Scrollbar>
    </StyledMarkdown>
  );
}

// ----------------------------------------------------------------------

const components = {
  a: ({ ...props }) => {
    const isHttp = props.href.includes("http");

    return isHttp ? (
      <Link target="_blank" rel="noopener" {...props} />
    ) : (
      <Link component={RouterLink} href={props.href} {...props}>
        {props.children}
      </Link>
    );
  },
};
