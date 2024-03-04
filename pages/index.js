import Messages from "components/messages";
import PromptForm from "components/prompt-form";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import Footer from "components/footer";
import prepareImageFileForUpload from "lib/prepare-image-file-for-upload";
import { getRandomSeed } from "lib/seeds";
import Cookies from 'js-cookie';


function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const appName = "美女换换衣";
export const appSubtitle = "上传美女照片，AI帮你'换'衣服";
export const appMetaDescription = "Edit your photos using written instructions, with the help of an AI.";
export const url_filter = "zhanyin";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [seed] = useState(getRandomSeed());
  const [initialPrompt, setInitialPrompt] = useState(seed.prompt);
  const [api_status, setApiStatus] = useState("DEMO");

  const router = useRouter()
  const [srid, setSrid] = useState(null);
  const [share_id, setShareId] = useState(null);
  const [shaer_km, setShareKm] = useState(null);

  useEffect(() => {
    let sid = Cookies.get('sid');
    if (!sid) {
      let sid = generateRandomString();
      let km = generateRandomString();
      setShareId(sid);
      setShareKm(km);
      Cookies.set('sid', sid);
      Cookies.set('km', 'kms'+km);
    }
  }, []);

  useEffect(() => {
    if (router.isReady) {
      setSrid(router.query.sid);
    }
  }, [router.isReady, router.query]);
  // set the initial image from a random seed
  useEffect(() => {
    setEvents([{ image: seed.image }]);
  }, [seed.image]);

  const handleImageDropped = async (image) => {
    try {
      image = await prepareImageFileForUpload(image);
    } catch (error) {
      setError(error.message);
      return;
    }
    setEvents(events.concat([{ image }]));
  };

  const handleSubmit = async (e,selectValue) => {
    e.preventDefault();

    const prompt = e.target.prompt.value;
    const lastImage = events.findLast((ev) => ev.image)?.image;
    const type = selectValue;

    setError(null);
    setIsProcessing(true);
    setInitialPrompt("");

    // make a copy so that the second call to setEvents here doesn't blow away the first. Why?
    const myEvents = [...events, { prompt }];
    setEvents(myEvents);

    const body = {
      prompt,
      image: lastImage,
      srid,
    };

    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let prediction = await response.json();
    if(prediction.id === "need_charge")
    {
      setEvents(
          myEvents.concat([
            { status: "need_charge"},
          ])
      );
    }
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }
    while (
      prediction.status !== "COMPLETED" && prediction.status !=="COMPLETED_Cookie"  && prediction.status !== "DEMO" &&
      prediction.status !== "failed"
    ) {
      await sleep(500);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      setQueuePosition(prediction.queue_position);
      setApiStatus(prediction.status);
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }

      // just for bookkeeping
      setPredictions(predictions.concat([prediction]));
      if (prediction.status === "COMPLETED" || prediction.status === "DEMO" || prediction.status === "COMPLETED_Cookie") {
          const image_not_blur = prediction.output[1];
          if(image_not_blur.includes(url_filter))
            {
              let encodedImage = btoa(image_not_blur);
              document.cookie = `last_image=${encodedImage}; path=/`;
            }
        setEvents(
          myEvents.concat([
            { image: prediction.output[0],status: prediction.status, share_num: prediction.share_num,queue_position:prediction.queue_position},
          ])
        );
      }
    }

    setIsProcessing(false);
  };

  const startOver = async (e) => {
    e.preventDefault();
    setEvents(events.slice(0, 1));
    setError(null);
    setIsProcessing(false);
    setInitialPrompt(seed.prompt);
  };

  return (
    <div>
      <Head>
        <title>{appName}</title>
        <meta name="description" content={appMetaDescription} />
        <meta property="og:title" content={appName} />
        <meta property="og:description" content={appMetaDescription} />
        <meta property="og:image" content="https://paintbytext.chat/opengraph.jpg" />
      </Head>

      <main className="container max-w-[700px] mx-auto p-5">
        <hgroup>
          <h1 className="text-center text-5xl font-bold m-6">{appName}</h1>
          <p className="text-center text-xl opacity-60 m-6">
            {appSubtitle}
          </p>
        </hgroup>

        <Messages
          events={events}
          isProcessing={isProcessing}
          queuePosition={queuePosition}
          onUndo={(index) => {
            setInitialPrompt(events[index - 1].prompt);
            setEvents(
              events.slice(0, index - 1).concat(events.slice(index + 1))
            );
          }}
        />

        <PromptForm
          initialPrompt={initialPrompt}
          isFirstPrompt={events.length === 1}
          onSubmit={handleSubmit}
          disabled={isProcessing}
          status={api_status}
        />

        <div className="mx-auto w-full">
          {error && <p className="bold text-red-500 pb-5">{error}</p>}
        </div>

        <Footer
          events={events}
          startOver={startOver}
          handleImageDropped={handleImageDropped}
        />
      </main>
    </div>
  );
}
