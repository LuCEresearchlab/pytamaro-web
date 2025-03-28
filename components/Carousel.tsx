import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import useEmblaCarousel from 'embla-carousel-react';
import { ReactNode } from 'react';

export default function Carousel({
  children,
  interval = 4000,
  sx = {},
}: {
  children: ReactNode[];
  interval?: number;
  sx?: object;
}) {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Fade(),
    Autoplay({ delay: interval }),
  ]);

  return (
    <div style={{ overflow: 'hidden', ...sx }} ref={emblaRef}>
      <div style={{ display: 'flex' }}>
        {children.map((child, idx) => (
          // eslint-disable-next-line react/no-array-index-key
          <div style={{ flex: '0 0 100%', minWidth: 0 }} key={idx}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
