import _FroalaEditor from "froala-editor";
import $ from "jquery";

/**
 * Custom Text Color Picker
 */

function getStoredHighlightColor() {
  return localStorage.getItem("highlightColor") || "";
}

function setStoredHighlightColor(color) {
  localStorage.setItem("highlightColor", color);
}

let lastAppliedBackgroundColor = getStoredHighlightColor();

export function setupCustomBackgroundColorPicker(editorRef) {
  _FroalaEditor.POPUP_TEMPLATES[
    "customBackgroundPlugin.popup.customBackgroundColorPicker"
  ] = "[_CUSTOM_LAYER_]";
  _FroalaEditor.PLUGINS.customBackgroundPlugin = function (editor) {
    function saveSelection() {
      editor.selection.save();
    }

    function restoreSelection() {
      editor.selection.restore();
    }

    function initPopup(id) {
      const template = {
        custom_layer: `
            <div class="fr-colorpicker">
              <div class="colorpicker-container"><button class="colorpicker" data-color="#ffd2ce" style="background-color: #ffd2ce;" title="Misty Rose"></button></div>
              <div class="colorpicker-container"><button class="colorpicker" data-color="#fbdb6f" style="background-color: #fbdb6f;" title="Goldenrod"></button></div>
              <div class="colorpicker-container"><button class="colorpicker" data-color="#cee86b" style="background-color: #cee86b;" title="Inchworm"></button></div>
              <div class="colorpicker-container"><button class="colorpicker" data-color="#d2deed" style="background-color: #d2deed;" title="Light Periwinkle"></button></div>
              <div class="colorpicker-container"><button class="colorpicker" data-color="#e3d8f7" style="background-color: #e3d8f7;" title="Lavender Blue"></button></div>
              <button class="colorpicker three-dots-colorpicker" title="More colors">
                <svg width="24px" height="24px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#000000" stroke-width="0.0002"><g id="SVGRepo_bgCarrier" stroke-width="0"/><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/><g id="SVGRepo_iconCarrier"> <path fill="#000000" fill-rule="evenodd" d="M3 8a2 2 0 100 4 2 2 0 000-4zm5 2a2 2 0 114 0 2 2 0 01-4 0zm7 0a2 2 0 114 0 2 2 0 01-4 0z"/> </g></svg>
              </button>
              <button class="colorpicker cross-colorpicker" data-color="#ffffff" title="Remove background color">
                  <svg viewBox="0 0 24 24" fill="none" class="dig-UIIcon dig-UIIcon--standard" width="24" height="24" role="presentation" focusable="false"><path d="M12 4c-5.159 0-8 2.841-8 8s2.841 8 8 8 8-2.841 8-8-2.841-8-8-8Zm0 14.5c-4.374 0-6.5-2.126-6.5-6.5 0-4.374 2.126-6.5 6.5-6.5 4.374 0 6.5 2.126 6.5 6.5 0 4.374-2.126 6.5-6.5 6.5Z" fill="currentColor" vector-effect="non-scaling-stroke"></path><path d="M14.475 8.465 12 10.94 9.525 8.465l-1.06 1.06L10.94 12l-2.475 2.475 1.06 1.06L12 13.06l2.475 2.476 1.06-1.061L13.06 12l2.476-2.475-1.061-1.06Z" fill="currentColor" vector-effect="non-scaling-stroke"></path></svg>
              </button>
          </div>`,
      };

      const $popup = editor.popups.create(
        `customBackgroundPlugin.popup.${id}`,
        template
      );
      return $popup;
    }

    const showPopup = (id, currentColor, callback) => {
      let $popup = editor.popups.get(`customBackgroundPlugin.popup.${id}`);

      if (!$popup) {
        $popup = initPopup(id);
      }
      saveSelection();

      const selection = editor.position.getBoundingRect();
      if (selection) {
        editor.popups.show(
          `customBackgroundPlugin.popup.${id}`,
          selection?.left - 80,
          selection?.top + window.scrollY - 100,
          selection?.height
        );
      }

      $popup
        .find(".colorpicker-container")
        .each(function (this: HTMLDivElement) {
          const $container = $(this);
          const $button = $container.find(".colorpicker");
          if ($button.data("color") === currentColor) {
            $container.css("border-bottom", `2px solid ${currentColor}`);
          } else {
            $container.css("border", "none");
          }
        });

      $popup
        .find(".colorpicker")
        .on("click", function (this: HTMLButtonElement) {
          const color = $(this).data("color");
          if (color !== undefined) {
            restoreSelection();
            callback(editor, color);
            hidePopup(id);
          }
        });

      $popup.find(".cross-colorpicker").on("click", () => {
        const color = "transparent";
        restoreSelection();
        callback(editor, color);
        hidePopup(id);
      });

      $popup
        .find(".three-dots-colorpicker")
        .on("click", function (this: HTMLButtonElement) {
          const $this = $(this);
          $this.spectrum({
            type: "color",
            showInput: false,
            clickoutFiresChange: false,
            change(color) {
              const selectedColor = color ? color.toHexString() : "";
              if (selectedColor) {
                restoreSelection();
                callback(editor, selectedColor);
                $this.spectrum("destroy");
                hidePopup(id);
              }
            },
          });
          setTimeout(() => {
            const spectrumOffset = $this.offset();
            $(".sp-container").css({
              top: spectrumOffset.top + $this.outerHeight() - 10,
              left: spectrumOffset.left,
            });
            $this.spectrum("show");
          }, 0);
        });
    };

    function hidePopup(id) {
      editor.popups.hide(`customBackgroundPlugin.popup.${id}`);
    }
    return { showPopup, hidePopup };
  };

  _FroalaEditor.DefineIcon("customBackgroundColorButtonIcon", {
    NAME: "backgroundColor",
    SVG_KEY: "backgroundColor",
  });

  _FroalaEditor.RegisterCommand("customBackgroundColorPicker", {
    title: "設定醒目提示顏色",
    icon: "customBackgroundColorButtonIcon",
    undo: false,
    focus: false,
    plugin: "customBackgroundPlugin",
    callback() {
      const editor = editorRef.current.controller?.getEditor();
      const currentColor = lastAppliedBackgroundColor;
      if (
        currentColor !== undefined &&
        currentColor !== "transparent" &&
        currentColor !== ""
      ) {
        editor.colors.background(currentColor);
      }
      editor.customBackgroundPlugin.showPopup(
        "customBackgroundColorPicker",
        currentColor,
        (editor, color) => {
          if (color === undefined || color === "transparent") {
            editor.colors.background("transparent");
            lastAppliedBackgroundColor = "";
            localStorage.removeItem("highlightColor");
          } else {
            editor.colors.background(color);
            lastAppliedBackgroundColor = color;
            setStoredHighlightColor(color);
          }
        }
      );
    },
  });
}
