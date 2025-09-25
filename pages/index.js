import Head from "next/head";
import ImageComponent from "@components/ImageComponent";

export default function Home() {
  return (
    <div className="container-fluid">
      <Head>
        <title>Snabb Studio | Simple Photography of Unplanned Moments</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Snabb Studio is not a typical photography service. I capture unplanned, everyday moments with humor, honesty, and a touch of fog. Follow along for artistic photography that notices what others miss."
        />
        <meta
          property="og:title"
          content="Snabb Studio | Artistic Photography of Unplanned Moments"
        />
        <meta
          property="og:description"
          content="I don’t take assignments. I just point the camera at things that look less boring than me."
        />
        <meta property="og:image" content="https://snabb.studio/A7C00885.jpg" />
        <meta property="og:url" content="https://snabb.studio" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Snabb Studio",
            "alternateName": "snabb.studio",
            "jobTitle": "Photographer / Artist",
            "description": "I capture unplanned, everyday moments with humor, honesty, and a touch of fog.",
            "url": "https://snabb.studio",
            "sameAs": [
              "https://www.instagram.com/yourhandle"
            ]
          }
          `}</script>
      </Head>
      <main className="d-flex justify-content-start align-items-start flex-column">
        <div className="flex-container mb-5 custom-max-width">
          <div className="row">
            <div className="hero my-5">Snabb studio</div>
            <h1>
              — pointing a camera at stuff that looks less boring since 2023
            </h1>
            <ImageComponent
              image="./A7C00699.jpg"
              altText="Boy walking up"
              orientation="landscape"
            />
            <ImageComponent
              image="./A7C00672.jpg"
              altText="Boy in sunshine"
              orientation="landscape"
            />

            <h2 className="pt-5 ">
              Focus has never been my strength — unless it’s set to auto.
            </h2>
            <ImageComponent
              image="./A7C00885.jpg"
              altText="A red bridge in malmö"
              orientation="landscape"
            />
            <h3 className="pt-5 ">
              Sometimes I just get lucky. I point, I shoot, and the moment stick
              with me long enough to be caught.
            </h3>
            <ImageComponent
              image="./A7C00427.jpg"
              altText="Boy at Rövearekulan"
              orientation="landscape"
            />
            <ImageComponent
              image="./A7C00410.jpg"
              altText="Trees at Rövearekulan"
              orientation="portrait"
            />
            <h3 className="pt-5 ">
              I don’t work on demand. I let the world surprise me — and
              sometimes, I get luckyish.
            </h3>
            <ImageComponent
              image="./A7C00375.jpg"
              altText="Balcony umbrellas"
              orientation="landscape"
            />
            <h3 className="pt-5 ">
              If my brain was a car, it’d still have plastic wheels. Luckily the
              camera steers straighter.
            </h3>
            <ImageComponent
              image="./A7C00121.jpg"
              altText="Corgi - AMC Pacer toy car"
              orientation="portrait"
            />
            <h3 className="pt-5">
              Tasked by{" "}
              <a href="https://kolossal.se/" target="_blank">
                Kolossal
              </a>{" "}
              to point my camera at the new{" "}
              <a href="https://www.kadodrinks.se/" target="_blank">
                Kado Drinks
              </a>{" "}
              ’s fresh design.
            </h3>
            <ImageComponent
              image="./A7C00133.jpg"
              altText="Kado in fridge"
              orientation="landscape"
            />
            <div className="col-6 mb-5">
              <ImageComponent
                image="./A7C00248.jpg"
                altText="Kado on bridge"
                orientation="portrait"
              />
            </div>
            <div className="col-6 mb-5">
              <ImageComponent
                image="./A7C00260.jpg"
                altText="Kado on bridge"
                orientation="portrait"
              />
            </div>
            <h1 className="pt-5">
              Fog makes the world softer. The camera makes it stay.
            </h1>
            <ImageComponent
              image="./A7C00017.jpg"
              altText="Foggy bridge"
              orientation="landscape"
            />
            <ImageComponent
              image="./A7C00633.jpg"
              altText="Foggy road"
              orientation="portrait"
            />
            <ImageComponent
              image="./A7C00790.jpg"
              altText="Foggy electric"
              orientation="portrait"
            />
          </div>
        </div>
        <div className="container-fluid custom-max-width">
          <div className="row justify-content-end py-5">
            <div className="col-9">
              <h4 className="pt-5">
                This site is like me — slow to update.{" "}
                <a href="https://www.instagram.com/snabb.studio/">Instagram</a>{" "}
                is quicker, but only a little.
              </h4>
            </div>
          </div>
          <div className="row justify-content-start py-5 mb-5">
            <div className="col-7 mb-5">
              <h4 className="pt-5 mb-5">
                <a href="mailto:s.sjoblom@gmail.com">Send me a message.</a> I’ll
                probably answer faster than a toy car in the fog.
              </h4>
            </div>
          </div>
        </div>
        <div className="container-fluid text-center py-3">
          <div className="row justify-content-center">
            <p className="text-center s">
              © 2025 Snabb Studio. All photos are mine, not yours. You may look,
              scroll, and admire — but don’t copy, steal, or use them for your
              own projects without asking. If you want to license an image,{" "}
              <a href="mailto:s.sjoblom@gmail.com">contact me</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
