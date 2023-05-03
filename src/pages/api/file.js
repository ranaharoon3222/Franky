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
  console.log(req?.body);

  const bodyData = JSON.parse(req?.body);

  const postImageUrl = `https://us11.api.mailchimp.com/3.0/file-manager/files`;
  try {
    const postImg = await fetch(postImageUrl, {
      method: 'POST',
      headers: {
        Authorization: process.env.API_KEY,
      },
      body: JSON.stringify({
        name: bodyData.name,
        file_data: bodyData.imgData,
      }),
    });

    res.status(200).json(await postImg.json());
  } catch (error) {
    console.error(error);
  }
}
