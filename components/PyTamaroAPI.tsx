/* eslint-disable @next/next/no-img-element */
import { useTheme } from '@mui/material';

export default function PyTamaroAPI({ name } : { name: string }) {
  const theme = useTheme();
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'baseline',
      flexWrap: 'wrap',
    }}
    >
      <img
        src="/favicon.ico"
        style={{
          height: '1em', width: 'auto', display: 'inline-block', transform: 'translateY(.2em)', paddingRight: '.1em',
        }}
        alt="PyTamaro icon"
      />
      <a
        style={{
          color: theme.pytamaro.redColor,
          fontFamily: theme.pytamaro.monospaceFontFamily,
          textDecoration: 'none',
        }}
        href={`https://pytamaro.readthedocs.io/en/stable/search.html?q="${name}"`}
        target="_blank"
        rel="noreferrer"
      >
        {name}
      </a>
    </span>
  );
}
