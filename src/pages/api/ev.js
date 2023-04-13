// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import Cors from 'cors';
import crypto from 'crypto';

const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  if (req.method !== 'POST') return res.status(200).json({ name: 'Hi Franky' });

  const eventName = {
    name: 'dogAdded',
  };

  const bodyData = JSON.parse(req?.body);

  const subscriberHash = crypto
    .createHash('md5')
    .update(bodyData.email_address.toLowerCase())
    .digest('hex');

  const eventUrl = `https://us11.api.mailchimp.com/3.0/lists/19e84be598/members/${subscriberHash}/events`;
  try {
    await fetch(eventUrl, {
      method: 'POST',
      headers: {
        Authorization: process.env.API_KEY,
      },
      body: JSON.stringify(eventName),
    });

    res.status(200).json({ done: 'sent' });
  } catch (error) {
    console.error(error);
  }
}
