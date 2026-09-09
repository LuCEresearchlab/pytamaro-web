/* eslint-disable react/no-unescaped-entities */
import { Link, Typography } from '@mui/material';

export default function HourOfCodeFooter() {
  return (
    <Typography
      variant='body2'
      align='center'
      color='grey'
      sx={{
        marginTop: 6,
      }}
    >
      The <Link href='https://hourofcode.org/'>Hour of Code</Link> ® is an
      initiative by <Link href='https://code.org/'>Code.org</Link> to introduce
      millions of students to one hour of computer science and computer
      programming, especially during{' '}
      <Link href='https://www.csedweek.org/'>CSEdWeek</Link>, the computer
      science education week that takes place every year during the week of
      Grace Hopper's birthday (December 9, 1906), a pioneer of computer science
      who invented the first compiler and coined the term “bug”.
      <br />
      Hour of Code® and Hora del Código® are registered trademarks of
      Code.org.
    </Typography>
  );
}
