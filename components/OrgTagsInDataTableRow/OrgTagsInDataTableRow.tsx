import { OrganizationTagTarget } from "interfaces/entities";
import Label from "minimal/components/label";
import getTextColor from "@eGroupAI/utils/colorUtils";
import Popover from "@eGroupAI/material/Popover";
import React, { FC, useEffect } from "react";
import { makeStyles, useTheme } from "@mui/styles";
import { Box, useMediaQuery } from "@mui/material";

export interface OrgTagsInDataTableRowProps {
  organizationTagTargetList?: OrganizationTagTarget[];
  showCount?: number;
}

const useStyles = makeStyles(() => ({
  popoverWrapper: {
    padding: "20px",
  },
}));

const OrgTagsInDataTableRow: FC<OrgTagsInDataTableRowProps> = (props) => {
  const { organizationTagTargetList = [], showCount = 2 } = props;
  const theme = useTheme();
  const classes = useStyles();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
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
      {!isDownSm && (
        <>
          {organizationTagTargetList?.slice(0, showCount).map((tag) => (
            <Label
              variant="soft"
              key={`${tag.targetId}-${tag.organizationTag.tagName}`}
              sx={{
                backgroundColor: tag.organizationTag.tagColor,
                margin: "4px",
                color: getTextColor(tag.organizationTag.tagColor),
              }}
            >
              {tag.organizationTag.tagName}
            </Label>
          ))}
          {organizationTagTargetList &&
            organizationTagTargetList.length > showCount && (
              <Label
                variant="soft"
                sx={{
                  backgroundColor: "#DFE3E83D",
                  margin: "2px",
                  color: "#637381",
                  borderRadius: "8px",
                  padding: "3px",
                  width: "24px",
                  height: "24px",
                }}
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
              >
                +{organizationTagTargetList.length - showCount}
              </Label>
            )}
          <Popover
            className={classes.popoverWrapper}
            sx={{
              pointerEvents: "none",
            }}
            open={open}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            onClose={handlePopoverClose}
            disableRestoreFocus
          >
            {organizationTagTargetList?.map((tag) => (
              <>
                <Label
                  variant="soft"
                  key={`${tag.targetId}-${tag.organizationTag.tagName}`}
                  sx={{
                    backgroundColor: tag.organizationTag.tagColor,
                    margin: "5px 20px",
                    display: "",
                    color: getTextColor(tag.organizationTag.tagColor),
                  }}
                >
                  {tag.organizationTag.tagName}
                </Label>
                <br />
              </>
            ))}
          </Popover>
        </>
      )}
      {isDownSm && (
        <>
          {organizationTagTargetList?.slice(0, showCount).map((tag) => (
            <Label
              variant="soft"
              key={`${tag.targetId}-${tag.organizationTag.tagName}`}
              sx={{
                backgroundColor: tag.organizationTag.tagColor,
                margin: "4px",
                color: getTextColor(tag.organizationTag.tagColor),
              }}
            >
              {tag.organizationTag.tagName}
            </Label>
          ))}
          {organizationTagTargetList &&
            organizationTagTargetList.length > showCount && (
              <Box sx={{ display: "flex", justifyContent: "right" }}>
                <Label
                  variant="soft"
                  sx={{
                    backgroundColor: "#DFE3E83D",
                    margin: "2px",
                    color: "#637381",
                    borderRadius: "8px",
                    padding: "3px",
                    width: "24px",
                    height: "24px",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePopoverOpen(e);
                  }}
                  onMouseLeave={handlePopoverClose}
                >
                  +{organizationTagTargetList.length - showCount}
                </Label>
              </Box>
            )}
          <Popover
            className={classes.popoverWrapper}
            id="mouse-over-popover"
            sx={{
              pointerEvents: "none",
            }}
            open={open}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            onClose={handlePopoverClose}
            disableRestoreFocus
          >
            {organizationTagTargetList?.map((tag) => (
              <>
                <Label
                  variant="soft"
                  key={`${tag.targetId}-${tag.organizationTag.tagName}`}
                  sx={{
                    backgroundColor: tag.organizationTag.tagColor,
                    margin: "4px",
                    color: getTextColor(tag.organizationTag.tagColor),
                  }}
                >
                  {tag.organizationTag.tagName}
                </Label>
                <br />
              </>
            ))}
          </Popover>
        </>
      )}
    </>
  );
};
export default OrgTagsInDataTableRow;
