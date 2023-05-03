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

  // const eventName = {
  //   name: 'dogAdded',
  // };

  const bodyData = JSON.parse(req?.body);
  const mg = bodyData.merge_fields;

  const subscriberHash = crypto
    .createHash('md5')
    .update(bodyData.email_address.toLowerCase())
    .digest('hex');

  const url = `https://us11.api.mailchimp.com/3.0/lists/19e84be598/members/${subscriberHash}`;
  const eventUrl = `https://us11.api.mailchimp.com/3.0/lists/19e84be598/members/${subscriberHash}/events`;
  try {
    const already = await fetch(url, {
      headers: {
        Authorization: process.env.API_KEY,
      },
    });

    const isAlready = await already.json();
    const dupData = isAlready.merge_fields;

    if (isAlready?.status === 404 || isAlready.status === 'archived') {
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

      // await fetch(eventUrl, {
      //   method: 'POST',
      //   headers: {
      //     Authorization: process.env.API_KEY,
      //   },
      //   body: JSON.stringify(eventName),
      // });

      const data = await chimpRequest.json();
      res.status(200).json(data);
    } else {
      const finalData = {
        DOGNAME: `${dupData.DOGNAME} / ${mg.DOGNAME}`,
        BREED: `${dupData.BREED} / ${mg.BREED}`,
        WEIGHT: `${dupData.WEIGHT} / ${mg.WEIGHT}`,
        DOGAGE: `${dupData.DOGAGE} / ${mg.DOGAGE}`,
        DOGSEX: `${dupData.DOGSEX} / ${mg.DOGSEX}`,
        DOGAL: `${dupData.DOGAL} / ${mg.DOGAL}`,
        DESEXED: `${dupData.DESEXED} / ${mg.DESEXED}`,
        BODYSCORE: `${dupData.BODYSCORE} / ${mg.BODYSCORE}`,
        DAILYALL: `${dupData?.DAILYALL} / ${mg?.DAILYALL}`,
        MONTHLYALL: `${dupData?.MONTHLYALL} / ${mg?.MONTHLYALL}`,
        CART: `${dupData.CART} / ${mg.CART}`,
        IMAGE: `${dupData?.IMAGE}-------${mg.IMAGE}`,
      };

      const updatedSubs = {
        merge_fields: finalData,
      };

      const chimpRequest = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: process.env.API_KEY,
        },
        body: JSON.stringify(updatedSubs),
      });

      // await fetch(eventUrl, {
      //   method: 'POST',
      //   headers: {
      //     Authorization: process.env.API_KEY,
      //   },
      //   body: JSON.stringify(eventName),
      // });

      const data = await chimpRequest.json();
      res.status(200).json(data);
    }
  } catch (error) {
    console.error(error);
  }
}
