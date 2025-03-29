import Description from '@mui/icons-material/Description';
import Home from '@mui/icons-material/Home';
import OndemandVideo from '@mui/icons-material/OndemandVideo';
import People from '@mui/icons-material/People';
import PictureAsPdf from '@mui/icons-material/PictureAsPdf';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import NavigationBar from '../components/NavigationBar';
import PageTitle from '../components/PageTitle';
import { translationProps } from '../src/serverSideTranslationProps';

function ResearchCard({
  title,
  abstract,
  pdf,
  video = undefined,
  authors,
  conference,
}: {
  title: string;
  abstract: string;
  pdf: string;
  video?: string;
  authors: string;
  conference: string;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={title}
        titleTypographyProps={{
          variant: 'h5',
          color: 'primary',
          fontWeight: 'bold',
        }}
        sx={{ pb: 0 }}
        avatar={<Description color='primary' />}
      />
      <CardContent>
        <Stack direction='row' spacing={1} mb={2}>
          <Chip label={conference} size='small' icon={<Home />} />
          <Chip label={authors} size='small' icon={<People />} />
        </Stack>
        <Typography
          variant='body2'
          color='textSecondary'
          sx={{
            overflow: 'hidden',
            lineClamp: 5,
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
            display: '-webkit-box',
          }}
        >
          {abstract}
        </Typography>
        <Stack direction='row' spacing={2} mt={2}>
          <Button
            href={pdf}
            size='small'
            variant='contained'
            color='success'
            startIcon={<PictureAsPdf />}
          >
            Read Full Paper
          </Button>
          {video && (
            <Button
              href={video}
              size='small'
              variant='contained'
              color='success'
              startIcon={<OndemandVideo />}
            >
              Watch Presentation
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Research() {
  return (
    <div>
      <Head>
        <title>Research - PyTamaro</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth='md'>
          <PageTitle>Research Behind PyTamaro</PageTitle>
          <Typography variant='h6' gutterBottom fontWeight='normal'>
            These research papers describe and evaluate the design of the
            PyTamaro library and its pedagogical approach:
          </Typography>
          <Stack direction='column' spacing={2}>
            <ResearchCard
              title='Teaching Programming with Graphics: Pitfalls and a Solution'
              abstract='Many introductory programming courses employ graphics
              libraries that promote engagement and enable fun visuals. However,
              student excitement over graphical outputs is not a guarantee of
              conceptual understanding of programming, and graphics may even
              distract from intended learning outcomes. Our contribution is
              twofold. First, we analyze a selection of existing graphics
              libraries designed for novice programmers. We consider how these
              libraries foster clean decomposition, direct students’ attention
              to key content, and manage complexity; we find shortcomings in
              these respects. These shortcomings involve the libraries’ support
              for global coordinates and external graphics, as well as their
              rich APIs; we argue that these features, although powerful, are
              also potential pitfalls in student learning. Second, we present
              the design of a new graphics library, PyTamaro, which avoids the
              pitfalls with a minimalist design that eschews coordinates; we
              also outline a pedagogical approach that builds on PyTamaro’s
              strengths and deliberate limitations. We briefly discuss
              PyTamaro’s trade-offs in comparison to coordinate-based libraries.
              The work reported here paves the way for future empirical
              evaluations of PyTamaro and associated teaching practices.'
              pdf='https://www.chiodini.org/publications/splashe23-pytamaro.pdf'
              video='https://www.youtube.com/watch?v=T0QjwGNYz7A'
              conference='SPLASH-E 2023'
              authors='Luca Chiodini, Juha Sorva, Matthias Hauswirth'
            />
            <ResearchCard
              title='Two Approaches for Programming Education in the Domain of
Graphics: An Experiment'
              abstract='Context Graphics is a popular domain for teaching
              introductory programming in a motivating way, even in text-based
              programming languages. Over the last few decades, a large number
              of libraries using different approaches have been developed for
              this purpose.  Inquiry Prior work in introductory programming that
              uses graphics as input and output has shown positive results in
              terms of engagement, but research is scarce on whether learners
              are able to use programming concepts learned through graphics for
              programming in other domains, transferring what they have learned.
              Approach We conducted a randomized, controlled experiment with 145
              students as participants divided into two groups. Both groups
              programmed using graphics in Python, but used different
              approaches: one group used a compositional graphics library named
              PyTamaro; the other used the Turtle graphics library from Python’s
              standard library. Student engagement was assessed with surveys,
              and programming knowledge with a post-test on general programming
              concepts and programming tasks in the domain of graphics.
              Knowledge We find few differences between the two groups on the
              post-test, despite the PyTamaro group having practiced on problems
              isomorphic to those in the post-test. The participants traced a
              compositional graphics program more accurately than a ‘comparable’
              turtle graphics program. Both groups report high engagement and
              perceived learning; both perform well on simple program-writing
              tasks to create graphics.  Grounding Our findings are based on a
              controlled experiment with a count of 145 participants, which
              exceeds the sample size indicated by power analysis to detect a
              medium effect size. The complete instrument and teaching materials
              used in the study are available as appendixes.  Importance This
              study adds further evidence that graphics is an engaging domain
              for introductory programming; moreover, it shows that the
              compositional graphics approach adopted by PyTamaro yields
              engagement levels comparable to the venerable turtle approach.
              Compositional graphics code appears to be easier to trace than
              turtle graphics code. As for conceptual knowledge, our results
              indicate that practicing on programming tasks isomorphic to those
              of the test can still not be enough to achieve better transfer.
              This challenges programming educators and researchers to
              investigate further which graphics-based approaches work best and
              how to facilitate transfer'
              pdf='https://chiodini.org/publications/programming25-pytamaro-turtle.pdf'
              conference='‹Programming› 2025'
              authors='Luca Chiodini, Juha Sorva, Arto Hellas, Otto Seppälä, Matthias Hauswirth'
            />
          </Stack>
          <Typography variant='h6' gutterBottom fontWeight='normal' mt={4}>
            These research papers explain the design of the pedagogical aspects
            of this web platform:
          </Typography>
          <Stack direction='column' spacing={2}>
            <ResearchCard
              title='Judicious: API Documentation for Novices'
              abstract='Programmers frequently consult API documentation to
              learn how to use libraries, both those included with a programming
              language and those offered by third parties. Beginner programmers
              also have this need but struggle to browse professional
              documentation systems, which are aimed at experienced programmers.
              Educators sometimes try to patch this problem by writing
              simplified, ad hoc educational documents as a surrogate for a
              documentation system.  This paper presents Judicious, an API
              documentation system explicitly designed for novice programmers.
              It allows retrieving the documentation for one name at a time;
              offers a clear and distinctive visual representation of functions
              and constants; gradually presents more information such as types,
              optional and variable-length parameters for functions; highlights
              functions with side effects; and instantaneously generates
              documentation also for functions defined in student code.
              Judicious’s design builds on prior research in the learning
              sciences and programming languages. The gradual disclosing of
              information matches the progression of increasingly larger subsets
              of programming languages. The diagrammatic representation, the
              clear distinction between functions and constants, and the
              pinpointing of side effects aim to address known novice
              misconceptions. The system is integrated into a code editor and is
              publicly available as a web platform.'
              pdf='https://chiodini.org/publications/splashe24-judicious.pdf'
              video='https://www.youtube.com/watch?v=O-A3Anz0Tfw'
              conference='SPLASH-E 2024'
              authors='Luca Chiodini, Simone Piatti, Matthias Hauswirth'
            />
            <ResearchCard
              title='The Toolbox of Functions: Teaching Code Reuse in Schools'
              abstract='Large programs often contain duplicate parts, known as
              code clones.  Programs riddled with code clones become difficult
              to reason about and modify. To avoid code clones and enable code
              reuse, programmers introduce abstractions such as functions and
              classes. Because abstraction is so important, it should be
              explicitly taught in programming courses and appropriately
              supported by tools. Unfortunately, development environments,
              including some for novices, do not always encourage abstraction.
              Instead, they facilitate the creation of code clones and
              ultimately hinder code reuse. This paper presents the Toolbox of
              Functions, an approach for teaching code reuse to beginner
              programmers in schools. This approach helps students to develop,
              collect, and reuse their own functions, as a simple form of
              abstraction. Learners are guided in creating and using their own
              library, without the complexity found in other environments. We
              implemented the approach in a publicly-available web platform for
              programming in Python. We collaborated with high school teachers
              who adopted the approach in their mandatory programming courses.
              Over the course of a year, more than 800 users executed over 30
              000 programs that use the Toolbox of Functions. This initial
              experience suggests the potential of the approach to instill the
              principle of code reuse effectively.'
              pdf='https://www.chiodini.org/publications/ecsee25-pytamaro-toolbox.pdf'
              conference='ECSEE 2025'
              authors='Luca Chiodini, Joey Bevilacqua, Matthias Hauswirth'
            />
          </Stack>
        </Container>
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      ...(await translationProps()),
    },
  };
}
