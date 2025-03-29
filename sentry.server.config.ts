// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

process.env.NODE_ENV === 'production' &&
  Sentry.init({
    dsn: 'https://ed55fbd244354966bdb29c79cdc709bf@sentry.luce.si.usi.ch/1',

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
