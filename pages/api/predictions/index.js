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

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const api_url = process.env.BASE_URL;

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
};

const payload = {
    'model': 'gpt-3.5-turbo',
    "messages": [
        {
            "role": "system",
            "content": `
            Stable Diffusion prompt 助理
你来充当一位有艺术气息的Stable Diffusion prompt 助理。

任务
我用自然语言告诉你要生成的prompt的主题，你的任务是根据这个主题想象一幅完整的画面，然后转化成一份详细的、高质量的prompt，让Stable Diffusion可以生成高质量的图像。

背景介绍
Stable Diffusion是一款利用深度学习的文生图模型，支持通过使用 prompt 来产生新的图像，描述要包含或省略的元素。

prompt 概念
prompt 用来描述图像，由普通常见的单词构成，使用英文半角","做为分隔符。
以","分隔的每个单词或词组称为 tag。所以prompt由系列由","分隔的tag组成的。
() 和 [] 语法
调整关键字强度的等效方法是使用 () 和 []。 (keyword) 将tag的强度增加 1.1 倍，与 (keyword:1.1) 相同，最多可加三层。 [keyword] 将强度降低 0.9 倍，与 (keyword:0.9) 相同。

Prompt 格式要求
下面我将说明 prompt 的生成步骤，这里的 prompt 可用于描述人物、风景、物体或抽象数字艺术图画。你可以根据需要添加合理的、但不少于5处的画面细节。

prompt 要求
你输出的 Stable Diffusion prompt 以“Prompt:”开头。
prompt 内容包含画面主体、材质、附加细节、图像质量、艺术风格、色彩色调、灯光等部分，但你输出的 prompt 不能分段，例如类似"medium:"这样的分段描述是不需要的，也不能包含":"和"."。
画面主体：不简短的英文描述画面主体, 如 A girl in a garden，主体细节概括（主体可以是人、事、物、景）画面核心内容。这部分根据我每次给你的主题来生成。你可以添加更多主题相关的合理的细节。
对于人物主题，你必须描述人物的眼睛、鼻子、嘴唇，例如'beautiful detailed eyes,beautiful detailed lips,extremely detailed eyes and face,longeyelashes'，以免Stable Diffusion随机生成变形的面部五官，这点非常重要。你还可以描述人物的外表、情绪、衣服、姿势、视角、动作、背景等。人物属性中，1girl表示一个女孩，2girls表示两个女孩。
材质：用来制作艺术品的材料。 例如：插图、油画、3D 渲染和摄影。 Medium 有很强的效果，因为一个关键字就可以极大地改变风格。
附加细节：画面场景细节，或人物细节，描述画面细节内容，让图像看起来更充实和合理。这部分是可选的，要注意画面的整体和谐，不能与主题冲突。
图像质量：这部分内容开头永远要加上“(best quality,4k,8k,highres,masterpiece:1.2),ultra-detailed,(realistic,photorealistic,photo-realistic:1.37)”， 这是高质量的标志。其它常用的提高质量的tag还有，你可以根据主题的需求添加：HDR,UHD,studio lighting,ultra-fine painting,sharp focus,physically-based rendering,extreme detail description,professional,vivid colors,bokeh。
艺术风格：这部分描述图像的风格。加入恰当的艺术风格，能提升生成的图像效果。常用的艺术风格例如：portraits,landscape,horror,anime,sci-fi,photography,concept artists等。
色彩色调：颜色，通过添加颜色来控制画面的整体颜色。
灯光：整体画面的光线效果。
tag 内容用英语单词或短语来描述，并不局限于我给你的单词。注意只能包含关键词或词组。
注意不要输出句子，不要有任何解释。
tag不要带引号("")。
使用英文半角","做分隔符。
tag 按重要性从高到低的顺序排列。
我给你的主题可能是用中文描述，你给出的prompt只用英文。
tag数量限制40个以内，单词数量限制在60个以内。你给出的prompt只用英文，不要给出解释内容
                       `
        },
        {
            "role": "user",
            "content": "我的第一个主题是： 制服",
        }
    ],
};

const KV = new WorkersKV({
  cfAccountId,
  cfAuthKey,
  cfEmail,
});


const API_HOST = process.env.REPLICATE_API_HOST || "https://api.replicate.com";

import packageData from "../../../package.json";


function isIntentUndress(prompt) {
    const undressKeywords = ["脱", "光", "一丝", "裸", "模特", "人体"];
    const regex = new RegExp(undressKeywords.join("|"), "g");
    return regex.test(prompt);
}

async function handlePrompt(promptContent) {

    if (isIntentUndress(promptContent)) {
        return "";
    }


    payload.messages.find(message => message.role === 'user').content ="我的第一个主题是："+ promptContent;
    try {
        const response = await fetch(api_url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json_data = await response.json();
        console.log("json data", json_data);
        const ret = json_data["choices"][0]['message']['content'].trim();
        const processedRet = ret.replace("Prompt: ", "").split('\n')[0];
        console.log("processedRet:", processedRet);
        return processedRet;
    } catch (error) {
        console.log(`Request error: ${error}`);
    }

}

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

    if (!body.prompt) {
        body.prompt = await handlePrompt("比基尼");
    } else {
        body.prompt = await handlePrompt(body.prompt);
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
