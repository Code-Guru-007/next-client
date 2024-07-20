// import getDeviceInfo from "@eGroupAI/utils/getDeviceInfo";
import _FroalaEditor from "froala-editor";
import $ from "jquery";

export function customH1Tag(editorRef) {
  _FroalaEditor.DefineIconTemplate(
    "h1Icon",
    '<svg viewBox="0 0 24 24" fill="none" width="24" height="24" role="presentation" focusable="false"><path d="M18.878 17.74v-5.16H17.8c-.108.694-.432 1.027-1.297 1.081v1.017h1.053v3.061h-1.523V19h4.294v-1.26h-1.449ZM13 11.5H5.5v-6H4V19h1.5v-6H13v6h1.5V5.5H13v6Z" fill="currentColor" vector-effect="non-scaling-stroke"></path></svg>'
  );
  _FroalaEditor.DefineIcon("h1", {
    NAME: "h1",
    template: "h1Icon",
  });
  _FroalaEditor.RegisterCommand("h1", {
    title: "切換大型標題",
    undo: false,
    focus: false,
    callback() {
      const editor = editorRef?.current.controller?.getEditor();
      const currentBlock = editor.selection.blocks()[0];
      if (!currentBlock) return;
      const isHeading = currentBlock.tagName.toLowerCase() === "h1";

      if (isHeading) {
        editor.paragraphFormat.apply("N");
      } else {
        editor.paragraphFormat.apply("h1");
      }
      editor.events.trigger("contentChanged");
    },
  });
}

export function customH2Tag(editorRef) {
  _FroalaEditor.DefineIconTemplate(
    "h2Icon",
    '<svg viewBox="0 0 24 24" fill="none" width="24" height="24" role="presentation" focusable="false"><path d="M18.7 16.669c1.431-.424 2.476-.928 2.476-2.197 0-1.162-.838-2.017-2.719-2.017-2 0-3.016.864-3.016 2.404v.162h1.342v-.126c0-.855.55-1.323 1.647-1.323.954 0 1.405.324 1.405.936 0 .65-.793.918-1.89 1.25-1.35.405-2.594.864-2.594 2.305V19h5.78v-1.198h-4.285c.054-.549.72-.791 1.854-1.133ZM12 11.5H4.5v-6H3V19h1.5v-6H12v6h1.5V5.5H12v6Z" fill="currentColor" vector-effect="non-scaling-stroke"></path></svg>'
  );
  _FroalaEditor.DefineIcon("h2", {
    NAME: "h2",
    template: "h2Icon",
  });
  _FroalaEditor.RegisterCommand("h2", {
    title: "切換中型標題",
    undo: false,
    focus: false,
    callback() {
      const editor = editorRef?.current.controller?.getEditor();
      const currentBlock = editor.selection.blocks()[0];
      if (!currentBlock) return;
      const isHeading = currentBlock.tagName.toLowerCase() === "h2";

      if (isHeading) {
        editor.paragraphFormat.apply("N");
      } else {
        editor.paragraphFormat.apply("h2");
      }
      editor.events.trigger("contentChanged");
    },
  });
}

export function customPreTag(editorRef) {
  _FroalaEditor.DefineIcon("pre", {
    NAME: "pre",
  });
  _FroalaEditor.RegisterCommand("pre", {
    title: "pre",
    undo: false,
    focus: false,
    callback() {
      const editor = editorRef?.current.controller?.getEditor();
      editor.paragraphFormat.apply("pre");
      editor.events.trigger("contentChanged");
    },
  });
}

