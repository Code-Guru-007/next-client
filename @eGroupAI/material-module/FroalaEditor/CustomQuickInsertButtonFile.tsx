import _FroalaEditor from "froala-editor";

export function setupCustomQuickInsertButtonFile(editorRef, buttonTooltip) {
  _FroalaEditor.DefineIcon("customQuickInsertFileButtonIcon", {
    NAME: "icon_file",
    SVG_KEY: "insertFile",
  });

  _FroalaEditor.RegisterQuickInsertButton("customQuickInsertFileButton", {
    // Icon name.
    icon: "customQuickInsertFileButtonIcon",

    // Tooltip.
    title: buttonTooltip,

    // Callback for the button.
    callback() {
      // Call any editor method here.
      const editor = editorRef.current.controller?.getEditor();
      // editor.commands.exec("insertFile");

      /**
       *
       *
       *
       *   ------ editor.commands.exec("insertFile"); ------
       *
       *
       *
       *    Because of the editor.command.exec("insertFile") above
       * will not be suitable for quick insert button actions in the editor.
       * This is because above command is just for the insert file button tool in froala editor buttonTools bar.
       * So we can use Froala's file upload API to upload the selected file(s) in the custom quick insert file button.
       *
       *    Fully customized file input process will be triggerred in callback method
       * of the custom quick insert file button
       *
       *
       *
       *
       *
       */

      // Create a file input element
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.style.display = "none"; // Hide the file input

      // Append it to the body temporarily
      document.body.appendChild(fileInput);
      fileInput.onchange = (e) => {
        // Get the selected file(s)
        const { files } = e.target as HTMLInputElement;
        if (files) {
          // TODO: Use Froala's file upload API to upload the selected file(s)
          // This might involve calling a method like editor.file.upload, passing the files
          editor.file.upload(files);
        }

        // Clean up: remove the input element after use
        document.body.removeChild(fileInput);
      };

      // Trigger a click on the file input to open the file dialog
      fileInput.click();
    },

    // Save changes to undo stack.
    undo: false,

    // Focus the editor after the callback
    focus: true,

    // Refresh the button after callback
    refreshAfterCallback: true,
  });
}
