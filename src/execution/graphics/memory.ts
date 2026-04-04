import type { EmbindObject, Surface } from '../../canvaskit-wasm/canvaskit';

export const disposeOfEmBindObject = (obj: EmbindObject<string>) => {
  if (!obj.isDeleted()) {
    obj.delete();
  }
};

export const disposeOfSurface: (surface: Surface | null | undefined) => void = (
  surface,
) => {
  // Call dispose() on surfaces to free the underlying pixels and delete the
  // object, see
  // https://github.com/google/skia/blob/d0e1963cc6319f8fc7c30ea4feb5a8e94def0d76/modules/canvaskit/cpu.js#L96-L103
  if (surface !== undefined && surface !== null && !surface.isDeleted()) {
    surface.dispose();
  }
};
