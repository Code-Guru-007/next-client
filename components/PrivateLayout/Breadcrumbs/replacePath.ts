export interface Variables {
  [key: string]: string | undefined;
}

export default function replacePath<V = Variables>(text: string, variables: V) {
  let result = text;
  if (variables) {
    Object.keys(variables).forEach((key) => {
      const re = new RegExp(`\\[${key}\\]`, "g");
      const value = variables[key];
      if (value) {
        result = result.replace(re, value);
      }
    });
  }
  return result;
}
