import Replicate from "replicate";
import WorkersKV from "@sagi.io/workers-kv";
import cookie from 'cookie';
import Cookies from 'js-cookie';
//const WorkersKV = require('@sagi.io/workers-kv')

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  userAgent: `${packageData.name}/${packageData.version}`
});
const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cfAuthKey = process.env.CLOUDFLARE_AUTH_KEY;
const cfEmail = process.env.CLOUDFLARE_EMAIL;
const namespaceId = process.env.CLOUDFLARE_NAMESPACE_ID;
const KV = new WorkersKV({
  cfAccountId,
  cfAuthKey,
  cfEmail,
});


const API_HOST = process.env.REPLICATE_API_HOST || "https://api.replicate.com";

import packageData from "../../../package.json";


export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const body = req.body;
  // 核销付费卡密
  if (body.prompt.startsWith('kmp'))
  {
    const key = body.prompt;
    const results = await KV.readKey({ key,namespaceId });
    if(results==="1")
    {
        // 给分享用户加积分
        if(body.srid)
        {
            const key = body.srid;
            let kmKey = await KV.readKey({ key, namespaceId });

            if(kmKey.result !== null) {
                // km does not exist, set its value to 1
                let kmvalue = await KV.readKey({key: kmKey, namespaceId});
                if (kmvalue.result === null) {
                    KV.writeKey({key: kmKey, value: "1", namespaceId});
                } else {
                    kmvalue = parseInt(kmvalue) + 1;
                    KV.writeKey({key: kmKey, value: kmvalue.toString(), namespaceId});
                }
            }
        }

        res.statusCode = 201;
        res.end(JSON.stringify({ id: 'last_image', status: 'process' }));
        const result =  await KV.deleteKey({ key,namespaceId });
        return;
    }else
    {
        res.statusCode = 201;
        res.end(JSON.stringify({ id: 'need_charge', status: 'COMPLETED' }));
        return;
    }

  }
//核销分享卡密
  if (body.prompt.startsWith('kms'))
  {
      const key = body.prompt;
      const value = await KV.readKey({ key,namespaceId });
      if(value.result!==null)
      {
         let share_num =  parseInt(value);
            if(share_num>0)
            {
                share_num = share_num -1;
                KV.writeKey({ key, value: share_num.toString(),namespaceId });
                console.log("set share_num !");
                res.setHeader('Set-Cookie', `share_num=${share_num}; path=/; HttpOnly`);
                res.statusCode = 201;
                res.end(JSON.stringify({ id: 'last_image', status: 'process' }));
                return;
            }else
            {
                res.statusCode = 201;
                res.end(JSON.stringify({ id: 'need_charge', status: 'COMPLETED' }));
                return;
            }
      }else
      {
            res.statusCode = 201;
            res.end(JSON.stringify({ id: 'need_charge', status: 'COMPLETED' }));
            return;
      }
  }


  if (body.image && body.image.startsWith('http')) {
    res.statusCode = 201;
    res.end(JSON.stringify({ id: 'local_demo', status: 'process' }));
    return;
  }


  // Get the 'last_image' value from the cookie
  const sid = cookies['sid'];
  const km = cookies['km'];
  const value = await KV.readKey({ key: sid, namespaceId });
  if(value.result===null)
  {
    KV.writeKey({ key: sid, value: km, namespaceId });
  }



    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it.");
    }

    // remove null and undefined values
    req.body = Object.entries(req.body).reduce(
        (a, [k, v]) => (v == null ? a : ((a[k] = v), a)),
        {}
    );

    let prediction
    const response = await fetch(`${API_HOST}/run`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body:  JSON.stringify({ input: req.body })
    });
    if (response.status !== 200) {
      let error = await response.json();
      res.statusCode = 500;
      res.end(JSON.stringify({ detail: error.detail }));
      return;
    }
    prediction = await response.json();


    res.statusCode = 201;
    res.end(JSON.stringify(prediction));
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
