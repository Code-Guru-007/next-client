import { WordLibrary } from "@eGroupAI/typings/apis";

function fetchWordLibrary(
  lang: string,
  library: WordLibrary | undefined
): Promise<WordLibrary | undefined> {
  const storageKey = "wordLibrary";
  const cachedLibrary =
    localStorage.getItem(storageKey) &&
    JSON.parse(localStorage.getItem(storageKey) || "");

  const languageHandler = (lang: string) =>
    fetch(`/api/v1/locale/${lang}`)
      .then((response) => response.json())
      .then((library) => {
        const storageValue = JSON.stringify({
          language: lang,
          expiration: Date.now() + 24 * 60 * 60 * 1000, // 1 day expiration
        });
        localStorage.setItem(storageKey, storageValue);
        return library;
      });

  if (cachedLibrary && cachedLibrary.language === lang) {
    const { expiration } = cachedLibrary;
    if (expiration > Date.now()) {
      if (library === undefined) return languageHandler(lang);
      return Promise.resolve(library);
    }
  }

  return languageHandler(lang);
}

export default fetchWordLibrary;
