import _FroalaEditor from "froala-editor";
import { getCaretPosition } from "./utils";

export function setupCustomLinkInsert(editorRef) {
  Object.assign(_FroalaEditor.POPUP_TEMPLATES, {
    "customLinkPlugin.popup.customLinkInsert": "[_CUSTOM_LAYER_]",
  });

  Object.assign(_FroalaEditor.POPUP_TEMPLATES, {
    "customLinkPlugin.popup.customLinkEdit": "[_CUSTOM_LAYER_]",
  });

  _FroalaEditor.PLUGINS.customLinkPlugin = function (editor) {
    function initPopup(id) {
      const template = {
        custom_layer: `<div class="fr-link-url-container"><input class="fr-link-url ${id}" value="" class="${id}" type="text"></div>`,
      };
      const popup = editor.popups.create(
        `customLinkPlugin.popup.${id}`,
        template
      );
      const input = popup[0].querySelector("input");
      input?.setAttribute("placeholder", "Enter link URL");

      input?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          editor.link.insert(input.value, "", {
            target: "_blank",
            rel: "nofollow",
          });
          input.value = "";
          editor.events.trigger("contentChanged");
          hidePopup(id);
        }
      });
      return popup;
    }

    function showPopup(id) {
      let popup = editor.popups.get(`customLinkPlugin.popup.${id}`);

      if (!popup) {
        popup = initPopup(id);
      }
      const selection = getCaretPosition(editor);
      editor.popups.show(
        `customLinkPlugin.popup.${id}`,
        selection?.position.x,
        selection?.position.y + window.scrollY - 54,
        selection?.position.h
      );
    }

    function initEditPopup(id, linkUrl) {
      const template = {
        custom_layer: `<div class="fr-link-url-container"><input class="fr-link-url ${id}" value="${linkUrl}" class="${id}" type="text"><button class="fr-link-button" data-cmd="removeLink"><svg viewBox="0 0 24 24"><path d="M8.817 7.403a1 1 0 0 0-1.414 1.414L10.586 12l-3.183 3.183a1 1 0 0 0 1.414 1.415L12 13.415l3.183 3.183a1 1 0 0 0 1.415-1.415L13.415 12l3.183-3.183a1 1 0 0 0-1.415-1.414L12 10.586 8.817 7.403z" fill-rule="evenodd"></path></svg></button></div>`,
      };
      const popup = editor.popups.create(
        `customLinkPlugin.popup.${id}`,
        template
      );
      const input = popup[0].querySelector("input");
      input?.setAttribute("placeholder", "Enter link URL");
      return popup;
    }

    function showEditPopup(id, linkUrl, linkElement) {
      let popup = editor.popups.get(`customLinkPlugin.popup.${id}`);

      if (!popup) {
        popup = initEditPopup(id, linkUrl);
      }

      const input = popup[0].querySelector("input");
      if (input) {
        input.value = linkUrl;
        input.removeEventListener("keydown", input.keydownHandler);

        input.keydownHandler = (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            linkElement.href = input.value;
            input.value = "";
            editor.events.trigger("contentChanged");
            hidePopup(id);
          }
        };
        input.addEventListener("keydown", input.keydownHandler);
      }

      const removeButton = popup[0].querySelector(
        '.fr-link-button[data-cmd="removeLink"]'
      );

      if (removeButton) {
        removeButton.removeEventListener("click", removeButton.clickHandler);

        removeButton.clickHandler = () => {
          const fragment = document.createDocumentFragment();
          while (linkElement.firstChild) {
            fragment.appendChild(linkElement.firstChild);
          }
          const parent = linkElement.parentNode;
          parent?.replaceChild(fragment, linkElement);
          editor.events.trigger("contentChanged");
          hidePopup(id);
        };
        removeButton.addEventListener("click", removeButton.clickHandler);
      }
      const selection = linkElement.getBoundingClientRect();
      editor.popups.show(
        `customLinkPlugin.popup.${id}`,
        selection?.left,
        selection?.top + window.scrollY - 54,
        selection?.height
      );
    }

    function hidePopup(id) {
      editor.popups.hide(`customLinkPlugin.popup.${id}`);
    }

    return { showPopup, hidePopup, showEditPopup };
  };

  _FroalaEditor.DefineIcon("insertLinkIcon", {
    NAME: "insertLink",
    SVG_KEY: "insertLink",
  });

  _FroalaEditor.RegisterCommand("customLinkInsert", {
    title: "建立連結",
    icon: "insertLinkIcon",
    undo: false,
    focus: false,
    plugin: "customLinkPlugin",
    callback() {
      const editor = editorRef.current.controller?.getEditor();
      editor.customLinkPlugin.showPopup("customLinkInsert");
    },
  });
}
