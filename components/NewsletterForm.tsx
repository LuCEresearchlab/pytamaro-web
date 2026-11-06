import { createElement, useEffect } from 'react';

export default function NewsletterForm() {
  // <script> tags don't run when rendered via JSX, so load them here, in order
  useEffect(() => {
    const srcs = [
      [
        'https://newsletter.infomaniak.com/v3/static/mcaptcha/altcha.min.js?v=1793970000',
        'module',
      ],
      [
        'https://newsletter.infomaniak.com/v3/static/mcaptcha/altcha-index.js?v=1793970000',
      ],
      [
        'https://newsletter.infomaniak.com/v3/static/webform_index.js?v=1793970000',
      ],
    ];
    let cancelled = false;
    (async () => {
      for (const [src, type] of srcs) {
        if (cancelled || document.querySelector(`script[src="${src}"]`))
          continue;
        await new Promise((resolve) => {
          const s = document.createElement('script');
          s.src = src;
          if (type !== undefined) s.type = type;
          s.onload = s.onerror = resolve;
          document.body.appendChild(s);
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <form
      method='post'
      action='https://newsletter.infomaniak.com/v3/api/1/newsletters/webforms/21944/submit'
      className='inf-form'
    >
      <input
        type='text'
        name='inf_email_check'
        autoComplete='off'
        tabIndex={-1}
        aria-hidden='true'
        style={{ display: 'none' }}
      />
      <input
        type='text'
        name='website'
        autoComplete='off'
        tabIndex={-1}
        aria-hidden='true'
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      />
      <input
        type='hidden'
        name='key'
        value='eyJpdiI6ImJYOXh2dDd4Qjg1dWNqRTRlalFURDNMb3BPQ1wvN1ZYbE5KSmhRcldPUzZFPSIsIm1hYyI6IjE3MGEzZGQzNjU3MDcxZGIwMjMyMzA2YWMwMDYwMTczZWE5OGRlMWY5OTBlMDU5YTRmZTVhOTVkZTUxMTJlMDYiLCJ2YWx1ZSI6Ik9iRXpobkxSa2NGMEM2eTNaeDZlWVBwNWFWdlVUVXQ3QXd2anF5YlVrSWs9In0='
        readOnly
      />
      <input type='hidden' name='webform_id' value='21944' readOnly />
      <style>{` .inf-main_1ffef630011b95d233d7dd7c7b078568{ background-color:#f5f5f5; padding:25px 20px; } .inf-main_1ffef630011b95d233d7dd7c7b078568 .inf-content { margin-top:13px;} .inf-main_1ffef630011b95d233d7dd7c7b078568 h4, .inf-main_1ffef630011b95d233d7dd7c7b078568 span, .inf-main_1ffef630011b95d233d7dd7c7b078568 label, .inf-main_1ffef630011b95d233d7dd7c7b078568 input, .inf-main_1ffef630011b95d233d7dd7c7b078568 select, .inf-main_1ffef630011b95d233d7dd7c7b078568 .inf-submit, .inf-main_1ffef630011b95d233d7dd7c7b078568 .inf-success p a { color:#555555; font-size:14px; } .inf-main_1ffef630011b95d233d7dd7c7b078568 h4{ font-size:18px; margin:0px 0px 13px 0px; } .inf-main_1ffef630011b95d233d7dd7c7b078568 h4, .inf-main_1ffef630011b95d233d7dd7c7b078568 label{ font-weight:bold; } .inf-main_1ffef630011b95d233d7dd7c7b078568 .inf-input { margin-bottom:7px; } .inf-main_1ffef630011b95d233d7dd7c7b078568 label { display:block;} .inf-main_1ffef630011b95d233d7dd7c7b078568 input, .inf-main_1ffef630011b95d233d7dd7c7b078568 select{ height:35px; color:#999999; border: 1px solid #E9E9E9; border:none; padding-left:7px; } .inf-main_1ffef630011b95d233d7dd7c7b078568 select{ background-color:#fff; } .inf-main_1ffef630011b95d233d7dd7c7b078568 .inf-input.inf-error label, .inf-main_1ffef630011b95d233d7dd7c7b078568 .inf-input.inf-error span.inf-message{ color: #cc0033; } .inf-main_1ffef630011b95d233d7dd7c7b078568 .inf-input.inf-error input, .inf-main_1ffef630011b95d233d7dd7c7b078568 .inf-input.inf-error select{ border: 1px solid #cc0033; } .inf-main_1ffef630011b95d233d7dd7c7b078568 .inf-input input, .inf-main_1ffef630011b95d233d7dd7c7b078568 .inf-input select { width:100%;} .inf-main_1ffef630011b95d233d7dd7c7b078568 .inf-input.inf-error span.inf-message { display: block; } .inf-main_1ffef630011b95d233d7dd7c7b078568 .inf-submit { text-align:right;} .inf-main_1ffef630011b95d233d7dd7c7b078568 .inf-submit input{ background-color:#777777; color:#ffffff; border:none; font-weight: normal; height:auto; padding:7px; } .inf-main_1ffef630011b95d233d7dd7c7b078568 .inf-submit input.disabled{ opacity: 0.4; } .inf-btn { color: rgb(85, 85, 85); border: medium none; font-weight: normal; height: auto; padding: 7px; display: inline-block; background-color: white; box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.24); border-radius: 2px; line-height: 1em; } .inf-rgpd { margin:25px 0px 15px 0px; color:#555555; } .altcha-label span { color: #555 } `}</style>
      <div className='inf-main_1ffef630011b95d233d7dd7c7b078568'>
        {' '}
        <h4>Subscribe to LuCE News</h4>{' '}
        <span>
          Would you like to receive the newsletter from the LuCE Research Lab at
          USI and stay on top of PyTamaro developments? Subscribe to our
          newsletter:
        </span>{' '}
        <div className='inf-success' style={{ display: 'none' }}>
          {' '}
          <h4>Your registration has been successfully completed!</h4>{' '}
          <p>
            {' '}
            <a href='#' className='inf-btn'>
              &laquo;
            </a>{' '}
          </p>{' '}
        </div>{' '}
        <div className='inf-content'>
          {' '}
          <div className='inf-input inf-input-text'>
            {' '}
            <input
              type='email'
              name='inf[1]'
              data-inf-meta='1'
              data-inf-error=''
              required
              placeholder='Email *'
            />{' '}
          </div>{' '}
          <div className='inf-input inf-input-text'>
            {' '}
            <input
              type='text'
              name='inf[2]'
              data-inf-meta='2'
              data-inf-error=''
              required
              placeholder='First Name *'
            />{' '}
          </div>{' '}
          <div className='inf-input inf-input-text'>
            {' '}
            <input
              type='text'
              name='inf[3]'
              data-inf-meta='3'
              data-inf-error=''
              required
              placeholder='Last Name *'
            />{' '}
          </div>{' '}
          <div className='inf-input inf-input-text'>
            {' '}
            <input
              type='text'
              name='inf[76561]'
              data-inf-meta='76561'
              data-inf-error=''
              placeholder='School I teach at '
            />{' '}
          </div>{' '}
          <div className='inf-input inf-input-text'>
            {' '}
            <select
              name='inf[95419]'
              data-inf-meta='95419'
              data-inf-error=''
              defaultValue=''
            >
              {' '}
              <option value=''>Language I teach in</option>{' '}
              <option value='Deutsch'>Deutsch</option>{' '}
              <option value='Italiano'>Italiano</option>{' '}
              <option value='Français'>Français</option>{' '}
              <option value='English'>English</option>{' '}
              <option value='Other'>Other</option>{' '}
            </select>{' '}
          </div>{' '}
          <div className='inf-rgpd'>
            Your email address is only used to send you our newsletter and
            information about our activities. You can unsubscribe at any time
            using the unsubscribe link included in each of our emails.
          </div>{' '}
          {createElement('altcha-widget', {
            hidelogo: 'true',
            hidefooter: 'true',
            floating: 'true',
            challengeurl:
              'https://newsletter.infomaniak.com/v3/altcha-challenge',
          })}
          <div className='inf-submit'>
            {' '}
            <input
              type='submit'
              value='Subscribe'
              style={{ cursor: 'pointer' }}
            />{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
    </form>
  );
}
