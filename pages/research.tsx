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
import NavigationBar from '../components/navbar/NavigationBar';
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
          <Chip
            sx={{ minHeight: 24, height: 'auto' }}
            label={conference}
            size='small'
            icon={<Home />}
          />
          <Chip
            // Multiline (author list can be long)
            sx={{
              height: 'auto',
              '& .MuiChip-label': {
                display: 'block',
                whiteSpace: 'normal',
              },
            }}
            label={authors}
            size='small'
            icon={<People />}
          />
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
            target='_blank'
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
              target='_blank'
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
            This doctoral dissertation describes the entire PyTamaro project,
            from the motivations to the design of the library and this web
            platform, to the evaluation of the approach:
          </Typography>
          <Stack direction='column' spacing={2}>
            <ResearchCard
              title='Teaching Introductory Programming Using Graphics as a Domain'
              abstract='
An increasingly wider and more diverse population is learning to program, with interests and motivations that often differ from traditional ones. Instructors try to cater to
these new needs by designing learning experiences that go beyond classic domains and
include, for example, multimedia. Graphics, in particular, has emerged as an attractive
domain. However, this shift is not exempt from criticisms: programming graphics can
be an engaging activity, but it might actually distract from the intended learning goals.
This dissertation aims to show that it is possible to design an approach to teach
programming using graphics as a domain, thereby sustaining the engagement, without neglecting fundamental aspects of programming such as abstraction and problem
decomposition. We start by reviewing existing approaches to graphics used in introductory programming, highlighting a number of pitfalls. We then present the PyTamaro
approach: a Python library with a design that eschews these pitfalls, an unplugged
introduction to programming based on the library, and a dedicated web platform that
integrates pedagogical features to leverage the strengths of the approach.
The PyTamaro approach is evaluated in a controlled experiment using the popular
turtle graphics as a baseline. Both groups reported high engagement. On transfer to
questions outside the domain of graphics, we found few differences, despite the fact
that the PyTamaro group had practiced on tasks isomorphic to those in the post-test.
We then conducted a case study with five Swiss high school teachers who have
adopted the PyTamaro approach to teach programming. The study analyzed why they
decided to adopt our approach, examined their teaching materials in depth, and collected the experience of using PyTamaro with their students. In summary, teachers
recognized PyTamaro as a novel and engaging approach to graphics, used it to introduce most programming concepts, and emphasized the definition of functions as a
means of abstraction. The case study also highlighted certain issues: teachers had to
create their own materials, explained problem decomposition only in the domain of
graphics, and struggled to reconcile the ideas of (im)mutable variables and constants.
Overall, the PyTamaro approach shows the feasibility of teaching introductory programming in an engaging way, emphasizing abstraction and decomposition. Its current
use at three educational levels paves the way for future empirical investigations.
'
              pdf='https://susi.usi.ch/documents/332702/preview/2025INF011.pdf'
              conference='USI PhD 2025'
              authors='Luca Chiodini'
            />
          </Stack>
          <Typography variant='h6' gutterBottom fontWeight='normal' mt={4}>
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
              pdf='https://luce.si.usi.ch/assets/publications/chiodiniTeachingProgrammingGraphics2023.pdf'
              video='https://www.youtube.com/watch?v=T0QjwGNYz7A'
              conference='SPLASH-E 2023'
              authors='Luca Chiodini, Juha Sorva, Matthias Hauswirth'
            />
            <ResearchCard
              title='Two Approaches for Programming Education in the Domain of Graphics: An Experiment'
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
              pdf='https://luce.si.usi.ch/assets/publications/chiodiniTwoApproachesProgramming2025.pdf'
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
              pdf='https://luce.si.usi.ch/assets/publications/chiodiniJudiciousAPIDocumentation2024.pdf'
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
              pdf='https://luce.si.usi.ch/assets/publications/chiodiniToolboxFunctionsTeaching2025.pdf'
              conference='ECSEE 2025'
              authors='Luca Chiodini, Joey Bevilacqua, Matthias Hauswirth'
            />
            <ResearchCard
              title='TIDE: An Educational Live Programming Environment to Compose Graphics with PyTamaro'
              abstract='The PyTamaro approach to introductory programming
              equates composing a program to composing a graphic. Using the
              simple PyTamaro library for Python, beginner programmers compose
              function calls that produce primitive graphics, such as
              `rectangle(20, 10, red)`, with function calls that combine graphics
              into composites, such as `above(_, _)`.
              To ease students into programming, several school teachers have
              been using TamaroCards, a paper-based visual language that can
              express the subset of Python needed to compose simple graphics
              with PyTamaro.
              This paper introduces TIDE, the TamaroCards IDE, a web-based
              environment to complement the unplugged, paper-based TamaroCards.
              Given the constraints imposed by the Python programming language,
              the PyTamaro library, and the TamaroCards notation, the paper
              explores the design space for an interactive TamaroCards
              programming environment, describes a design that satisfies the
              pedagogical needs, and evaluates the implemented design using the
              Cognitive Dimensions framework.'
              pdf='https://luce.si.usi.ch/assets/publications/bevilacquaTIDEEducationalLive2025.pdf'
              conference='PAINT 2025'
              authors='Joey Bevilacqua, Nathan Coquerel, Luca Chiodini, Igor Moreno Santos, Matthias Hauswirth'
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
