import _FroalaEditor from "froala-editor";

export function setupCustomQuickInsertButtonLink(editorRef, buttonTooltip) {
  _FroalaEditor.DefineIcon("customQuickInsertLinkButtonIcon", {
    NAME: "icon_link",
    SVG_KEY: "insertLink",
  });

  _FroalaEditor.RegisterQuickInsertButton("customQuickInsertLinkButton", {
    // Icon name.
    icon: "customQuickInsertLinkButtonIcon",

    // Tooltip.
    title: buttonTooltip,

    // Callback for the button.
    callback() {
      // Call any editor method here.
      const editor = editorRef.current.controller?.getEditor();
      editor.commands.exec("insertLink");
    },

    // Save changes to undo stack.
    undo: true,

    // Focus the editor after the callback
    focus: true,

    // Refresh the button after callback
    refreshAfterCallback: true,
  });
}
