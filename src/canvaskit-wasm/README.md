# Custom CanvasKit build for PyTamaro

## Dependencies

- `bazelisk`
- `python3`
- [`depot-tools`](https://www.chromium.org/developers/how-tos/install-depot-tools/)

## Setup

```bash
# Clone repo
git clone git@github.com:google/skia.git
cd skia
# Setup env
python3 tools/git-sync-deps
python3 bin/fetch-ninja
cd modules/canvaskit
npm ci
```

## Build

### Release

```bash
./compile.sh release \
  legacy_draw_vertices \
  no_alias_font \
  no_codec \
  no_effects_deserialization \
  no_embedded_font \
  no_skottie \
  no_sksl_trace \
  no_woff2
```

Outputs:

```
../../out/canvaskit_wasm/canvaskit.js   -> canvaskit.js
../../out/canvaskit_wasm/canvaskit.wasm -> canvaskit.wasm
./npm_build/types/index.d.ts            -> canvaskit.d.ts
```

### Debug

Note: Chrome may require configuration changes to load it.

```bash
./compile.sh debug_build \
  legacy_draw_vertices \
  no_alias_font \
  no_codec \
  no_effects_deserialization \
  no_embedded_font \
  no_skottie \
  no_sksl_trace \
  no_woff2
```

Outputs:

```
../../out/canvaskit_wasm_debug/canvaskit.js   -> canvaskit.js
../../out/canvaskit_wasm_debug/canvaskit.wasm -> canvaskit.wasm
./npm_build/types/index.d.ts                  -> canvaskit.d.ts
```
