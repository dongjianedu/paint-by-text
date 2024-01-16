import Cookies from "js-cookie";

const API_HOST = process.env.REPLICATE_API_HOST || "https://api.replicate.com";
import cookie from 'cookie';
export default async function handler(req, res) {
  if (req.query.id === "local_demo") {
    // Return your desired result here
    await new Promise(resolve => setTimeout(resolve, 5000));
    res.end(JSON.stringify({ status: "DEMO" ,
      output: ["https://f005.backblazeb2.com/file/demo-image/after.png","https://f005.backblazeb2.com/file/demo-image/after.png"]
    }));
    return;
  }
  // Check if the prompt starts with 'kmp'
  if (req.query.id === "last_image") {
    const cookies = cookie.parse(req.headers.cookie || '');

    // Get the 'last_image' value from the cookie
    const lastImage = cookies['last_image'];

    // Decode the 'last_image' value from base64
    let decodedImage = atob(lastImage);
    const share_num = cookies['share_num'];
    console.log("share_num:");
    console.log(share_num);
    // Set the 'last_image' value to 'events'
    res.end(JSON.stringify({ status: "COMPLETED_Cookie" ,
      output: [decodedImage,"https://f005.backblazeb2.com/file/demo-image/after.png"],
      share_num:share_num
    }));

    return;
  }


  const response = await fetch(`${API_HOST}/status/${req.query.id}`, {
    headers: {
      Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  if (response.status !== 200) {
    let error = await response.json();
    res.statusCode = 500;
    res.end(JSON.stringify({ detail: error.detail }));
    return;
  }

  const prediction = await response.json();
  res.end(JSON.stringify(prediction));
}
