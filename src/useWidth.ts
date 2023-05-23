import { useEffect, useState } from 'react';

export default function useWidth() {
  const [width, setWidth] = useState(1200);

  const onResize = () => {
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    onResize();
  }, []);

  useEffect(() => {
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return width;
}
