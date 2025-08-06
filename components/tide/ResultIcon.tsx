import { useEffect, useState } from 'react';
import { EvaluatedValueType, SoundType } from '../../src/tide/language/typing';

function GraphicIcon({ data }: { data: string | undefined }) {
  const [dimension, setDimension] = useState(
    undefined as { width: number; height: number } | undefined,
  );

  const IMG_SCALE = 0.2;

  useEffect(() => {
    if (!data) return;
    new Promise<string>(function (resolved, rejected) {
      const i = new Image();
      i.onload = function () {
        setDimension({
          width: i.naturalWidth * IMG_SCALE,
          height: i.naturalHeight * IMG_SCALE,
        });
        resolved(data);
      };
      i.onerror = rejected;
      i.src = data;
    });
  });

  return dimension ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      style={{
        width: `${dimension.width}px`,
        height: `${dimension.height}px`,
      }}
      className='img'
      alt='Expression Result'
      src={data}
    />
  ) : (
    <div />
  );
}

function ColorIcon({
  data: color,
}: {
  data: { red: number; green: number; blue: number; alpha: number } | undefined;
}) {
  return color ? (
    <svg
      width='32'
      height='32'
      viewBox='0 0 146 128'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M37.3259 127.654C58.2429 127.486 68.739 113.651 70.39 101.306C73.318 79.406 47.3769 66.771 31.6169 82.191C23.2219 90.404 20.1029 103.804 0.158936 107.03C0.158936 107.03 8.50593 127.886 37.3259 127.654Z'
        fill={`rgba(${color.red}, ${color?.green}, ${color?.blue}, ${color?.alpha})`}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M57.137 68.3359L126.091 2.30795C136.013 -2.13905 147.492 3.24795 144.656 17.994L77.4609 88.3179C74.9499 77.9429 65.151 70.4579 57.137 68.3359Z'
        fill={`rgba(0, 0, 0, ${color?.alpha})`}
      />
    </svg>
  ) : (
    <div />
  );
}

export default function ResultIcon({
  value = undefined,
}: {
  value?: EvaluatedValueType[SoundType];
}) {
  if (!value) return undefined;

  if (typeof value === 'string') return <GraphicIcon data={value} />;
  if (typeof value === 'object') return <ColorIcon data={value} />;
}
