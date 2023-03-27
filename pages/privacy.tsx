import {
  Box,
  Container, Link, Typography,
} from '@mui/material';
import NextLink from 'next/link';
import Head from 'next/head';
import NavigationBar from '../components/NavigationBar';

export default function PrivacyPolicy() {
  const margin = 3;
  return (
    <div>
      <Head>
        <title>Privacy Policy - PyTamaro Web</title>
      </Head>
      <Box>
        <NavigationBar />
        <Container maxWidth="md">
          <Typography variant="h3" align="center" marginY={margin}>Privacy Policy</Typography>
          <Typography variant="h6" align="center" marginY={margin}>Last updated: March 24, 2023</Typography>
          <Typography variant="body1" marginY={margin}>
            The privacy of your data is important to us.
            In this policy, we lay out:
          </Typography>
          <ul>
            <li>what data we collect and why;</li>
            <li>how your data is handled;</li>
            <li>and your rights with respect to your data.</li>
          </ul>
          <Typography variant="body1" marginY={margin}>
            This policy applies to our
            {' '}
            <Link component={NextLink} href="https://pytamaro.si.usi.ch/">PyTamaro Web application</Link>
            .
          </Typography>
          <Typography variant="body1" marginY={margin}>
            If you disagree with our terms,
            you can always
            {' '}
            <Link component={NextLink} href="/install">install our open-source PyTamaro library</Link>
            ,
            and develop and run your code on your computer instead of using PyTamaro Web.
          </Typography>
          <Typography variant="h4" marginY={margin}>
            Who we are
          </Typography>
          <Typography variant="body1" marginY={margin}>
            PyTamaro Web is developed and operated in Switzerland by the
            {' '}
            <Link href="https://luce.si.usi.ch/">Lugano Computing Education Research Lab</Link>
            {' '}
            (Luce) at the
            {' '}
            <Link href="https://si.usi.ch/">Software Institute</Link>
            {' '}
            of the
            {' '}
            <Link href="https://www.inf.usi.ch/">Faculty of Informatics</Link>
            {' '}
            of the
            {' '}
            <Link href="https://luce.si.usi.ch/">USI - Università della Svizzera italiana</Link>
            .
            We are a research group studying how people learn to program.
            Our goal is to improve the state-of-the-art of programming education.
            Our research includes the design of new tools and approaches (such as this website)
            as well as exploratory and evaluative empirical studies.
          </Typography>
          <Typography variant="body1" marginY={margin}>
            Our infrastructure is located in Lugano, Switzerland.
          </Typography>
          <Typography variant="body1" marginY={margin}>
            To contact us, please write to:
          </Typography>
          <pre>
            Prof. Matthias Hauswirth
            <br />
            Università della Svizzera italiana
            <br />
            Via Giuseppe Buffi 13
            <br />
            6900 Lugano
            <br />
            Switzerland
            <br />
            <br />
            Matthias.Hauswirth@usi.ch
          </pre>
          <Typography variant="body1">
            If you are located outside of Switzerland,
            please be aware that any information you provide to us
            will be transferred to and stored in Switzerland.
          </Typography>
          <Typography variant="h4" marginY={margin}>
            What we collect and why
          </Typography>
          <Typography variant="body1" marginY={margin}>
            Our guiding principle is to collect only what we need.
            Here’s what that means in practice:
          </Typography>
          <Typography variant="h5" marginY={margin}>
            Advertising
          </Typography>
          <Typography variant="body1" marginY={margin}>
            We do not use any third-party advertising services.
          </Typography>
          <Typography variant="h5" marginY={margin}>
            Personally Identifiable Information
          </Typography>
          <Typography variant="body1" marginY={margin}>
            We do not collect any personally-identifiable information.
            PyTamaro Web has no user accounts.
          </Typography>
          <Typography variant="h5" marginY={margin}>
            Voluntarily Provided Content (e.g., Source Code You Enter)
          </Typography>
          <Typography variant="body1" marginY={margin}>
            Our website allows you to practice programming.
            For this purpose you enter source code into the website,
            and you receive the output produced by that code.
            You also may provide other content,
            e.g., by marking an activity you solved as completed,
            or by requesting help about a specific PyTamaro API function.
          </Typography>
          <Typography variant="body1" marginY={margin}>
            The content you enter on our website gets stored in two places:
          </Typography>
          <ul>
            <li>
              <strong>Your Web Browser&apos;s Local Storage. </strong>
              Your content gets saved in your own web browser&apos;s local storage
              (a mechanism similar to cookies).
              This way you can keep track of, build upon,
              and review past activities you completed.
              The local storage is managed by your web browser;
              it is under your control.
              It may be stored on your local computer,
              or on some file server of your local network.
              You can delete your local storage at any time,
              but doing so means that your solutions of past activities will be lost.
              The PyTamaro web application running in your browser
              will read and write your local storage,
              but otherwise we do not have access to your local storage.
            </li>
            <li>
              <strong>Our Server. </strong>
              When you click the button to run your source code,
              your code gets shipped to our execution server,
              our server executes it
              and sends back the result (e.g., the graphic produced by your code)
              to your web browser.
              When our execution server receives your code,
              we do not know who&apos;s code it is.
              We store the code we execute, and the output it generates,
              for two reasons:
              (1) For performance reasons.
              We cache code and its output
              to avoid re-executing the same code over and over again.
              (2) For research purposes.
              We store and analyze the
              solutions submitted to the specific activities
              to better understand how people learn to program.
            </li>
          </ul>
          <Typography variant="h5" marginY={margin}>
            Cookies
          </Typography>
          <Typography variant="body1" marginY={margin}>
            We do not use any third-party cookies.
            {/*
              Some activities may embed explanatory videos that are hosted on YouTube.
              We use a YouTube embed plugin that minimizes the use of cookies.
            */}
          </Typography>
          <Typography variant="body1" marginY={margin}>
            If you approve our use of our own (first-party) cookies,
            we store a randomly generated unique identifier (e.g., the number 123456789)
            in your browser&apos;s local storage.
            This identifier does not allow us to determine who you are;
            and it does not allow us to determine where you are.
            It only allows us to tell that multiple requests (e.g., to run source code)
            came from the same browser (e.g., the browser storing the number 123456789).
            We use this to determine which source code fragments came from the same browser,
            which allows us to study learning trajectories taken through the activities.
            (E.g., we can tell that two specific source code fragments
            came from the browser storing the number 123456789.)
          </Typography>
          <Typography variant="h5" marginY={margin}>
            Website Interactions
          </Typography>
          <Typography variant="body1" marginY={margin}>
            We use Plausible Analytics, a GDPR, CCPA and cookie law compliant site analytics tool,
            to track overall trends in the usage of our website.
            Plausible Analytics collects only aggregated information,
            which does not allow us to identify any visitor to our website.
            For more information, please visit the
            {' '}
            <Link href="https://plausible.io/data-policy">Plausible Analytics Data Policy</Link>
            .
            {/*
              You can see the analytics data we collect at
              <Link href="https://plausible.pytamaro.si.usi.ch">our PyTamaro Plausible dashboard</Link>
              .
            */}
          </Typography>
          <Typography variant="h4" marginY={margin}>
            When we access or share your information
          </Typography>
          <Typography variant="body1" marginY={margin}>
            Given that we do not collect personally identifiable information,
            the only information we can access is:
          </Typography>
          <ul>
            <li>
              <strong>Source Code you submitted for execution.</strong>
              {' '}
              We are a research group studying how people learn to program.
              For this purpose, we study the code submitted for execution,
              as well as trajectories taken through our activities.
              We do this to compute statistics and
              to better understand the kind of mistakes and solutions produced.
              We will publish the findings of our studies,
              both as aggregate statistics,
              as well as concrete code fragements.
              For any code fragments we publish,
              we will ensure that they do not inadvertently contain
              personally identifiable information.
              We also may share the collected code fragments with other legitimate researchers,
              inside or outside Switzerland,
              who will bide by the same policy.
            </li>
            <li>
              <strong>Website Interaction Data.</strong>
              {' '}
              We periodically analyze the usage analytics data we collect.
            </li>
          </ul>
          <Typography variant="h4" marginY={margin}>
            Your rights with respect to your information
          </Typography>
          <Typography variant="body1" marginY={margin}>
            We strive to apply the same data rights to all users, regardless of their location.
            Some of these rights include:
          </Typography>
          <ul>
            <li>
              <strong>Right to Know. </strong>
              You have the right to know what personal information
              is collected, used, shared or sold.
              We outline both the categories and specific bits of data we collect,
              as well as how they are used, in this privacy policy.
              (In short: We do not collect your personal data.)
            </li>
            <li>
              <strong>Right of Access. </strong>
              This includes your right to access the personal information
              we gather about you,
              and your right to obtain information about the sharing,
              storage, security and processing of that information.
              (We do not collect your personal data.)
            </li>
            <li>
              <strong>Right to Correction. </strong>
              You have the right to request correction of your personal information.
              (We do not collect your personal data.)
            </li>
            <li>
              <strong>Right to Erasure / “To Be Forgotten”. </strong>
              This is your right to request, subject to certain limitations under applicable law,
              that your personal information be erased from our possession and, by extension,
              from all of our service providers.
              Fulfillment of some data deletion requests may prevent you from using our services
              because our applications may then no longer work.
              In such cases, a data deletion request may result in closing your account.
              (We do not collect your personal data.)
            </li>
            <li>
              <strong>Right to Complain. </strong>
              You have the right to make a complaint
              regarding our handling of your personal information
              with the appropriate supervisory authority.
              (We do not collect your personal data.)
            </li>
            <li>
              <strong>Right to Restrict Processing. </strong>
              This is your right to request restriction of how and why
              your personal information is used or processed,
              including opting out of sale of personal information.
              (We do not collect your personal data, and would not sell your personal data.)
            </li>
            <li>
              <strong>Right to Object. </strong>
              You have the right, in certain situations, to object
              to how or why your personal information is processed.
              (We do not collect your personal data.)
            </li>
            <li>
              <strong>Right to Portability. </strong>
              You have the right to receive the personal information we have about you
              and the right to transmit it to another party.
              If you want to access your PyTamaro web data stored in your browser,
              you can access it in your browser local storage.
              (We do not collect your personal data.)
            </li>
            <li>
              <strong>Right to not Be Subject to Automated Decision-Making. </strong>
              You have the right to object to and prevent any decision
              that could have a legal or similarly significant effect on you
              from being made solely based on automated processes.
              This right is limited if the decision is necessary for performance
              of any contract between you and us,
              is allowed by applicable law, or is based on your explicit consent.
              (We do not collect your personal data,
              and thus could not be involved in decisions that significantly affect you.)
            </li>
            <li>
              <strong>Right to Non-Discrimination. </strong>
              We do not and will not give you a lower level of customer service
              because you have exercised your data privacy rights.
              However, the exercise of certain rights may,
              by virtue of your exercising those rights, prevent you from using our services.
              (We do not collect your personal data,
              so we could not discriminate against you.)
            </li>
          </ul>
          <Typography variant="body1" marginY={margin}>
            If you have questions about exercising these rights or need assistance, contact us.
            If an authorized agent is corresponding on your behalf,
            we will need written consent with your signature before proceeding.
            If you are in the EU or UK, you can contact your data protection authority
            to file a complaint or learn more about local privacy laws.
          </Typography>
          <Typography variant="h4" marginY={margin}>
            How we secure your data
          </Typography>
          <Typography variant="body1" marginY={margin}>
            We do not store personally-identifiable data.
            The source code you submit for execution and the corresponding output
            is encrypted via SSL/TLS  when transmitted between your browser and our servers.
          </Typography>
          <Typography variant="h4" marginY={margin}>
            When transferring personal data from the EU
          </Typography>
          <Typography variant="body1" marginY={margin}>
            The European Data Protection Board (EDPB) has issued guidance
            that personal data transferred out of the EU
            must be treated with the same level of protection
            that is granted under EU privacy law.
            UK law provides similar safeguards
            for UK user data that is transferred out of the UK.
            However, we do not collect personally-identifiable data.
          </Typography>
          <Typography variant="h4" marginY={margin}>
            Changes & questions
          </Typography>
          <Typography variant="body1" marginY={margin}>
            We may update this policy as needed
            to comply with relevant regulations and reflect any new practices.
            Whenever we make a significant change to our policies,
            we will refresh the date at the top of this page
            and take any other appropriate steps to notify users.
          </Typography>
        </Container>
      </Box>
    </div>
  );
}
