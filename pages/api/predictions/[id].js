const API_HOST = process.env.REPLICATE_API_HOST || "https://api.replicate.com";

export default async function handler(req, res) {
  if (req.query.id === "local_demo") {
    // Return your desired result here
    await new Promise(resolve => setTimeout(resolve, 5000));
    res.end(JSON.stringify({ status: "COMPLETED" , output: "https://f005.backblazeb2.com/file/demo-image/after.png"}));
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
