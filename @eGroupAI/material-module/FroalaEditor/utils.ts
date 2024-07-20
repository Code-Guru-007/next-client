export interface SelectionInfo {
  range: any;
  lineIndex: number;
  positionInLine: any;
  currentWord: any;
  position: {
    x: any;
    y: any;
    w: any;
    h: any;
  };
}
export function getCaretPosition(editorInstance): SelectionInfo | null {
  // Get the current selection
  const selection = editorInstance.selection.get();

  if (selection.rangeCount) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const startNode = range.startContainer;

    // Create a range that spans all the content up to the caret
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorInstance.el);
    preCaretRange.setEnd(startNode, range.startOffset);

    // Get the text of the range and split it into lines
    const textContent = preCaretRange.toString();
    const lines = textContent.split("\n");

    // The line index is the number of lines - 1
    const lineIndex = lines.length - 1;
    // The position within the line is the length of the last line
    const positionInLine = lines[lines.length - 1].length;

    // The word or phrase at the current caret position can be obtained by
    // expanding the range to the nearest word boundaries
    // range.expand("word");
    const currentWord = range.toString();

    return {
      range,
      lineIndex,
      positionInLine,
      currentWord,
      position: { x: rect.left, y: rect.top, w: rect.width, h: rect.height },
    };
  }

  // If there's no selection, return null or an appropriate default
  return null;
}

export async function convertUrl2File(
  url: string,
  filename: string
): Promise<File> {
  // Check if URL is a Blob URL
  if (url.startsWith("blob:")) {
    // Fetch the blob from the blob URL
    const response = await fetch(url);
    const blob = await response.blob();
    const ext = blob?.type?.split("/")[1];
    // Create a file from the blob
    return new File([blob], `${filename}.${ext}`, {
      type: blob.type,
    });
  }
  const arr = url.split(",");
  const mime = arr[0]?.match(/:(.*?);/)?.[1];
  const ext = mime?.split("/")[1];
  const bstr = atob(arr[1] || "");
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  const blob = new Blob([u8arr], { type: mime });
  const file = new File([blob], `${filename}.${ext}`, {
    type: blob.type,
  });
  return file;
}
