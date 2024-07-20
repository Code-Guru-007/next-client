export default function encodedUrlWithParentheses(encodedUrl?: string) {
  if (!encodedUrl) return "";
  return encodedUrl.replace(
    /[\\(\\)]/g,
    (char) => `%${char.charCodeAt(0).toString(16)}`
  );
}
