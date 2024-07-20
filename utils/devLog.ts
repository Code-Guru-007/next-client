export default function devLog(...args) {
  if (process.env.NODE_ENV !== "production") {
    console.log(...args);
  }
}
