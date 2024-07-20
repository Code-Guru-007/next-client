export default function getFileNameFromContentDisposition(
  contentDisposition: string
) {
  let filename = "";
  const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
  const matches = filenameRegex.exec(contentDisposition);
  if (matches != null && matches[1]) {
    filename = matches[1].replace(/['"]/g, "");
  }
  return decodeURI(filename);
}
