import _FroalaEditor from "froala-editor";
import AddIcon from "@mui/icons-material/Add";
import ReactDOMServer from "react-dom/server";

/**
 * Custom Table Columns & Rows Insert Plugin
 */
export function setUpCustomTableInsert(editorRef, table) {
  _FroalaEditor.PLUGINS.customTableInsertPlugin = function (editor, table) {
    if (!editor || !table) return;

    let tableChild = table.querySelector(".table-child");
    if (!tableChild) {
      tableChild = document.createElement("div");
      tableChild.style.position = "absolute";
      tableChild.classList.add("fr-non-editable");
      tableChild.classList.add("table-child");
      tableChild.setAttribute("contenteditable", "false");
      table.appendChild(tableChild);
    }

    const tableRect = table.getBoundingClientRect();
    const parentRect = tableChild.getBoundingClientRect();

    const firstRow = table.querySelector("tr");
    if (firstRow) {
      const cells = firstRow.querySelectorAll("td, th");
      const height = tableRect.height + 30;

      cells.forEach((cell, cellIndex) => {
        const existingCellDiv = tableChild.querySelector(
          `div[data-row="${0}"][data-cell="${cellIndex}"]`
        );

        const cellRect = cell.getBoundingClientRect();
        const leftPosition = cellRect.left - parentRect.left - 10;
        const topPosition = cellRect.top - parentRect.top - 32;

        if (existingCellDiv) {
          existingCellDiv.style.left = `${leftPosition}px`;
          existingCellDiv.style.top = `${topPosition}px`;
          existingCellDiv.style.height = `${height}px`;
          const markerDiv = existingCellDiv.querySelector(".table-add-marker");
          markerDiv.style.height = `${height}px`;
        } else {
          const div = createDiv("table-add-column-button", height);
          div.setAttribute("data-row", "0");
          div.setAttribute("data-cell", cellIndex);
          div.style.left = `${leftPosition}px`;
          div.style.top = `${topPosition}px`;

          const button = createButton(insertColumn);
          const markerDiv = createMarkerDiv(height);
          div.appendChild(button);
          div.appendChild(markerDiv);
          tableChild.appendChild(div);
        }
      });

      const lastCell = cells[cells.length - 1];

      const existingCellDiv = tableChild.querySelector(
        `div[data-last-cell-td="${0}"]`
      );
      const lastCellRect = lastCell.getBoundingClientRect();
      const leftPosition = lastCellRect.right - parentRect.left - 10;
      const topPosition = lastCellRect.top - parentRect.top - 32;

      if (existingCellDiv) {
        existingCellDiv.style.left = `${leftPosition}px`;
        existingCellDiv.style.top = `${topPosition}px`;
        existingCellDiv.style.height = `${height}px`;
        const markerDiv = existingCellDiv.querySelector(".table-add-marker");
        markerDiv.style.height = `${height}px`;
        const rightDiv = tableChild.querySelector(
          ".table-add-col-to-end-button"
        );
        rightDiv.style.height = `${tableRect.height}px`;
        rightDiv.style.left = `${tableRect.width - 1}px`;
        rightDiv.style.top = `${topPosition + 32}px`;
      } else {
        const div = createDiv("table-add-column-button", height);
        div.setAttribute("data-last-cell-td", "0");
        div.style.left = `${leftPosition}px`;
        div.style.top = `${topPosition}px`;

        const button = createButton(insertLastColumn);
        const markerDiv = createMarkerDiv(height);

        div.appendChild(button);
        div.appendChild(markerDiv);

        const rightDiv = document.createElement("button");
        rightDiv.style.height = `${tableRect.height}px`;
        rightDiv.style.left = `${tableRect.width - 1}px`;
        rightDiv.style.top = `${topPosition + 32}px`;
        rightDiv.style.position = "absolute";
        rightDiv.classList.add(
          "fr-non-editable",
          "table-add-col-to-end-button"
        );
        rightDiv.setAttribute("contenteditable", "false");
        rightDiv.innerHTML = ReactDOMServer.renderToStaticMarkup(<AddIcon />);

        rightDiv.addEventListener("click", () => insertLastColumn(rightDiv));

        tableChild.appendChild(rightDiv);
        tableChild.appendChild(div);
      }
    }

    const rows = table.querySelectorAll("tr");
    const width = tableRect.width + 30;

    rows.forEach((row, rowIndex) => {
      const existingCellDiv = tableChild.querySelector(
        `div[data-row-tr="${rowIndex}"]`
      );
      const rowRect = row.getBoundingClientRect();
      const leftPosition = rowRect.left - parentRect.left - 32;
      const topPosition = rowRect.top - parentRect.top - 10;

      if (existingCellDiv) {
        existingCellDiv.style.left = `${leftPosition}px`;
        existingCellDiv.style.top = `${topPosition}px`;
        existingCellDiv.style.width = `${width}px`;
        const markerDiv = existingCellDiv.querySelector(".table-add-marker");
        markerDiv.style.width = `${width}px`;
      } else {
        const div = createDiv("table-add-row-button", width, false);
        div.setAttribute("data-row-tr", rowIndex);
        div.style.left = `${leftPosition}px`;
        div.style.top = `${topPosition}px`;
        const button = createButton(insertRow);
        const markerDiv = createMarkerDiv(width, false);
        div.appendChild(button);
        div.appendChild(markerDiv);
        tableChild.appendChild(div);
      }
    });

    const lastRow = rows[rows.length - 1];
    const existingCellDiv = tableChild.querySelector(
      `div[data-last-row-tr="${0}"]`
    );
    const lastRowRect = lastRow.getBoundingClientRect();
    const leftPosition = lastRowRect.left - parentRect.left - 32;
    const topPosition = lastRowRect.bottom - parentRect.top - 10;

    if (existingCellDiv) {
      existingCellDiv.style.left = `${leftPosition}px`;
      existingCellDiv.style.top = `${topPosition}px`;
      existingCellDiv.style.width = `${width}px`;
      const markerDiv = existingCellDiv.querySelector(".table-add-marker");
      markerDiv.style.width = `${width}px`;

      const bottomDiv = tableChild.querySelector(
        ".table-add-row-to-end-button"
      );
      bottomDiv.style.width = `${tableRect.width}px`;
      bottomDiv.style.left = `${16}px`;
      bottomDiv.style.top = `${0}px`;
    } else {
      const width = tableRect.width + 30;
      const div = createDiv("table-add-row-button", width, false);
      div.setAttribute("data-last-row-tr", "0");
      div.style.left = `${leftPosition}px`;
      div.style.top = `${topPosition}px`;
      const button = createButton(insertLastRow);
      const markerDiv = createMarkerDiv(width, false);
      div.appendChild(button);
      div.appendChild(markerDiv);

      const bottomDiv = document.createElement("button");
      bottomDiv.style.width = `${tableRect.width}px`;
      bottomDiv.style.left = `${16}px`;
      bottomDiv.style.top = `${0}px`;
      bottomDiv.style.position = "absolute";
      bottomDiv.classList.add("fr-non-editable", "table-add-row-to-end-button");
      bottomDiv.setAttribute("contenteditable", "false");
      bottomDiv.innerHTML = ReactDOMServer.renderToStaticMarkup(<AddIcon />);

      bottomDiv.addEventListener("click", () => insertLastRow(bottomDiv));

      tableChild.appendChild(bottomDiv);
      tableChild.appendChild(div);
    }
  };

  const createDiv = (className, dimension, isHeight = true) => {
    const div = document.createElement("div");
    div.style[isHeight ? "height" : "width"] = `${dimension}px`;
    div.style.position = "absolute";
    div.classList.add("fr-non-editable", className);
    div.setAttribute("contenteditable", "false");
    return div;
  };

  const createButton = (insertFunc) => {
    const button = document.createElement("button");
    button.classList.add("fr-non-editable", "fr-table-button");
    button.setAttribute("contenteditable", "false");
    button.innerHTML = ReactDOMServer.renderToStaticMarkup(<AddIcon />);
    const guidelineDiv = document.createElement("div");
    guidelineDiv.classList.add("table-add-button-guideline");
    button.appendChild(guidelineDiv);
    button.addEventListener("click", () => insertFunc(button));
    return button;
  };

  const createMarkerDiv = (dimension, isHeight = true) => {
    const marker = document.createElement("div");
    marker.classList.add("fr-non-editable", "table-add-marker");
    marker.style[isHeight ? "height" : "width"] = `${dimension}px`;
    return marker;
  };

  const insertColumn = (button: HTMLButtonElement) => {
    editor.selection.save();
    const table = button.closest(".table-child")
      ?.parentNode as HTMLTableElement;
    const parentDiv = button.closest("div");

    if (!table || !parentDiv) return;

    const cellIndex = parentDiv.getAttribute("data-cell");
    if (!cellIndex) return;
    const index = parseInt(cellIndex, 10);
    const rows = table.querySelectorAll("tr");

    const oldWidth = rows[0] ? 100 / rows[0].cells.length : 0;
    const newWidth = rows[0] ? 100 / (rows[0]?.cells.length + 1) : 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row) {
        // Add null check for 'row'
        for (let j = 0; j < row.cells.length; j++) {
          const cell = row.cells[j];
          if (cell) {
            // Add null check for 'cell'
            cell.dataset.oldWidth = (
              (cell.offsetWidth / table.offsetWidth) *
              100
            ).toString();
          }
        }
      }
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) return;

      const originalStyles = row.cells[index]?.style.cssText || "";
      const newCell = row.insertCell(index);
      newCell.innerHTML = "<br>";
      newCell.style.cssText = originalStyles;
      newCell.style.width = `${newWidth}%`;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) return;

      for (let j = 0; j < row.cells.length; j++) {
        const cell = row.cells[j];
        if (cell && cell.dataset.oldWidth) {
          cell.style.width = `${
            (parseFloat(cell.dataset.oldWidth) * newWidth) / oldWidth
          }%`;
          delete cell.dataset.oldWidth;
        }
      }
    }
    calculateTableInsertButtons(editorRef);
    editor.selection.restore();
    editor.undo.saveStep();
  };

  const insertLastColumn = (button: HTMLElement) => {
    editor.selection.save();
    const table = button.closest(".table-child")
      ?.parentNode as HTMLTableElement;

    if (!table) return;

    const rows = table.querySelectorAll("tr");

    const oldWidth = rows[0] ? 100 / rows[0].cells.length : 0;
    const newWidth = rows[0] ? 100 / (rows[0]?.cells.length + 1) : 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row) {
        for (let j = 0; j < row.cells.length; j++) {
          const cell = row.cells[j];
          if (cell) {
            cell.dataset.oldWidth = (
              (cell.offsetWidth / table.offsetWidth) *
              100
            ).toString();
          }
        }
      }
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) return;

      const originalStyles =
        row.cells?.[row.cells.length - 1]?.style.cssText || "";
      const newCell = row.insertCell();
      newCell.innerHTML = "<br>";
      newCell.style.cssText = originalStyles;
      newCell.style.width = `${newWidth}%`;
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) return;

      for (let j = 0; j < row.cells.length; j++) {
        const cell = row.cells[j];
        if (cell && cell.dataset.oldWidth) {
          cell.style.width = `${
            (parseFloat(cell.dataset.oldWidth) * newWidth) / oldWidth
          }%`;
          delete cell.dataset.oldWidth;
        }
      }
    }
    calculateTableInsertButtons(editorRef);
    editor.selection.restore();
    editor.undo.saveStep();
  };

  const insertRow = (button: HTMLElement) => {
    editor.selection.save();
    const table = button.closest(".table-child")
      ?.parentNode as HTMLTableElement;
    const parentDiv = button.closest("div");

    if (!table || !parentDiv) return;

    const rowIndex = parentDiv.getAttribute("data-row-tr");
    if (!rowIndex) return;
    const index = parseInt(rowIndex, 10);
    const row = table.querySelectorAll("tr")[index];
    if (!row) return;

    const cells = row.querySelectorAll("td");
    if (cells.length > 0) {
      const newRow = table.insertRow(index);
      for (let i = 0; i < cells.length; i++) {
        const newCell = newRow.insertCell(i);
        newCell.innerHTML = "<br>";
        newCell.style.cssText = cells?.[i]?.style.cssText || "";
      }
    }
    calculateTableInsertButtons(editorRef);
    editor.selection.restore();
    editor.undo.saveStep();
  };

  const insertLastRow = (button: HTMLElement) => {
    editor.selection.save();
    const table = button.closest(".table-child")
      ?.parentNode as HTMLTableElement;

    if (!table) return;

    const rows = table.querySelectorAll("tr");
    if (rows.length > 0) {
      const lastRow = rows[rows.length - 1];
      if (!lastRow) return;

      const cells = lastRow.querySelectorAll("td");
      if (cells.length > 0) {
        const newRow = table.insertRow();
        for (let i = 0; i < cells.length; i++) {
          const newCell = newRow.insertCell(i);
          newCell.innerHTML = "<br>";
          newCell.style.cssText = cells?.[i]?.style.cssText || "";
        }
      }
    }
    calculateTableInsertButtons(editorRef);
    editor.selection.restore();
    editor.undo.saveStep();
  };

  const editor = editorRef.current.controller?.getEditor();
  if (!editor) return;
  // Initialize the custom plugin
  _FroalaEditor.PLUGINS.customTableInsertPlugin(editor, table);
}

export const removeAllButtons = (selectedblock) => {
  const divs = document.querySelectorAll(
    ".table-child div, .table-child button"
  );
  divs.forEach((div) => {
    if (div.closest("table") !== selectedblock.closest("table")) {
      div.remove();
    }
  });
};

export const calculateTableInsertButtons = (editorRef) => {
  if (editorRef.current.controller) {
    const editor = editorRef.current.controller.getEditor();
    const selectedblock = editor.selection.blocks()[0];

    if (selectedblock) {
      if (selectedblock.closest("table")) {
        removeAllButtons(selectedblock);
        setUpCustomTableInsert(editorRef, selectedblock.closest("table"));
      } else {
        removeAllButtons(selectedblock);
      }
    }
  }
};
