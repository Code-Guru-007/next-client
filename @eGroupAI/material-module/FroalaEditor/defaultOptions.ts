export const textButtons = [
  "undo",
  "redo",
  "fontFamily",
  "paragraphFormat",
  "fontSize",
  "bold",
  "italic",
  "underline",
  // "strikeThrough", // default strikeThrough
  "customStrikeThroughButton",
  // "textColor", // default textColor of Froala
  "customTextColorPicker",
  // "backgroundColor", // default backgroundColor of Froala
  "customBackgroundColorPicker",
  "clearFormatting",
];
export const paragraphButtons = [
  "alignLeft",
  "alignCenter",
  "alignRight",
  "alignJustify",
  "lineHeight",
  "formatOL",
  "formatUL",
  "outdent",
  "indent",
];
export const richButtons = [
  "insertLink",
  "insertImage",
  "insertFile",
  "insertVideo",
  "insertTable",
];

export const stickyToolbarButtons = [
  "bold",
  "strikeThrough",
  "customBackgroundColorPicker",
  "customLinkInsert",
  "|",
  "h1",
  "h2",
  "formatUL",
  "formatOL",
  "checkbox",
];

export const toolbarButtons = [textButtons, paragraphButtons, richButtons];
export const toolbarButtonsSM = {
  moreText: {
    buttons: textButtons,
  },
  moreParagraph: {
    buttons: paragraphButtons,
  },
  moreRich: {
    buttons: richButtons,
  },
};

export const toolbarButtonsXS = {
  moreText: {
    buttons: textButtons,
  },
  moreParagraph: {
    buttons: paragraphButtons,
  },
  moreRich: {
    buttons: richButtons,
  },
};

export const pluginsEnabled = [
  "align",
  "colors",
  "draggable",
  "embedly",
  "emoticons",
  "entities",
  "file",
  "fontSize",
  "fontFamily",
  "fullscreen",
  "image",
  "lineBreaker",
  "lineHeight",
  "link",
  "lists",
  "paragraphFormat",
  "quickInsert",
  "quote",
  "save",
  "table",
  "url",
  "video",
  "wordPaste",
  "customPlugin",
  "customBackgroundPlugin",
  "customLinkPlugin",
];

export const quickInsertButtons = [
  "customQuickInsertLinkButton",
  "image",
  "customQuickInsertFileButton",
  "video",
  "table",
  "ul",
  "ol",
  "hr",
];

export const fontFamily = {
  Arial: "Arial",
  標楷體: "標楷體",
  "Microsoft JhengHei,微軟正黑體,sans-serif": "微軟正黑體",
};

export const shortcutsEnabled = [
  "show",
  "bold",
  "italic",
  "underline",
  // "strikeThrough", // removed default for the custom shorcut with shift key
  "indent",
  "outdent",
  "undo",
  "redo",
  "insertImage",
  "createLink",
];