export function customDeleteRow(editorRef) {
  _FroalaEditor.DefineIcon("tableRemoveCell", {
    NAME: "tableRemove",
  });
  _FroalaEditor.RegisterCommand("tableRemoveCell", {
    title: "刪除儲存格",
    icon: "tableRemove",
    undo: true,
    focus: true,
    callback() {
      const editor = editorRef?.current.controller?.getEditor();
      const blocks = editor.selection.blocks()[0];
      if (!blocks) return;
      const tableElement = blocks.closest("table");
      editor.selection.save();

      if (tableElement) {
        const allCells = tableElement.querySelectorAll("td, th");
        const selectedCells = Array.from(editor?.table?.selectedCells() || []);

        if (allCells.length === selectedCells.length) {
          const { parentElement } = tableElement;
          parentElement.removeChild(tableElement);
          editor.events.trigger("tableRemove");
        } else {
          const rowsToDelete = new Set();
          selectedCells.forEach((cell) => {
            const row = (cell as HTMLElement).parentElement;
            const rowCells = row?.querySelectorAll("td, th");
            if (!rowCells) return;

            const allRowCellsSelected = Array.from(rowCells).every((rowCell) =>
              selectedCells.includes(rowCell)
            );

            if (allRowCellsSelected) {
              rowsToDelete.add(row);
            }
          });

          rowsToDelete.forEach((row) => {
            (row as HTMLElement)?.parentElement?.removeChild(
              row as HTMLElement
            );
          });

          selectedCells.forEach((cell) => {
            if (!rowsToDelete.has((cell as HTMLElement).parentElement)) {
              (cell as HTMLElement).remove();
            }
          });
        }
      }
      editor.events.trigger("blur");
      setTimeout(() => {
        editor.selection.restore();
        editor.undo.saveStep();
        editor.events.trigger("focus");
        editor.events.trigger("contentChanged");
      }, 0);
    },
  });
}

export function customCheckBox(editorRef) {
  _FroalaEditor.DefineIconTemplate(
    "checkBoxIcon",
    '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m423.28-306.02 285.59-285.83-62.46-62.45-223.13 222.89L312.15-542.3l-62.45 62.45 173.58 173.83ZM202.87-111.87q-37.78 0-64.39-26.61t-26.61-64.39v-554.26q0-37.78 26.61-64.39t64.39-26.61h554.26q37.78 0 64.39 26.61t26.61 64.39v554.26q0 37.78-26.61 64.39t-64.39 26.61H202.87Zm0-91h554.26v-554.26H202.87v554.26Zm0-554.26v554.26-554.26Z"/></svg>'
  );
  _FroalaEditor.DefineIcon("checkbox", {
    NAME: "checkbox",
    template: "checkBoxIcon",
  });
  _FroalaEditor.RegisterCommand("checkbox", {
    title: "切換代辦事項",
    undo: false,
    focus: false,
    callback() {
      const editor = editorRef?.current.controller?.getEditor();
      const selection = editor.selection.ranges()[0];

      if (selection) {
        const parentElement = $(selection.startContainer).parent()[0];
        const parentInnerHtml = parentElement.innerHTML;
        const inputTag = $(parentElement).find("input")[0];
        if (
          inputTag &&
          inputTag.tagName.toLowerCase() === "input" &&
          inputTag.type.toLowerCase() === "checkbox"
        ) {
          $(inputTag).remove();
        } else {
          $(parentElement).html(`<input type="checkbox">${parentInnerHtml}`);
        }
      }
      editor.events.trigger("contentChanged");
    },
  });
}

export function registerImageAlign(editorRef, alignDirection) {
  const alignIcon = `image-align-${alignDirection}`;
  const alignCommand = `imageAlign${capitalizeFirstLetter(alignDirection)}`;

  _FroalaEditor.DefineIcon(alignIcon, {
    NAME: `align-${alignDirection}`,
    SVG_KEY: `align${capitalizeFirstLetter(alignDirection)}`,
  });

  let title;
  if (alignDirection === "left") {
    title = "圖片靠左";
  } else if (alignDirection === "center") {
    title = "圖片置中";
  } else {
    title = "圖片靠右";
  }

  _FroalaEditor.RegisterCommand(alignCommand, {
    title,
    icon: alignIcon,
    undo: false,
    focus: false,
    callback() {
      const editor = editorRef?.current.controller?.getEditor();
      editor.image.align(alignDirection);
      editor.events.trigger("contentChanged");
    },
  });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function registerImageReplace(editorRef, fileRef) {
  _FroalaEditor.DefineIcon("imageReplace", {
    NAME: "imageReplace",
    SVG_KEY: "replaceImage",
  });

  _FroalaEditor.RegisterCommand("imageReplaceNew", {
    title: "取代圖片",
    icon: "imageReplace",
    undo: true,
    focus: true,
    callback() {
      if (fileRef.current) {
        fileRef.current.accept = "image/*";
        fileRef.current.click();
      }
    },
  });
}
