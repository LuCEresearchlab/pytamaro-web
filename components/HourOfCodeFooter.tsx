import { Typography } from '@mui/material';

export default function HourOfCodeFooter() {
  return (
    <Typography marginTop={6} variant="body2" align="center" color="grey">
      The
      {' '}
      <a href="https://hourofcode.org/">Hour of Code</a>
      {' '}
      ® is an initiative by
      {' '}
      <a href="https://code.org/">Code.org</a>
      {' '}
      to introduce millions of students
      to one hour of computer science and computer programming,
      especially during
      {' '}
      <a href="https://www.csedweek.org/">CSEdWeek</a>
      , the computer science education week
      that takes place every year during the week of
      Grace Hopper&apos;s birthday (December 9, 1906),
      a pioneer of computer science
      who invented the first compiler and coined the term &ldquo;bug&rdquo;.
      <br />
      Hour of Code® and Hora del Código® are registered trademarks of Code.org.
    </Typography>
  );
}
