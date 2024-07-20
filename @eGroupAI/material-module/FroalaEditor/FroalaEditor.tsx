/* eslint-disable no-console */
import React, {
  FC,
  HTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/router";

import { useDispatch, useSelector } from "react-redux";
import { getWordLibrary } from "redux/wordLibrary/selectors";
import { setChangeStatus, setOpenStatus } from "redux/froalaEditor";
import { getOpenStatus, getChangeStatus } from "redux/froalaEditor/selectors";
import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";
import $ from "jquery";
import _FroalaEditor from "froala-editor";
import FroalaEditorComponent from "react-froala-wysiwyg";
import Lightbox from "minimal/components/lightbox";

// jQuery && Spectrum jQuery Plugin import required
// by Froala Editor custom multi color picker
// import $ from "jquery";
import "spectrum-colorpicker2/dist/spectrum.min";

import { Box } from "@mui/material";
import {
  EditorRef,
  OnModelChange,
  FroalaOptions,
  OnManualControllerReady,
} from "./typing";
import {
  fontFamily,
  pluginsEnabled,
  toolbarButtons,
  toolbarButtonsSM,
  toolbarButtonsXS,
  quickInsertButtons,
  shortcutsEnabled,
} from "./defaultOptions";

import { SelectionInfo, convertUrl2File, getCaretPosition } from "./utils";

import { setupCustomTextColorPicker } from "./CustomTextColorPicker";
import { setupCustomBackgroundColorPicker } from "./CustomBackgroundColorPicker";
import { setupCustomQuickInsertButtonFile } from "./CustomQuickInsertButtonFile";
import { setupCustomQuickInsertButtonLink } from "./CustomQuickInsertButtonLink";
import { setupCustomStrikeThroughButton } from "./CustomStrikeThroughButton";
import { calculateTableInsertButtons } from "./CustomTableInsert";
import {
  customCheckBox,
  customDeleteRow,
  customH1Tag,
  customH2Tag,
  registerImageAlign,
  registerImageReplace,
} from "./CustomCommands";
import { setupCustomLinkInsert } from "./CustomLinkPopup";

const useStyles = makeStyles(
  () => ({
    root: {
      "& .fr-basic.fr-wrapper": {},
      "&": {
        lineHeight: "26px",
      },
      "& ul, ol": {
        padding: 0,
        margin: 0,
        marginInlineStart: "1.5em",
      },
    },
  }),
  {
    name: "MuiEgFroalaEditor",
  }
);

export interface FroalaEditorProps extends HTMLAttributes<HTMLDivElement> {
  id?: string;
  testId?: string;
  /**
   * License Key.
   */
  licenseKey: string;
  /**
   * You can pass editor options as component attribute (optional).
   * You can pass any existing Froala option.
   * Consult the Froala documentation to view the list of all the available options:
   * https://froala.com/wysiwyg-editor/docs/options/
   */
  config?: FroalaOptions;
  /**
   * tag attr is used to tell on which tag the editor is initialized.
   * There are special tags: a, button, img, input. Do not use them in FroalaEditor component.
   * To initialize the editor on a special tag, use FroalaEditorA, FroalaEditorButton, FroalaEditorImg and FroalaEditorInput components.
   */
  tag?: string;
  /**
   * The WYSIWYG HTML editor content model.
   */
  model?: string | null;
  /**
   * Two way binding model.
   * To achieve one way binding and pass only the initial editor content, simply do not pass onModelChange attribute.
   */
  onModelChange?: OnModelChange;
  /**
   * trigger update moment
   * used when onModelChange event not triggered for some reasons like images copy pasted and replaced
   */
  triggerSaveContentManually?: () => void;
  /**
   * handler to save content manually
   */
  handleSaveContentManually?: () => void;
  /**
   * Gets the functionality to operate on the editor: create, destroy and get editor instance.
   * Use it if you want to manually initialize the editor.
   */
  onManualControllerReady?: OnManualControllerReady;
  /**
   * Hide border
   */
  disableBorder?: boolean;
  /**
   * Image BeforeUpload
   */
  imageBeforeUpload?: (
    files: File[],
    editor: any,
    selectedImage?: HTMLImageElement
  ) => void;
  /**
   * File BeforeUpload
   */
  fileBeforeUpload?: (files: File[], editor: any) => void;
  /**
   * Inline Mode
   */
  inlineState?: boolean;
  /**
   * Save Content when before unload
   */
  onBeforeUnload?: (newModel: string) => void;
  /**
   * member name
   */
  getUserSelection?: (selectionInfo: SelectionInfo | null) => void;
  /**
   * prevent default enter keydown event
   */
  shouldPreventDefaultEnterKeyEvent?: boolean;
  /**
   * customized keydown event handler binding to already defined default callback of Froala Editor
   */
  handleDefaultEnterKeyEventWithNameTag?: (
    e: KeyboardEvent,
    selection: SelectionInfo | null
  ) => void;
  /**
   * set Editor instance from RealTimeFroalaEditor
   */
  setEditor?: React.Dispatch<
    React.SetStateAction<Partial<_FroalaEditor> | undefined>
  >;
  /**
   * Call function on image replace
   */
  imageOnReplace?: (files: File[], editor: any) => void;
}

const FroalaEditor: FC<FroalaEditorProps> = (props) => {
  const {
    className,
    licenseKey,
    config: configProp,
    tag,
    model,
    onModelChange,
    onManualControllerReady,
    disableBorder,
    imageBeforeUpload,
    fileBeforeUpload,
    inlineState = false,
    onBeforeUnload,
    setEditor,
    getUserSelection,
    handleDefaultEnterKeyEventWithNameTag,
    shouldPreventDefaultEnterKeyEvent,
    handleSaveContentManually,
    id,
    testId,
    imageOnReplace,
    ...other
  } = props;

  const classes = useStyles(props);

  const router = useRouter();
  const dispatch = useDispatch();
  if (!inlineState) {
    dispatch(setOpenStatus(true));
  }

  const wordLibrary = useSelector(getWordLibrary);

  const openStatus = useSelector(getOpenStatus);
  const changeStatus = useSelector(getChangeStatus);

  if (props.config) props.config.imageDefaultWidth = 0;

  const { key, events, ...config } = configProp || {};
  const editorRef = useRef<EditorRef>({
    controller: null,
  });
  const selectedImage = useRef("");
  const fileRef = useRef(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [triggerAutoListFormatOl, setTriggerAutoListFormatOl] =
    useState<boolean>(false);
  let hoverTimeout;

  useEffect(() => {
    if (triggerAutoListFormatOl) {
      const editor = editorRef.current.controller?.getEditor();
      if (editor) {
        const selection = editor.selection.get();
        const selectionText = selection.focusNode.wholeText;
        // Remove zero-width space character
        // selectionText = selectionText.replace(/\u200B/g, "");

        if (selectionText) {
          const orderNumberMatch = selectionText.match(/^\u200B?\d\./);
          const replaceText = selectionText.split(orderNumberMatch)[1];
          if (orderNumberMatch) {
            const range = selection.getRangeAt(0);
            range.commonAncestorContainer.textContent = replaceText;
            setTriggerAutoListFormatOl(false);
          }
        } else {
          const selectionHtml = selection.focusNode.innerHTML;
          const aTagMatch = selectionHtml.match(/<a[^>]*>.*?<\/a>/);
          const aTag = aTagMatch ? aTagMatch[0] : "";
          if (aTag) {
            const range = selection.getRangeAt(0);
            range.commonAncestorContainer.innerHTML = aTag;
            setTriggerAutoListFormatOl(false);
          }
        }
      }
    }
  }, [triggerAutoListFormatOl]);

  const [triggerAutoListFormatUl, setTriggerAutoListFormatUl] =
    useState<boolean>(false);
  useEffect(() => {
    if (triggerAutoListFormatUl) {
      const editor = editorRef.current.controller?.getEditor();
      if (editor) {
        const selection = editor.selection.get();
        const selectionText = selection.focusNode.wholeText;
        // Remove zero-width space character
        // selectionText = selectionText.replace(/\u200B/g, "");

        if (selectionText) {
          const orderNumberMatch = selectionText.match(/^\u200B?-/);
          const replaceText = selectionText
            .split(orderNumberMatch)
            .slice(1)
            .join(orderNumberMatch);
          if (orderNumberMatch) {
            const range = selection.getRangeAt(0);
            range.commonAncestorContainer.textContent = replaceText;
            setTriggerAutoListFormatUl(false);
          }
        } else {
          const selectionHtml = selection.focusNode.innerHTML;
          const aTagMatch = selectionHtml.match(/<a[^>]*>.*?<\/a>/);
          const aTag = aTagMatch ? aTagMatch[0] : "";
          if (aTag) {
            const range = selection.getRangeAt(0);
            range.commonAncestorContainer.innerHTML = aTag;
            setTriggerAutoListFormatUl(false);
          }
        }
      }
    }
  }, [triggerAutoListFormatUl]);

  const handleBeforePopState = useCallback(() => {
    if (onBeforeUnload)
      onBeforeUnload(editorRef.current.controller?.getEditor().html.get());
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(
      "Are you sure to discard the editor changes?"
    );
    if (confirmed) {
      return true;
    }
    router.push(router?.asPath);
    return false;
  }, [onBeforeUnload, router]);

  const handleModelChange = (model) => {
    if (onModelChange) onModelChange(model);
    if (onModelChange) {
      if (model !== "") dispatch(setChangeStatus(true));
      else dispatch(setChangeStatus(false));
    }
  };

  useEffect(() => {
    const handleBeforeunload = async () => {
      if (onBeforeUnload)
        onBeforeUnload(editorRef.current.controller?.getEditor().html.get());
    };

    if (openStatus && changeStatus) {
      window.addEventListener("beforeunload", handleBeforeunload);
      router.beforePopState(handleBeforePopState);
    } else {
      window.removeEventListener("beforeunload", handleBeforeunload);
      router.beforePopState(() => true);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeunload);
      router.beforePopState(() => true);
    };
  }, [openStatus, changeStatus, onBeforeUnload, router, handleBeforePopState]);

  useEffect(() => {
    if (editorRef) {
      setupCustomLinkInsert(editorRef);
      setupCustomTextColorPicker(editorRef);
      setupCustomBackgroundColorPicker(editorRef);
      customH1Tag(editorRef);
      customH2Tag(editorRef);
      customDeleteRow(editorRef);
      customCheckBox(editorRef);
      registerImageAlign(editorRef, "left");
      registerImageAlign(editorRef, "right");
      registerImageAlign(editorRef, "center");
      registerImageReplace(editorRef, fileRef);
      setupCustomQuickInsertButtonFile(
        editorRef,
        wordLibrary?.["insert file"] ?? "插入檔案"
      );
      setupCustomQuickInsertButtonLink(
        editorRef,
        wordLibrary?.["insert link"] ?? "插入連結"
      );
      setupCustomStrikeThroughButton(
        editorRef,
        wordLibrary?.["strike through"] ?? "刪除線(Ctrl+Shift+S)"
      );

      // custom quick insert button setting with insertVideo toolbar plugin - Recommended Approach
      const editor = editorRef.current.controller?.getEditor();
      _FroalaEditor.RegisterQuickInsertButton("video", {
        icon: "insertVideo",
        requiredPlugin: "video",
        title: "Insert Video",
        undo: false,
        callback: function callback() {
          editor.commands.exec("insertVideo");
          editor.popups.show("video.insert");
        },
      });
    }
  }, [editorRef, wordLibrary]);

  useEffect(() => {
    if (setEditor) setEditor(editorRef.current.controller?.getEditor());
  }, [setEditor]);

  const applyDynamicStyles = (element, level = 0) => {
    const hrElements = element?.querySelectorAll(":scope > hr");
    hrElements?.forEach((hr) => {
      const marginLeft = -24 * level;
      const width = `calc(100% + ${24 * level}px)`;
      hr.style.marginLeft = `${marginLeft}px`;
      hr.style.width = width;
      hr.style.boxSizing = "border-box";
    });

    const nestedUls = element?.querySelectorAll(":scope > ul > li");
    nestedUls?.forEach((ul) => {
      applyDynamicStyles(ul, level + 1);
    });

    const nestedOls = element?.querySelectorAll(":scope > ol > li");
    nestedOls?.forEach((ol) => {
      applyDynamicStyles(ol, level + 1);
    });

    const allTDs = element?.querySelectorAll("td");
    allTDs?.forEach((td) => {
      applyDynamicStyles(td, 0);
    });
  };

  function toggleButtonClass(
    button: HTMLElement | null,
    addClass: boolean,
    removeClass: HTMLElement | null = null
  ) {
    if (!button) return;
    setTimeout(() => {
      if (addClass) {
        button.classList.add("fr-active");
      } else {
        button.classList.remove("fr-active");
      }
      removeClass?.classList.remove("fr-active");
    }, 0);
  }

  const handleTablePaste = (htmlData, editor) => {
    let tableData = htmlData;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = tableData;
    const tds = tempDiv.querySelectorAll("td, th");
    tds.forEach((td) => {
      const listStack: HTMLElement[] = [];
      let currentLevel = 1;
      Array.from(td.children).forEach((child) => {
        if (child.nodeName === "DIV") {
          const list = child.querySelector("ul, ol") as HTMLElement | null;
          if (list) {
            const listClass = Array.from(list.classList).find((cls) =>
              cls.startsWith("listindent")
            );
            const listLevel = listClass
              ? parseInt(listClass.replace("listindent", ""), 10)
              : 1;
            if (listLevel > currentLevel) {
              if (listStack.length > 0) {
                const parentList = listStack[listStack.length - 1];
                if (!parentList) return;
                const lastItem = parentList.lastElementChild;
                if (lastItem) {
                  const parent =
                    list.tagName === "OL"
                      ? document.createElement("ol")
                      : document.createElement("ul");
                  parent.id = "isPasted3";
                  let currentParent = parent;
                  let diff = listLevel - currentLevel;
                  if (diff > 1) {
                    listStack.push(currentParent);
                  }
                  diff--;

                  while (diff > 1) {
                    const childUl =
                      list.tagName === "OL"
                        ? document.createElement("ol")
                        : document.createElement("ul");
                    currentParent.appendChild(childUl);
                    currentParent = childUl;
                    diff--;
                    listStack.push(currentParent);
                  }

                  if (listLevel - currentLevel === 1) {
                    lastItem.appendChild(list);
                    listStack.push(list);
                  } else {
                    currentParent.appendChild(list);
                    lastItem.appendChild(parent);
                    listStack.push(list);
                  }
                } else {
                  parentList.appendChild(list);
                }
              } else if (listStack.length === 0) {
                const parent =
                  list.tagName === "OL"
                    ? document.createElement("ol")
                    : document.createElement("ul");
                parent.id = "isPasted";
                let currentParent = parent;
                let diff = listLevel - currentLevel;
                while (diff > 1) {
                  const childUl =
                    list.tagName === "OL"
                      ? document.createElement("ol")
                      : document.createElement("ul");
                  currentParent.appendChild(childUl);
                  currentParent = childUl;
                  diff--;
                }
                currentParent.appendChild(list);
                td.appendChild(parent);
                listStack.push(list);
              } else {
                td.appendChild(list);
                listStack.push(list);
              }
            } else if (listLevel <= currentLevel) {
              while (listStack.length > 0 && currentLevel > listLevel) {
                listStack.pop();
                currentLevel--;
              }
              if (listStack.length > 0) {
                const parentList = listStack[listStack.length - 1];
                if (!parentList) return;
                Array.from(list.children).forEach((li) => {
                  parentList.appendChild(li);
                });
              } else {
                let level = listLevel;
                let currentParent =
                  list.tagName === "OL"
                    ? document.createElement("ol")
                    : document.createElement("ul");
                currentParent.id = "isPasted2";
                const topParent = currentParent;

                if (level > 1) {
                  listStack.push(currentParent);
                }
                level--;
                while (level > 1) {
                  const childUl =
                    list.tagName === "OL"
                      ? document.createElement("ol")
                      : document.createElement("ul");
                  currentParent.appendChild(childUl);
                  currentParent = childUl;
                  level--;
                  listStack.push(currentParent);
                }
                if (listLevel === 1) {
                  td.appendChild(list);
                  listStack.push(list);
                } else {
                  currentParent.appendChild(list);
                  td.appendChild(topParent);
                  listStack.push(list);
                }
              }
            }
            currentLevel = listLevel;
            child.remove();
          } else {
            td.appendChild(child);
            listStack.length = 0;
            currentLevel = 1;
          }
        }
      });
    });
    tableData = tempDiv.innerHTML;
    editor.html.insert(tableData);
    return false;
  };

  const pasteIntoCodeBlock = (htmlData, selectedBlock) => {
    let codeBlockData = htmlData;

    if (selectedBlock && selectedBlock.tagName === "PRE") {
      codeBlockData = codeBlockData.replace(/style="[^"]*"/gi, (match) => {
        const updatedStyle = match
          .replace(/font-family:[^;]+;?/gi, "")
          .replace(/background-color:[^;]+;?/gi, "")
          .trim();
        const cleanedStyle = updatedStyle.replace(/;"/g, '"');
        return cleanedStyle === 'style=""' ? "" : cleanedStyle;
      });
      selectedBlock.innerHTML = codeBlockData;
    }
  };

  function applyOrRemoveBackground(editor, node, color, transparentColor) {
    let isBackground = true;
    const { backgroundColor } = node.style;

    if (
      !backgroundColor ||
      backgroundColor === "rgba(0, 0, 0, 0)" ||
      backgroundColor === "transparent"
    ) {
      isBackground = false;
    }

    if (isBackground) {
      editor.colors.background(transparentColor);
    } else {
      editor.colors.background(color);
    }
  }

  return (
    <Box
      className={clsx(className, classes.root)}
      id={id}
      data-tid={testId}
      {...other}
    >
      <FroalaEditorComponent
        ref={(ref) => {
          editorRef.current.controller = ref;
        }}
        config={{
          // pastePlain: true,
          linkAlwaysBlank: true,
          key: licenseKey,
          toolbarSticky: false,
          attribution: false,
          language: "zh_tw",
          pluginsEnabled,
          toolbarButtons,
          toolbarButtonsSM,
          toolbarButtonsXS,
          quickInsertButtons,
          htmlIgnoreCSSProperties: ["position"],
          fontFamily,
          fontFamilySelection: true,
          heightMax: 500,
          shortcutsEnabled,
          tableInsertHelper: false,
          lineBreakerTags: [
            "hr",
            "form",
            "dl",
            "span.fr-video",
            ".fr-embedly",
            ".fr-img-caption",
          ],
          events: {
            "window.copy": (e) => {
              if (editorRef?.current?.controller) {
                const copiedData: string[][] = [];
                const selectedCells =
                  document?.querySelectorAll(".fr-selected-cell");

                if (selectedCells?.length) {
                  selectedCells.forEach((cell) => {
                    const tr = cell?.closest("tr");
                    if (tr) {
                      const { rowIndex } = tr;
                      const cellContent = cell.outerHTML || "";
                      if (!copiedData[rowIndex]) {
                        copiedData[rowIndex] = [];
                      }
                      if (cellContent) {
                        copiedData?.[rowIndex]?.push(cellContent);
                      }
                    }
                  });

                  const clipboardData = copiedData
                    .filter((row) => row !== null)
                    .map((row) => row.join("\t"))
                    .join("\n");

                  e.originalEvent.clipboardData.setData(
                    "text/plain",
                    clipboardData
                  );
                  e.preventDefault();
                }
              }
            },
            "paste.before": (event) => {
              if (editorRef.current.controller) {
                const editor = editorRef.current.controller.getEditor();
                const selection = editor.selection.text();
                const url = event.clipboardData.getData("text/plain");
                let htmlData = event.clipboardData.getData("text/html");
                const selectedBlock = editor.selection.blocks()[0];

                if (selectedBlock && selectedBlock.tagName === "PRE") {
                  const childNodes = selectedBlock.childNodes;
                  let isTextNode = false;
                  event.preventDefault();

                  for (let i = 0; i < childNodes.length; i++) {
                    if (childNodes[i].nodeType === Node.TEXT_NODE) {
                      const textNode = childNodes[i];
                      const pTag = document.createElement("p");
                      pTag.textContent = textNode.textContent;
                      selectedBlock.replaceChild(pTag, textNode);
                      isTextNode = true;
                    }
                  }
                  if (!isTextNode) {
                    pasteIntoCodeBlock(htmlData, selectedBlock);
                    editor.selection.setAtEnd(selectedBlock);
                    editor.selection.restore();
                    return false;
                  }
                  return false;
                }

                if (
                  (url.startsWith("<td") && url.includes("</td>")) ||
                  (url.startsWith("<th") && url.includes("</th>"))
                ) {
                  const rows = url.split("\n");

                  if (rows) {
                    const cells = rows.map((row: string) => row.split("\t"));
                    const selectedblock = editor.selection.blocks()[0];
                    const selectedCell =
                      selectedblock.closest("td") ||
                      selectedblock.closest("th");

                    if (selectedCell) {
                      const table = selectedCell.closest(
                        "table"
                      ) as HTMLTableElement;

                      if (table && table.rows) {
                        const selectedRowIndex = (
                          selectedCell.closest("tr") as HTMLTableRowElement
                        ).rowIndex;
                        const selectedCellIndex = Array.from(
                          (selectedCell.parentNode as HTMLTableRowElement)
                            .children
                        ).indexOf(selectedCell);

                        cells.forEach((rowCells, rowIndex) => {
                          let row = undefined as
                            | HTMLTableRowElement
                            | undefined;

                          if (selectedRowIndex + rowIndex < table.rows.length) {
                            row = table.rows[selectedRowIndex + rowIndex];
                          } else {
                            row = table.insertRow(-1);
                            for (
                              let i = 0;
                              i < table.rows[0]!.cells.length;
                              i++
                            ) {
                              const cell = row.insertCell(-1);
                              if (row?.parentNode?.nodeName === "THEAD") {
                                cell.outerHTML = "<th></th>";
                              }
                            }
                          }

                          rowCells.forEach((cell, cellIndex) => {
                            if (row) {
                              if (
                                selectedCellIndex + cellIndex >=
                                row.cells.length
                              ) {
                                for (let i = 0; i < table.rows.length; i++) {
                                  const cell = table.rows[i]!.insertCell(-1);
                                  if (
                                    table.rows[i]!.parentNode?.nodeName ===
                                    "THEAD"
                                  ) {
                                    cell.outerHTML = "<th></th>";
                                  }
                                }
                              }

                              row.deleteCell(selectedCellIndex + cellIndex);

                              if (
                                selectedCell.tagName === "TH" &&
                                row.parentNode?.nodeName === "THEAD"
                              ) {
                                const newCell = document.createElement("th");
                                newCell.innerHTML = cell;
                                const refChild =
                                  row.children[selectedCellIndex + cellIndex] ||
                                  null;
                                row.insertBefore(newCell, refChild);
                              } else if (
                                row.parentNode?.nodeName === "TBODY" ||
                                row.parentNode?.nodeName === "TFOOT"
                              ) {
                                const newCell = row.insertCell(
                                  selectedCellIndex + cellIndex
                                );
                                newCell.outerHTML = cell;
                              }
                            }
                          });
                        });
                      }
                    } else if (url.startsWith("<td") || url.startsWith("<th")) {
                      editor.html.insert(url);
                    }
                    event.preventDefault();
                  }
                } else if (url.startsWith("http") && selection) {
                  const html = `<a target="_blank" href="${url}">${selection}</a>`;
                  editor.html.insert(html);
                } else if (url.startsWith("http") && !selection) {
                  const html = `<a target="_blank" href="${url}">${url}</a>`;
                  editor.html.insert(html);
                }
                if (htmlData?.includes("<div><table")) {
                  return handleTablePaste(htmlData, editor);
                }
                if (htmlData?.includes("<ul") || htmlData?.includes("<ol")) {
                  htmlData = htmlData.replace(/style="[^"]*"/g, (match) => {
                    const listStyleTypeMatch = match.match(
                      /list-style-type: [^;]+;?/
                    );
                    return listStyleTypeMatch
                      ? `style="${listStyleTypeMatch[0]}"`
                      : 'style=""';
                  });
                  htmlData = htmlData.replace(/<p[^>]*><br[^>]*>/g, "");
                  const startFragment = "<!--StartFragment-->";
                  const endFragment = "<!--EndFragment-->";

                  const start =
                    htmlData.indexOf(startFragment) + startFragment.length;
                  const end = htmlData.indexOf(endFragment);

                  if (!/Mac|iPod|iPhone|iPad/i.test(navigator.userAgent))
                    htmlData = htmlData.substring(start, end).trim();
                  editor.html.insert(htmlData);
                  return false;
                }
              }
              return true;
            },
            "paste.after": () => {
              const pastedElements =
                document.querySelectorAll("[id='isPasted']");
              pastedElements.forEach((element) => {
                const h1 = document.createElement("h1");
                h1.setAttribute("style", "font-size: 40px !important;");
                h1.innerHTML = element.innerHTML;
                element.replaceWith(h1);
              });
              const unwantedLinks =
                document.querySelectorAll('a[id="isPasted"]');
              unwantedLinks.forEach((link) => {
                link.remove();
              });
            },
            "commands.before": (cmd) => {
              if (cmd === "insertHR") {
                if (editorRef.current.controller) {
                  const editor = editorRef.current.controller.getEditor();
                  const selectionEl = editor.selection.blocks()[0];
                  const selection = editor.selection.get();
                  const text = selection.focusNode.textContent;

                  // Check if the selected element is a <p> tag with content '--'
                  if (
                    selectionEl.tagName !== "TD" &&
                    selectionEl.tagName !== "TH" &&
                    selectionEl.tagName !== "LI" &&
                    (selectionEl.textContent === "-" ||
                      selectionEl.textContent === "--")
                  ) {
                    selectionEl.parentNode.removeChild(selectionEl);
                  } else if (text === "-" || text === "--") {
                    selection.focusNode.textContent = "";
                  } else if (text.startsWith("--")) {
                    selection.focusNode.textContent = text.replace("--", "");
                  } else if (text.startsWith("-")) {
                    selection.focusNode.textContent = text.replace("-", "");
                  }
                }
              }
              return true;
            },
            "commands.after": (cmd, p1, p2) => {
              if (
                cmd === "tableColumns" ||
                cmd === "tableRows" ||
                cmd === "h1" ||
                cmd === "h2"
              ) {
                calculateTableInsertButtons(editorRef);
              }
              if (cmd === "undo" || cmd === "redo") {
                const divs = document.querySelectorAll(
                  ".table-child div, .table-child button"
                );
                divs.forEach((div) => {
                  div.remove();
                });
              }
              if (cmd === "indent") {
                if (editorRef.current.controller) {
                  const editor = editorRef.current.controller.getEditor();
                  const selectionEls = editor.selection.blocks();
                  const { parentNode } = selectionEls[0];
                  let pParent = parentNode.parentNode;
                  if (pParent.nodeName === "LI") pParent = pParent.parentNode;
                  if (
                    pParent &&
                    pParent.nodeName === "OL" &&
                    parentNode.nodeName === "OL"
                  ) {
                    const styles = window.getComputedStyle(pParent);
                    const listStyleTypeOfPParent =
                      styles.getPropertyValue("list-style-type");
                    switch (listStyleTypeOfPParent) {
                      case "decimal":
                        parentNode.style.listStyleType = "lower-alpha";
                        break;
                      case "lower-alpha":
                        parentNode.style.listStyleType = "lower-roman";
                        break;
                      case "lower-roman":
                        // parentNode.style.listStyleType = "decimal";
                        break;
                      default:
                        break;
                    }
                  }
                  if (
                    pParent &&
                    pParent.nodeName === "UL" &&
                    parentNode.nodeName === "UL"
                  ) {
                    const styles = window.getComputedStyle(pParent);
                    const listStyleTypeOfPParent =
                      styles.getPropertyValue("list-style-type");
                    switch (listStyleTypeOfPParent) {
                      case "disc":
                        parentNode.style.listStyleType = "circle";
                        break;
                      case "circle":
                        parentNode.style.listStyleType = "square";
                        break;
                      case "square":
                        parentNode.style.listStyleType = "disc";
                        break;
                      default:
                        break;
                    }
                  }
                }
              }
              if (cmd === "outdent") {
                if (editorRef.current.controller) {
                  const editor = editorRef.current.controller.getEditor();
                  const selectionEls = editor.selection.blocks();
                  const { parentNode } = selectionEls[0];
                  let pParent = parentNode.parentNode;
                  if (pParent.nodeName === "LI") pParent = pParent.parentNode;
                  if (
                    pParent &&
                    pParent.nodeName === "OL" &&
                    parentNode.nodeName === "OL"
                  ) {
                    const styles = window.getComputedStyle(pParent);
                    const listStyleTypeOfPParent =
                      styles.getPropertyValue("list-style-type");
                    switch (listStyleTypeOfPParent) {
                      case "decimal":
                        parentNode.style.listStyleType = "lower-alpha";
                        break;
                      case "lower-alpha":
                        parentNode.style.listStyleType = "lower-roman";
                        break;
                      case "lower-roman":
                        // parentNode.style.listStyleType = "decimal";
                        break;
                      default:
                        break;
                    }
                  }
                }
              }
              if (cmd === "insertHR" && p1 === "A" && p2 === "2") {
                if (editorRef.current.controller) {
                  const editor = editorRef.current.controller.getEditor();
                  editor.toolbar.hide();
                }
              }
              if (cmd === "tableRemoveCell") {
                const tableToolbar = Array.from(
                  document.getElementsByClassName(
                    "fr-popup"
                  ) as unknown as HTMLElement[]
                ).find((tableToolbar) =>
                  tableToolbar.querySelector('[data-cmd="tableCellBackground"]')
                );
                if (tableToolbar) tableToolbar.style.display = "none";
                const divs = document.querySelectorAll(
                  ".table-child div, .table-child button"
                );
                divs.forEach((div) => {
                  div.remove();
                });
                calculateTableInsertButtons(editorRef);
                return false;
              }
              return true;
            },

            "toolbar.show": () => {
              if (editorRef.current.controller) {
                const editor = editorRef.current.controller.getEditor();
                const element = editor.selection.element();
                const toolbar = $(".fr-toolbar");
                const toolbarHeight =
                  $(".fr-toolbar").height() || $(".fr-toolbar").eq(1).height();
                let size = toolbarHeight;
                if (toolbarHeight === 48) size = 55;
                else if (toolbarHeight === 144) size = 160;
                else size = 110;

                const toolbarStyle = $(element);
                if (toolbar[1])
                  toolbar[1].style.marginTop = `-${
                    +toolbarStyle.css("font-size").split("px")[0] + size
                  }px`;
                else
                  toolbar[0].style.marginTop = `-${
                    +toolbarStyle.css("font-size").split("px")[0] + size
                  }px`;

                const toolbarEls = document.querySelectorAll(
                  ".fr-toolbar.fr-inline"
                ) as unknown as HTMLElement;

                if (toolbarEls && toolbarEls[1]) {
                  const selectedblock = editor.selection.blocks()[0];
                  if (selectedblock) {
                    const closestLiElement = selectedblock.closest(
                      ".custom-checkbox-li"
                    ) as HTMLElement;
                    const checkboxButton = toolbarEls[1].querySelector(
                      'button[data-cmd="checkbox"]'
                    );
                    const ulButton = toolbarEls[1].querySelector(
                      'button[data-cmd="formatUL"]'
                    );
                    if (closestLiElement && checkboxButton && ulButton) {
                      toggleButtonClass(checkboxButton, true, ulButton);
                    }
                    const h1Button = toolbarEls[1].querySelector(
                      'button[data-cmd="h1"]'
                    );
                    const h2Button = toolbarEls[1].querySelector(
                      'button[data-cmd="h2"]'
                    );
                    const closestH1 = selectedblock.closest("h1");
                    const closestH2 = selectedblock.closest("h2");
                    toggleButtonClass(h1Button, !!closestH1);
                    toggleButtonClass(h2Button, !!closestH2);
                  }
                }
              }
            },
            "image.removed": function ($img) {
              // Do something here.
              // this is the editor instance.
              console.log("image.removed", $img);
            },
            "image.loaded": function ($img) {
              // Do something here.
              // this is the editor instance.
              console.log("image.loaded", $img);
            },
            "image.inserted": async ($img, response) => {
              console.log("image inserted", $img, response);
              if (editorRef.current.controller && imageBeforeUpload) {
                const editor = editorRef.current.controller.getEditor();
                console.log("image.inserted img", $img);
                const src = $img.attr("src");
                // Handle inserted image for dragged and drop
                if (src.startsWith("blob:")) {
                  const file = await convertUrl2File(src, "draged-image");
                  imageBeforeUpload(Array.from([file]), editor, $img);
                }
              }
            },
            "image.replaced": ($img, response) => {
              console.log("image replaced", $img, response);
            },
            "image.beforePasteUpload": async (img) => {
              if (editorRef.current.controller && imageBeforeUpload) {
                const editor = editorRef.current.controller.getEditor();
                if (img.getAttribute("data-fr-image-pasted")) {
                  const { src } = img;
                  if (src.startsWith("data:")) {
                    const file = await convertUrl2File(src, "pasted-image");
                    // Convert img DOM element to jQuery object
                    const $img = $(img);
                    imageBeforeUpload(Array.from([file]), editor, $img);
                  }
                }
              }
            },
            "image.beforeUpload": (images: FileList) => {
              if (editorRef.current.controller && imageBeforeUpload) {
                const editor = editorRef.current.controller.getEditor();
                const selectedImage = editor.image.get();
                // check if the images are correct File type
                if (
                  Array.from(images).every(
                    (img) =>
                      img instanceof File && img.type.startsWith("image/")
                  )
                ) {
                  imageBeforeUpload(Array.from(images), editor, selectedImage);
                }
              }
              return false;
            },
            "file.beforeUpload": (files: FileList) => {
              if (editorRef.current.controller && fileBeforeUpload) {
                const editor = editorRef.current.controller.getEditor();
                fileBeforeUpload(Array.from(files), editor);
              }
              return false;
            },
            "image.resizeEnd": () => {
              selectedImage.current = "";
            },
            "popups.show.video.insert": () => {
              const videoToolbar = Array.from(
                document.getElementsByClassName(
                  "fr-popup"
                ) as unknown as HTMLElement[]
              ).find((imgToolbar) =>
                imgToolbar.querySelector('[data-cmd="videoBack"]')
              );
              videoToolbar?.classList.add("dark-theme");
              videoToolbar?.classList.add("fr-video-popup");
            },
            "popups.show.image.edit": () => {
              const editor = editorRef.current?.controller?.getEditor();
              if (!editor) return;

              const imageToolbar = Array.from(
                document.getElementsByClassName(
                  "fr-popup"
                ) as unknown as HTMLElement[]
              ).find((imgToolbar) =>
                imgToolbar.querySelector('[data-cmd="imageAlignRight"]')
              );
              imageToolbar?.classList.add("dark-theme");

              const position = editor?.position?.getBoundingRect();
              const absoluteTop = position.top + window.scrollY - 80;
              imageToolbar?.style.setProperty(
                "top",
                `${absoluteTop}px`,
                "important"
              );
            },
            "popups.show.table.edit": () => {
              if (editorRef.current.controller) {
                const editor = editorRef.current.controller.getEditor();
                const selectedblock = editor.selection.blocks()[0];
                if (!selectedblock) return;
                const table = selectedblock.closest("table");
                if (!table) return;
                const tableToolbar = Array.from(
                  document.getElementsByClassName(
                    "fr-popup"
                  ) as unknown as HTMLElement[]
                ).find((tableToolbar) =>
                  tableToolbar.querySelector('[data-cmd="tableCellBackground"]')
                );
                if (!tableToolbar) return;

                if (table) {
                  const firstSelectedCell =
                    table.querySelector(".fr-selected-cell");
                  if (firstSelectedCell) {
                    const cellRect = firstSelectedCell.getBoundingClientRect();
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
                }
              }
            },
            contentChanged: () => {
              const editor = editorRef.current.controller?.getEditor();
              const content = editor?.$el[0];

              if (!content) return;
              const tables = content.querySelectorAll("table");

              tables.forEach((table) => {
                const parentTable = table.parentElement;
                if (
                  parentTable &&
                  (parentTable.tagName === "TD" || parentTable.tagName === "TH")
                ) {
                  table.remove();
                }
              });
              const nonEditableElements =
                content.querySelectorAll(".fr-non-editable");
              nonEditableElements.forEach((element) => {
                const parentCell = element.parentElement;
                if (
                  parentCell &&
                  (parentCell.tagName === "TD" || parentCell.tagName === "TH")
                ) {
                  element.remove();
                }
              });
              applyDynamicStyles(content);
              if (handleSaveContentManually) handleSaveContentManually();
            },
            blur: () => {
              selectedImage.current = "";
            },
            mousedown: () => {
              const imageEditPopup = document.querySelector(
                ".fr-image-resizer.fr-active"
              );
              if (!imageEditPopup) {
                selectedImage.current = "";
              }
            },
            "table.inserted": () => calculateTableInsertButtons(editorRef),
            "table.resized": () => calculateTableInsertButtons(editorRef),
            click: (e) => {
              const linkElement = e.target.closest("a");
              if (linkElement?.tagName === "A") {
                const linkUrl = linkElement.href;
                window.open(linkUrl, "_blank");
              }
            },
            initialized: () => {
              const editor = editorRef.current.controller?.getEditor();
              if (editorRef.current.controller && editor) {
                calculateTableInsertButtons(editorRef);
              }

              setTimeout(() => {
                const toolbarEls = document.querySelectorAll(
                  ".fr-toolbar.fr-inline"
                ) as unknown as HTMLElement;
                if (toolbarEls && toolbarEls[1]) {
                  const toolbar = toolbarEls[1];
                  const firstButtonGroup = toolbar.querySelector(
                    ".fr-btn-grp.fr-float-left"
                  ) as HTMLElement;
                  if (toolbar.firstChild?.classList.contains("fr-separator"))
                    toolbar.removeChild(toolbar.firstChild);

                  if (
                    firstButtonGroup &&
                    !firstButtonGroup.nextElementSibling?.classList.contains(
                      "fr-separator"
                    )
                  ) {
                    const separator = document.createElement("div");
                    separator.className = "fr-separator fr-vs";
                    separator.setAttribute("role", "separator");
                    separator.setAttribute("aria-orientation", "vertical");
                    firstButtonGroup.insertAdjacentElement(
                      "afterend",
                      separator
                    );
                  }
                }
              }, 100);

              editor?.events.on("click", (e) => {
                if (e.target.tagName === "IMG") {
                  if (selectedImage.current === e.target.src) {
                    setImageUrl(e.target.src);
                    setIsOpen(true);
                  } else {
                    selectedImage.current = e.target.src;
                  }
                } else {
                  selectedImage.current = "";
                }
              });
              editor?.events.$on(
                editor.$el,
                "mouseover",
                (e) => {
                  const linkElement = e.target.closest("a");
                  if (linkElement?.tagName === "A") {
                    hoverTimeout = setTimeout(() => {
                      const link = linkElement.href;
                      editor.customLinkPlugin.showEditPopup(
                        "customLinkEdit",
                        link,
                        linkElement
                      );
                    }, 1000);
                  }
                },
                true
              );
              editor?.events.$on(
                editor.$el,
                "mouseout",
                (e) => {
                  const linkElement = e.target.closest("a");
                  if (linkElement?.tagName === "A") {
                    clearTimeout(hoverTimeout);
                  }
                },
                true
              );
              // Call this event-binding method inside the initialized event
              // with the last true argument of events.on().
              editor?.events.on(
                "keydown",
                (e) => {
                  /**
                   *  ---------  Froala Editor Enter Key press Bug Report -----------
                   *
                   * When there are multiple depthed DIV contents pasted in the editor view
                   *
                   * Enter Key-pressing will not find the root element of the view.
                   * So the cursor can not reach to the root element never and ever.
                   *
                   * This issue will cause further pasted contents can't be placed in user's wanted position correctly.
                   *
                   * This issue will be fixed in a custom solution here.
                   *
                   */

                  const selectedElement: HTMLElement | null =
                    editor.selection.element();
                  if (selectedElement && selectedElement.tagName === "BR") {
                    const parents: HTMLElement[] = [];
                    let currentElement: HTMLElement | null = selectedElement;
                    while (currentElement?.parentNode) {
                      currentElement = currentElement.parentNode as HTMLElement;
                      if (currentElement.nodeType !== Node.ELEMENT_NODE) {
                        break;
                      }
                      if (
                        currentElement.classList.contains("fr-element") &&
                        currentElement.classList.contains("fr-view")
                      ) {
                        break;
                      }
                      parents.push(currentElement);
                    }
                    parents.forEach((parent) => {
                      if (parent.tagName === "S") {
                        const pElement = document.createElement("p");
                        while (parent.firstChild) {
                          pElement.appendChild(parent.firstChild);
                        }
                        parent.parentNode?.replaceChild(pElement, parent);
                      }
                    });
                  }

                  if (editorRef.current.controller && e.which === 8) {
                    const editor = editorRef.current.controller.getEditor();
                    const element = editor.selection.element();
                    const { parentNode: selectedElementParent } = element;

                    if (element?.nodeName === "BR" && selectedElementParent) {
                      const parentLi = selectedElementParent.closest("li");

                      if (parentLi?.nodeName === "LI") {
                        if (
                          selectedElementParent &&
                          selectedElementParent.childNodes.length > 2 &&
                          selectedElementParent.firstChild.nodeName === "BR"
                        ) {
                          const { previousSibling } = element;

                          if (previousSibling && editor.selection) {
                            editor.selection.setAtEnd(previousSibling);
                            editor.selection.restore();
                            element.remove();
                            e.preventDefault();
                            return false;
                          }
                        }
                      }
                    }
                  }
                  if (!editor) return false;
                  const selectionBlocks = editor.selection.blocks();
                  const selectionEl = selectionBlocks[0];
                  const element = editor.selection.element();

                  const { parentNode: selectedElementParent } = element;
                  if (editorRef.current.controller && e.which === 13) {
                    if (element?.nodeName === "BR" && selectedElementParent) {
                      if (
                        selectedElementParent.nodeName === "TD" ||
                        selectedElementParent.nodeName === "TH"
                      ) {
                        const pElement = document.createElement("p");
                        selectedElementParent.insertBefore(pElement, element);
                        pElement.appendChild(element);
                        const newP = document.createElement("p");
                        newP.innerHTML = "<br>";
                        pElement.after(newP);
                        editor.selection.setAtEnd(newP);
                        editor.selection.restore();
                        e.preventDefault();
                        return false;
                      }
                    }

                    if (element?.nodeName === "BR" && selectedElementParent) {
                      const parentLi = selectedElementParent.closest("li");
                      if (parentLi?.nodeName === "LI") {
                        if (
                          selectedElementParent &&
                          selectedElementParent.childNodes.length > 1 &&
                          selectedElementParent.firstChild !== element &&
                          selectedElementParent.lastChild !== element
                        ) {
                          const newBR = document.createElement("br");
                          element.after(newBR);
                          editor.selection.setAtEnd(newBR);
                          editor.selection.restore();
                          e.preventDefault();
                          return false;
                        }

                        if (
                          selectedElementParent.childNodes.length === 2 &&
                          (element?.nextSibling?.nodeName === "UL" ||
                            element?.nextSibling?.nodeName === "OL")
                        ) {
                          parentLi.after(element.nextSibling);
                        }
                      }
                    }

                    if (
                      (element?.nodeName === "TD" ||
                        element?.nodeName === "TH") &&
                      selectedElementParent
                    ) {
                      if (selectedElementParent.nodeName === "TR") {
                        const pElement = document.createElement("p");
                        pElement.innerHTML = "<br>";

                        if (!element.innerHTML.trim()) {
                          const newP = document.createElement("p");
                          newP.innerHTML = "<br>";
                          element.appendChild(newP);
                          element.appendChild(pElement);
                        } else {
                          element.appendChild(pElement);
                        }
                        editor.selection.setAtEnd(pElement);
                        editor.selection.restore();
                        e.preventDefault();
                        return false;
                      }
                    }

                    if (selectionEl) {
                      const { parentNode } = selectionEl;
                      const { childNodes } = selectionEl;

                      let hasOnlyBrChildInCurrrentSelection = false;
                      // Check if the selected block has only one child and that child is a <br> tag
                      if (childNodes && typeof childNodes === "object") {
                        hasOnlyBrChildInCurrrentSelection =
                          childNodes.length === 1 && // Check if the selected block has only one child
                          childNodes?.[0]?.nodeName === "BR" && // Check if the child is a <br> tag
                          (selectionEl.nodeName === "DIV" ||
                            selectionEl.nodeName === "P");
                      }
                      // Check if the parent of the selected block is not the top-level div
                      if (
                        !parentNode?.className.includes("fr-element fr-view") &&
                        hasOnlyBrChildInCurrrentSelection
                      ) {
                        if (
                          selectionEl &&
                          selectionEl.parentNode &&
                          selectionEl === parentNode?.lastElementChild &&
                          parentNode &&
                          parentNode.nodeName !== "TD" &&
                          parentNode.nodeName !== "TH"
                        ) {
                          selectionEl.parentNode?.removeChild(selectionEl);
                        }

                        const newP = document.createElement("p");
                        newP.innerHTML = "<br>";

                        if (
                          parentNode &&
                          (parentNode.nodeName === "TD" ||
                            parentNode.nodeName === "TH")
                        ) {
                          parentNode.insertBefore(
                            newP,
                            selectionEl.nextSibling
                          );
                        } else {
                          parentNode?.after(newP);
                        }

                        // Move the cursor to the end of the last child
                        editor.selection.setAtEnd(newP);
                        editor.selection.restore();
                        e.preventDefault();
                        return false;
                      }
                    }
                  }

                  if (
                    editorRef.current.controller &&
                    e.shiftKey &&
                    e.which === 13
                  ) {
                    const editor = editorRef.current.controller.getEditor();
                    const element = editor.selection.element();
                    const { parentNode: selectedElementParent } = element;

                    if (element?.nodeName === "BR" && selectedElementParent) {
                      const parentLi = selectedElementParent.closest("li");

                      if (parentLi.nodeName === "LI") {
                        const newBR = document.createElement("br");
                        element.after(newBR);
                        editor.selection.setAtEnd(newBR);
                        editor.selection.restore();
                        e.preventDefault();
                        return false;
                      }
                    }
                  }
                  /**
                   *  ---------  Froala Editor Enter Key press Bug Fixed -----------
                   */

                  if (e.which === 13) {
                    // auto insertHRLine --------
                    const selection = editor.selection.get();
                    const { focusOffset } = selection;
                    const text = selection.focusNode.textContent;
                    if (focusOffset === 1 && /^-/.test(text)) {
                      editor.commands.exec("insertHR");
                      e.preventDefault();
                      return false;
                    }

                    // Name Tagging feature --------
                    const selectionInfo = getCaretPosition(editor);
                    if (
                      handleDefaultEnterKeyEventWithNameTag &&
                      selectionInfo?.range.endContainer.textContent !== ""
                    ) {
                      handleDefaultEnterKeyEventWithNameTag(e, selectionInfo);
                    }
                    // enter key evnet On Mac
                    if (/Mac|iPod|iPhone|iPad/i.test(navigator.userAgent)) {
                      const parentLi = selectedElementParent?.closest("li");
                      if (
                        element?.nodeName === "BR" &&
                        parentLi?.nodeName === "LI"
                      ) {
                        return false;
                      }
                      e.preventDefault();
                      editor.cursor.enter();
                      return false;
                    }
                    return false;
                  }
                  const isAppleDevice = /Mac|iPod|iPhone|iPad/i.test(
                    navigator.userAgent
                  );
                  const check = isAppleDevice ? e.metaKey : e.ctrlKey;

                  if (check && e.which === 69 && editor) {
                    const color =
                      localStorage.getItem("highlightColor") || "#fbdb6f";
                    const transparentColor = "#00FFFFFF";
                    const startElement = editor.selection.element();
                    const targetElement =
                      startElement?.tagName === "FONT"
                        ? startElement.closest("span") || startElement
                        : startElement;

                    if (targetElement) {
                      applyOrRemoveBackground(
                        editor,
                        targetElement,
                        color,
                        transparentColor
                      );
                    }
                    e.preventDefault();
                    return false;
                  }
                  if (e.shiftKey && e.which === 13) {
                    // Detect Shift+Enter
                    // Prevent the default Shift+Enter handling
                    // the default action is editor.cursor.enter(shift)
                    e.preventDefault();

                    // Insert your desired HTML. For example, a new paragraph with a break:
                    editorRef.current.controller?.getEditor().cursor.enter();

                    // Adjust any additional formatting you want to apply
                    // (e.g., add a class or inline style to the new paragraph to adjust line spacing)
                    return false;
                  }

                  // Check if tab key or shift+tab key is pressed
                  if (e.which === 9 || (e.shiftKey && e.which === 9)) {
                    const selectedblock = editor.selection.blocks()[0];
                    if (!selectedblock) return false;
                    const selectedCell = selectedblock.closest("li");
                    // Check if the selected block is a <li> element and its parent is a <td>
                    if (e.shiftKey && e.which === 9) {
                      const selectedblocksList = editor.selection.blocks();
                      const hasFirstLevelItem = selectedblocksList.some(
                        (selectedblock) => {
                          const parentLi =
                            selectedblock.closest("ul, ol").parentNode;
                          const isParentLi =
                            parentLi?.nodeName === "LI" ||
                            parentLi?.nodeName === "UL" ||
                            parentLi?.nodeName === "OL";
                          if (!isParentLi) {
                            return true;
                          }
                          return false;
                        }
                      );
                      if (!hasFirstLevelItem) {
                        editor.commands.exec("outdent");
                      }
                      e.preventDefault();
                      return false;
                    }
                    if (
                      selectedCell &&
                      selectedCell.nodeName === "LI" &&
                      selectedCell.closest("td")
                    ) {
                      if (!e.shiftKey && e.which === 9) {
                        editor.commands.exec("indent");
                      }
                      e.preventDefault();
                      return false;
                    }
                  }

                  return true;
                },
                true
              );
              editor?.events.on(
                "keyup",
                () => calculateTableInsertButtons(editorRef),
                true
              );
              editor?.events.on(
                "mouseup",
                () => calculateTableInsertButtons(editorRef),
                true
              );
              editor?.events.on(
                "keyup",
                (e) => {
                  if ((e.shiftKey && e.which === 50) || e.which !== 13) {
                    setTimeout(() => {
                      const selectionInfo = getCaretPosition(editor);
                      if (getUserSelection) getUserSelection(selectionInfo);
                    }, 0);
                  }
                },
                true
              );
            },
            keydown: (e) => {
              if (editorRef.current.controller) {
                const editor = editorRef.current.controller.getEditor();
                if (
                  (e.ctrlKey ||
                    (/Mac|iPod|iPhone|iPad/i.test(navigator.userAgent) &&
                      e.metaKey)) &&
                  e.which === 88
                ) {
                  const toolbarEls = document.querySelectorAll(
                    ".fr-toolbar.fr-inline"
                  ) as unknown as HTMLElement;
                  if (toolbarEls && toolbarEls[1]) {
                    const toolbarEl = toolbarEls[1] as HTMLElement;
                    toolbarEl.style.display = "none";
                  }
                }
                if (
                  (e.ctrlKey ||
                    (/Mac|iPod|iPhone|iPad/i.test(navigator.userAgent) &&
                      e.metaKey)) &&
                  e.shiftKey &&
                  e.which === 83
                ) {
                  editor.commands.exec("strikeThrough");
                }
                if (e.which === 32) {
                  const selection = editor.selection.get();
                  const { focusOffset } = selection;
                  const text = selection.focusNode.textContent.toString();
                  const cursorOccurance = text.includes("\u200B")
                    ? focusOffset - 1
                    : focusOffset;

                  // Remove zero-width space character
                  // text = text.replace(/\u200B/g, "");

                  // ordered list trigger
                  if (
                    (cursorOccurance === 2 || cursorOccurance === 1) &&
                    /^\u200B?\d\./.test(text)
                  ) {
                    const element = editor.selection.element();
                    const liElement = element?.closest("li");
                    if (liElement?.tagName !== "LI") {
                      setTriggerAutoListFormatOl(true);
                      editor.lists.format("OL");
                      e.preventDefault();
                      return false;
                    }
                  }

                  // un-ordered list trigger
                  if (cursorOccurance === 1 && /^\u200B?-/.test(text)) {
                    const element = editor.selection.element();
                    const liElement = element?.closest("li");
                    if (liElement?.tagName !== "LI") {
                      setTriggerAutoListFormatUl(true);
                      editor.lists.format("UL");
                      e.preventDefault();
                      return false;
                    }
                  }
                }

                // horizontal line insert trigger
                if (e.which === 189) {
                  const selection = editor.selection.get();
                  const { focusOffset } = selection;
                  const text = selection.focusNode.textContent;
                  // Remove zero-width space character
                  // text = text.replace(/\u200B/g, "");

                  const cursorOccurance = text.includes("\u200B")
                    ? focusOffset - 1
                    : focusOffset;

                  if (cursorOccurance === 2 && /^\u200B?--/.test(text)) {
                    editor.commands.exec("insertHR");
                    e.preventDefault();
                    return false;
                  }
                }
              }
              return true;
            },
            destroy: () => {
              dispatch(setOpenStatus(false));
              dispatch(setChangeStatus(false));
            },
            ...events,
          },
          ...config,
        }}
        tag={tag}
        model={model}
        onModelChange={handleModelChange}
        onManualControllerReady={onManualControllerReady}
      />
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
      <input
        type="file"
        ref={fileRef}
        style={{ display: "none" }}
        onChange={(e) => {
          const editor = editorRef.current.controller?.getEditor();
          if (
            editorRef.current.controller &&
            imageOnReplace &&
            e.target.files
          ) {
            imageOnReplace(Array.from(e.target.files), editor);
          }
        }}
      />
    </Box>
  );
};

export default FroalaEditor;
