// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import Cors from 'cors';
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
  try {
    const chimpRequest = await fetch(
      'https://us11.api.mailchimp.com/3.0/lists/19e84be598/members',
      {
        method: 'POST',
        headers: {
          Authorization: process.env.API_KEY,
        },
        body: req.body,
      }
    );

    const data = await chimpRequest.json();
    console.log(req.body);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
  }
}
