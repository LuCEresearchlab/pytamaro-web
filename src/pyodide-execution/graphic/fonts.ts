import { CanvasKit, Typeface } from '../../canvaskit-wasm/canvaskit';
import { canvasKitAssetUrl } from './utils';

const FONTS_FILENAME_PREFIX = [
  // Default font
  'FiraSans',
  // Extra fonts
  'CormorantGaramond',
  'FiraCode',
  'IBMPlexMono',
  'IBMPlexSans',
  'IBMPlexSerif',
  'Inter_28pt',
  'Jost',
  'LibreBodoni',
  'PTMono',
  'PTSans',
  'Roboto',
  'RobotoCondensed',
  'RobotoMono',
  'RobotoSerif',
  'Ubuntu',
  'UbuntuMono',
];

export async function loadTypeFaces(
  ck: CanvasKit,
): Promise<Map<string, Typeface>> {
  const typefaces: Map<string, Typeface> = new Map();

  for (const name of FONTS_FILENAME_PREFIX) {
    try {
      const fontData = await (
        await fetch(canvasKitAssetUrl(`fonts/${name}-Regular.ttf`))
      ).arrayBuffer();
      const typeface = ck.Typeface.MakeTypefaceFromData(fontData);

      if (typeface != null) {
        typefaces.set(typeface.getFamilyName(), typeface);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (unused) {
      // Ignore
    }
  }

  return typefaces;
}
