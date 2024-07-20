import _FroalaEditor from "froala-editor";

// jQuery && Spectrum jQuery Plugin import required
// by Froala Editor custom multi color picker
import $ from "jquery";
// import "spectrum-colorpicker2/dist/spectrum.min";

/**
 * Custom Text Color Picker
 */
export function setupCustomTextColorPicker(editorRef) {
  _FroalaEditor.POPUP_TEMPLATES["customPlugin.popup.customTextColorPicker"] =
    "[_CUSTOM_LAYER_]";
  _FroalaEditor.PLUGINS.customPlugin = function (editor) {
    function saveSelection() {}

    function restoreSelection() {
      editor.selection.restore();
    }

    // Create custom popup.
    function initPopup(id) {
      // Load popup template.
      const template = {
        custom_layer: `<input type="text" class="${id}" id="${id}" />`,
      };

      // Create popup.
      const $popup = editor.popups.create(`customPlugin.popup.${id}`, template);
      return $popup;
    }

    // Show the popup
    function showPopup(id, currentColor, callback) {
      // Get the popup object defined above.
      let $popup = editor.popups.get(`customPlugin.popup.${id}`);

      // If popup doesn't exist then create it.
      // To improve performance it is best to create the popup when it is first needed
      // and not when the editor is initialized.
      if (!$popup) {
        $popup = initPopup(id);
      }
      // Set the editor toolbar as the popup's container.
      editor.popups.setContainer(`customPlugin.popup.${id}`, editor.$tb);

      // This will trigger the refresh event assigned to the popup.
      // editor.popups.refresh('customPlugin.popup');

      // This custom popup is opened by pressing a button from the editor's toolbar.
      // Get the button's object in order to place the popup relative to it.
      const $btn = editor.$tb.find(`.fr-command[data-cmd="${id}"]`);

      // Set the popup's position.
      const left = $btn.offset().left + $btn.outerWidth() / 2;
      const top =
        $btn.offset().top +
        (editor.opts.toolbarBottom ? 10 : $btn.outerHeight() - 10);

      // Show the custom popup.
      // The button's outerHeight is required in case the popup needs to be displayed above it.
      editor.popups.show(
        `customPlugin.popup.${id}`,
        left - 50,
        top,
        $btn.outerHeight()
      );

      saveSelection();
      const inputElement = $(`#${id}`).val(currentColor);

      // inputElement.on('change', function() {
      //  const color = $(this).val();
      //    restoreSelection();
      //  console.log("Color = " + color);
      //  callback(editor, color);
      //  hidePopup(id);
      // });

      $(inputElement).spectrum({
        type: "color",
        showInput: true,
        change(color) {
          restoreSelection();
          callback(editor, color ? color.toHexString() : "");
          hidePopup(id);
        },
      });
      inputElement.spectrum("show");
    }

    // Hide the custom popup.
    function hidePopup(id) {
      editor.popups.hide(`customPlugin.popup.${id}`);
    }
    return { showPopup, hidePopup };
  };
  _FroalaEditor.DefineIcon("textColorButtonIcon", {
    NAME: "textColor",
    SVG_KEY: "textColor",
  });
  _FroalaEditor.RegisterCommand("customTextColorPicker", {
    title: "Text Color Picker",
    icon: "textColorButtonIcon",
    undo: false,
    focus: false,
    plugin: "customPlugin",
    callback() {
      const editor = editorRef.current.controller?.getEditor();
      const currentColor = editor.doc.queryCommandValue("foreColor");
      editor.customPlugin.showPopup(
        "customTextColorPicker",
        currentColor,
        (editor, color) => {
          try {
            editor.colors.text(color);
            // eslint-disable-next-line no-empty
          } catch (error) {}
        }
      );
    },
  });
}
