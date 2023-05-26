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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  if (req.method !== 'POST') return res.status(200).json({ name: 'Hi Franky' });

  const bodyData = JSON.parse(req?.body);

  const customerReq = {
    customer: {
      first_name: bodyData.name,
      email: bodyData.email,
      verified_email: true,
      password: bodyData.pass,
      password_confirmation: bodyData.pass,
      send_email_welcome: false,
      note: bodyData.dogsData,
    },
  };

  const url = `https://for-franky-2023.myshopify.com/admin/api/2023-04/customers.json`;
  try {
    const customerResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.TOKEN,
      },
      body: JSON.stringify(customerReq),
    });

    res.status(200).json(await customerResponse.json());
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
}
