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

  const getCustomerUrl = `https://for-franky-2023.myshopify.com/admin/api/2023-04/customers/${bodyData.id}/metafields.json`;

  try {
    const customerResponse = await fetch(getCustomerUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.TOKEN,
      },
    });

    const data = await customerResponse.json();

    const metaId = data.metafields[0].id;

    const updateUrl = `https://for-franky-2023.myshopify.com/admin/api/2023-04/customers/${bodyData.id}/metafields/${metaId}.json`;

    let allmeta = [bodyData.dogsData];
    data.metafields.forEach((item) => {
      const oldVal = JSON.parse(item.value);
      allmeta = [...allmeta, ...oldVal];
    });

    const updateReq = {
      metafield: {
        value: JSON.stringify(allmeta),
        type: 'json',
      },
    };

    const updateMeta = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.TOKEN,
      },
      body: JSON.stringify(updateReq),
    });

    const updatedResponse = await updateMeta.json();

    res.status(200).json(updatedResponse);
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
}
