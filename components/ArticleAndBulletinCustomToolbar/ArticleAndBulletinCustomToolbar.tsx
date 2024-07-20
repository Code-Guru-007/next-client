import { UploadFile } from "interfaces/entities";
import { Button, Tooltip, Typography, Divider, Box } from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CalendarViewMonthOutlinedIcon from "@mui/icons-material/CalendarViewMonthOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import FormatListNumberedOutlinedIcon from "@mui/icons-material/FormatListNumberedOutlined";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import HorizontalRuleOutlinedIcon from "@mui/icons-material/HorizontalRuleOutlined";
import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";
import useUploadOrgFiles from "@eGroupAI/hooks/apis/useUploadOrgFiles";
import { useEffect, useRef, useState } from "react";
import { ServiceModuleValue } from "interfaces/utils";
import apis from "utils/apis";
import { getSelectedOrgId } from "@eGroupAI/redux-modules/memberOrgs";
import { useSelector } from "react-redux";
import Iconify from "minimal/components/iconify";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  toolbarContainer: {
    position: "fixed",
    bottom: "10px",
    left: "52%",
    transform: "translate(-47%, 0%)",
    background: "#232121",
    color: "white",
    padding: "6px 8px",
    zIndex: 9999,
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
  },
  divider: {
    marginInline: "6px",
    borderColor: "white",
  },
  iconButton: {
    height: "32px",
    paddingInline: "6px",
    minWidth: "auto",
    borderRadius: "0",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  },
}));

const navigationKeys = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

