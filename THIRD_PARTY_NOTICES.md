# Third-Party Notices

The [MIT License](LICENSE.md) applies to the source code in this PyTamaro Web repository.
It does **not** automatically apply to the third-party software, fonts, media, trademarks, or content listed below, which remain under their own terms.

## Bundled software

### CanvasKit (Skia)

Custom build from <https://github.com/LuCEresearchlab/canvaskit>, derived from [Skia](https://skia.org/).
License: BSD-3-Clause

```
Copyright 2011 Google Inc. All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.
3. Neither the name of Google Inc. nor the names of its contributors may be
   used to endorse or promote products derived from this software without
   specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
```

### Python Analyzer (Ruff/Ty)

Built using [Ruff/Ty](https://github.com/astral-sh/ruff), copyright Astral Software Inc.
License: MIT

```
Copyright (c) 2022 Astral Software Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

### PyTamaro wheel

Open-source library: <https://github.com/LuCEresearchlab/pytamaro>.
License: MIT (Copyright LuCE, Università della Svizzera italiana)

### Fonts

Fonts are bundled in `public/canvaskit/fonts/` and loaded at runtime.
Each font retains its own open-source license.

### npm dependencies

All JavaScript/TypeScript dependencies are listed in `package.json` and `package-lock.json`.
Each library retains its own open-source license.

## Media and content

### Photographs of people

Images (including but not limited to `public/people/*` and `public/events/*`) are not covered by the MIT license.
Do not reuse without permission.

### Unsplash photos

License: [Unsplash License](https://unsplash.com/license)

### Logos and trademarks

The PyTamaro name and logo, the USI logo, the GymInf logo, and the Hour of
Code/code.org assets are trademarks of their respective owners.

## Content submodules

The directories under `data/` are git submodules pointing to separate private repositories.
Their content is not part of this repository's license and is licensed by the respective authors. 
