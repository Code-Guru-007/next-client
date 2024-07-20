import _FroalaEditor from "froala-editor";

export function setupCustomStrikeThroughButton(
  editorRef,
  buttonTooltip?: string
) {
  _FroalaEditor.DefineIcon("customStrikeThroughButtonIcon", {
    NAME: "icon_link",
    SVG_KEY: "strikeThrough",
  });

  _FroalaEditor.RegisterCommand("customStrikeThroughButton", {
    // Icon name.
    icon: "customStrikeThroughButtonIcon",

    // Tooltip.
    title: buttonTooltip || "",

    // Callback for the button.
    callback() {
      // Call any editor method here.
      const editor = editorRef.current.controller?.getEditor();
      editor.commands.exec("strikeThrough");
    },

    // Save changes to undo stack.
    undo: true,

    // Focus the editor after the callback
    focus: true,

    // Refresh the button after callback
    refreshAfterCallback: true,
    toggle: true,
  });

  // Add the custom button to the toolbar.
  _FroalaEditor.DEFAULTS.toolbarButtons?.push("customStrikeThroughButton");

  // below register a custom shortcut not working since it looks like froala bug still not fixed
  // Register a custom shortcut for the command
  // _FroalaEditor.RegisterShortcut(
  //   83,
  //   "customStrikeThroughButton",
  //   undefined,
  //   "Ctrl+Shift+S",
  //   true,
  //   undefined
  // );
}