export default function ArticleAndBulletinCustomToolbar({
  editor,
  setContentCopy,
  saveContent,
  isSearchOpen,
}) {
  const organizationId = useSelector(getSelectedOrgId);
  const [isImageSelect, setIsImageSelect] = useState<boolean>(false);
  const [toolbarVisible, setToolbarVisible] = useState({
    show: false,
    isTable: false,
  });
  const { excute: uploadOrgFiles } = useUploadOrgFiles<
    UploadFile,
    ServiceModuleValue
  >();
  const fileRef = useRef<HTMLInputElement>(null);
  const classes = useStyles();

  useEffect(() => {
    const getElement = (event) => {
      const selectedblock = editor?.selection?.blocks()[0];

      setToolbarVisible({
        show:
          selectedblock?.nodeName === "TR" ||
          selectedblock?.querySelector("video")
            ? false
            : !!selectedblock?.closest(".fr-view"),
        isTable: !!selectedblock?.closest("table"),
      });

      const tableToolbar = Array.from(
        document.getElementsByClassName("fr-popup") as unknown as HTMLElement[]
      ).find((tableToolbar) =>
        tableToolbar.querySelector('[data-cmd="tableCellBackground"]')
      );
      if (tableToolbar) {
        tableToolbar?.classList.add("dark-theme");

        if (
          event.target.nodeName === "TR" ||
          event.target.nodeName === "TBODY"
        ) {
          const table = event.target.closest("table");
          tableToolbar.style.display = "block";

          if (table) {
            const selectedCells = Array.from(
              table.querySelectorAll(".fr-selected-cell")
            );
            const deleteButton = tableToolbar.querySelector(
              '[data-cmd="tableRemoveCell"]'
            ) as HTMLElement;
            if (selectedCells.length > 0) {
              const firstSelectedCell = selectedCells[0] as HTMLElement;

              if (firstSelectedCell) {
                const cellRect = (
                  firstSelectedCell as HTMLElement
                ).getBoundingClientRect();
                const absoluteTop = cellRect.top + window.scrollY;
                tableToolbar.style.setProperty(
                  "left",
                  `${cellRect.left}px`,
                  "important"
                );
                tableToolbar.style.setProperty(
                  "top",
                  `${absoluteTop - 80}px`,
                  "important"
                );
              }
              const selectedRowCount = new Set(
                selectedCells.map((cell) => (cell as HTMLElement).parentElement)
              ).size;
              const selectedColumnCount = new Set(
                selectedCells.map(
                  (cell) => (cell as HTMLTableCellElement).cellIndex
                )
              ).size;
              const tableRows = table.querySelectorAll("tr");
              const tableColumns = table.querySelectorAll(
                "tr:first-child td, tr:first-child th"
              );
              const isCompleteRowSelection =
                selectedRowCount === tableRows.length;
              const isCompleteColumnSelection =
                selectedColumnCount === tableColumns.length;
              if (
                deleteButton &&
                (isCompleteRowSelection || isCompleteColumnSelection)
              ) {
                deleteButton.style.display = "flex";
              } else {
                deleteButton.style.display = "none";
              }
            }
          }
        } else {
          tableToolbar.style.display = "none";
        }
      }
    };

    editor?.events.on("click", (event: MouseEvent) => {
      if ((event?.target as HTMLElement)?.tagName === "IMG") {
        setToolbarVisible({
          show: false,
          isTable: false,
        });
        const tableToolbar = Array.from(
          document.getElementsByClassName(
            "fr-popup"
          ) as unknown as HTMLElement[]
        ).find((tableToolbar) =>
          tableToolbar.querySelector('[data-cmd="tableCellBackground"]')
        );
        if (tableToolbar) {
          tableToolbar.style.display = "none";
        }
      }
    });

    editor?.events.on("keydown", (event: KeyboardEvent) => {
      if (navigationKeys.has(event.key)) {
        setToolbarVisible({ show: true, isTable: false });
      }
    });

    editor?.events.on(
      "tableRemove",
      () => {
        setToolbarVisible({
          show: true,
          isTable: false,
        });
      },
      true
    );

    editor?.events.on(
      "image.inserted",
      () => {
        setToolbarVisible({
          show: false,
          isTable: false,
        });
      },
      true
    );

    document.addEventListener("click", getElement);
    return () => {
      document.removeEventListener("click", getElement);
    };
  }, [editor]);

  return (
    <div>
      {toolbarVisible.show && !editor?.selection?.text() && (
        <Typography
          onClick={() => {
            setTimeout(() => {
              if (isSearchOpen) {
                setContentCopy(saveContent(editor?.el?.innerHTML || ""));
              }
            }, 0);
          }}
          className={classes.toolbarContainer}
        >
          <Box className={classes.toolbar}>
            <Tooltip
              onClick={() => {
                if (fileRef.current) {
                  fileRef.current.accept = "image/*";
                  fileRef.current.click();
                }
                setIsImageSelect(true);
              }}
              title="插入圖片"
            >
              <Button className={classes.iconButton}>
                <ImageOutlinedIcon fontSize="small" />
              </Button>
            </Tooltip>

            {!toolbarVisible.isTable && (
              <Tooltip
                onClick={() => {
                  editor?.video?.showInsertPopup();
                }}
                title="插入媒體"
              >
                <Button className={classes.iconButton}>
                  <VideocamOutlinedIcon fontSize="small" />
                </Button>
              </Tooltip>
            )}
            {!toolbarVisible.isTable && (
              <Tooltip
                onClick={() => {
                  setIsImageSelect(false);
                  if (fileRef.current) {
                    fileRef.current.accept = "*";
                    fileRef.current.click();
                  }
                }}
                title="插入檔案"
              >
                <Button className={classes.iconButton}>
                  <InsertDriveFileOutlinedIcon fontSize="small" />
                </Button>
              </Tooltip>
            )}
            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              className={classes.divider}
            />
            {!toolbarVisible.isTable && (
              <Tooltip
                onClick={() => {
                  editor?.table?.insert(2, 2);
                }}
                title="插入表格"
              >
                <Button className={classes.iconButton}>
                  <CalendarViewMonthOutlinedIcon fontSize="small" />
                </Button>
              </Tooltip>
            )}
            <Tooltip
              onClick={() => {
                editor?.html?.insert("<input type='checkbox' />");
              }}
              title="切換代辦事項"
            >
              <Button className={classes.iconButton}>
                <CheckBoxOutlinedIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip
              onClick={() => {
                editor?.commands.exec("formatUL");
              }}
              title="切換項目符號清單"
            >
              <Button className={classes.iconButton}>
                <FormatListBulletedOutlinedIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip
              onClick={() => {
                editor?.commands.exec("formatOL");
              }}
              title="切換編號清單"
            >
              <Button className={classes.iconButton}>
                <FormatListNumberedOutlinedIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              className={classes.divider}
            />
            <Tooltip
              onClick={() => {
                editor?.commands?.insertHR();
              }}
              title="插入分節符號"
            >
              <Button className={classes.iconButton}>
                <HorizontalRuleOutlinedIcon fontSize="small" />
              </Button>
            </Tooltip>
            {!toolbarVisible.isTable && (
              <Tooltip
                onClick={() => {
                  const blocks = editor.selection.blocks();
                  const currentBlock = blocks[0];
                  editor.selection.save();
                  if (currentBlock) {
                    const closestCodeBlock = currentBlock.closest("pre");
                    const isPreformatted = closestCodeBlock;
                    if (isPreformatted) {
                      const newBlock = document.createElement("p");
                      newBlock.innerHTML = closestCodeBlock.innerHTML;
                      closestCodeBlock.parentNode.replaceChild(
                        newBlock,
                        closestCodeBlock
                      );
                    } else {
                      const newBlock = document.createElement("pre");
                      newBlock.appendChild(currentBlock.cloneNode(true));
                      currentBlock.parentNode.replaceChild(
                        newBlock,
                        currentBlock
                      );
                    }
                    editor?.events?.trigger("contentChanged");
                  }
                  editor.selection.restore();
                }}
                title="切換程式碼區塊"
              >
                <Button className={classes.iconButton}>
                  <Iconify icon="mdi:code" width={20} />
                </Button>
              </Tooltip>
            )}
          </Box>
        </Typography>
      )}
      <input
        type="file"
        ref={fileRef}
        onChange={async (e) => {
          try {
            if (e.target.files && e.target.files[0]) {
              const res = await uploadOrgFiles({
                organizationId,
                filePathType: ServiceModuleValue.ARTICLE,
                files: [e.target.files[0]],
                eGroupService: "WEBSITE",
              });

              if (isImageSelect)
                editor?.image?.insert(
                  res.data[0]?.uploadFilePath,
                  null,
                  null,
                  editor.image.get() as unknown as VoidFunction
                );
              else
                editor?.file?.insert(
                  res.data[0]?.uploadFilePath,
                  e.target.files[0]?.name
                );
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            apis.tools.createLog({
              function: "DatePicker: handleDelete",
              browserDescription: window.navigator.userAgent,
              jsonData: {
                data: error,
                deviceInfo: getDeviceInfo(),
              },
              level: "ERROR",
            });
          }
        }}
        style={{ display: "none" }}
      />
    </div>
  );
}
