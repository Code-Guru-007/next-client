// lint-stage for typescript
// https://stackoverflow.com/a/63148597/8105942
module.exports = {
  '**/*.{ts,tsx}': () => 'tsc -p tsconfig.json --noEmit'
}