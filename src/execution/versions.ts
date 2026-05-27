export const PYODIDE_VERSION = '0.29.2';
export const PYTHON_VERSION = '3.13';
export const PYTAMARO_VERSION = '2.0.1';

/*
The execution environment depends on a number of factors, including:
- The version of Pyodide
- The version of Python (which is determined by the version of Pyodide)
- The version of PyTamaro
- The version of CanvasKit
- How we transform the graphic "spec" received by Python into a rendered graphics
The PLATFORM_VERSION uniquely identifies the combination of all of the above. Purely for human readability, we include in the tag the versions of Pyodide, Python, and PyTamaro.
When client-side execution (cse) is used, this tag is recorded instead of the Docker image tag. We therefore also want this tag to be clearly distinct from Docker image tags (e.g., `lucachi/pytamaro:1.1.4-py3.13`). We do this by prefixing the tag with `cse` and separating the components with `|`.
*/
export const CLIENT_SIDE_EXECUTION_TAG = `cse|pyodide-${PYODIDE_VERSION}|python-${PYTHON_VERSION}|pytamaro-${PYTAMARO_VERSION}|platform-${process.env.PLATFORM_VERSION}`;
