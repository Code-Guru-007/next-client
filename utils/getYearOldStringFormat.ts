export default function withYearOldStingFormat(
  birthday: string,
  returnType: boolean
): string {
  if (!birthday) return "";
  const curYear = new Date();
  const birthYear = new Date(birthday);
  const old = curYear.getFullYear() - birthYear.getFullYear();
  if (returnType) return `${birthday} | ${old} Years Old`;
  return `${birthday}`;
}
