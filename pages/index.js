import Head from "next/head";


export default function Home() {
  return (
    <div className="container-fluid">
      <Head>
        <title>Snabb Studio | "Artsy" Photography of Unplanned Moments</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Snabb Studio is not a typical photography service. I capture unplanned, everyday moments with humor, honesty, and a touch of fog. Follow along for artistic photography that notices what others miss."/>
        <meta property="og:title" content="Snabb Studio | Artistic Photography of Unplanned Moments"/>
        <meta property="og:description" content="I don’t take assignments. I just point the camera at things that look less boring than me."/>
        <meta property="og:image" content="https://snabb.studio/A7C00885.jpg"/>
        <meta property="og:url" content="https://snabb.studio"/>
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
        <div className="flex-container my-5 pt-5 custom-max-width">
          <div className="row">
            <h1>
              Snabb.studio — pointing a camera at stuff that looks less boring
              since 2023
            </h1>
            <img
              className="py-3 py-md-5 landscape"
              src="./A7C00699.jpg"
              class="img-fluid"
              alt="Boy walking up"
            />
            <img
              className="py-3 py-md-5 landscape"
              src="./A7C00672.jpg"
              class="img-fluid"
              alt="Boy in sunshine"
            />
            <h2 className="pt-5 ">
              Focus has never been my strength — unless it’s set to auto.
            </h2>
            <img
              className="py-3 py-md-5 landscape"
              src="./A7C00885.jpg"
              class="img-fluid"
              alt="A red bridge in malmö"
            />
            <h3 className="pt-5 ">
              Sometimes I just get lucky. I point, I shoot, and the moment stick
              with me long enough to be caught.
            </h3>
            <img
              className="py-3 py-md-5 landscape"
              src="./A7C00427.jpg"
              class="img-fluid"
              alt="Boy at rövearekulan"
            />
            <h3 className="pt-5 ">
              I don’t work on demand. I let the world surprise me — and
              sometimes, I get luckyish.
            </h3>
            <img
              className="py-3 py-md-5 landscape"
              src="./A7C00375.jpg"
              class="img-fluid"
              alt="Balcony umbrellas"
            />
            <h3 className="pt-5 ">
              If my brain was a car, it’d still have plastic wheels. Luckily the
              camera steers straighter.
            </h3>
            <img
              className="py-3 py-md-5 portrait"
              src="./A7C00121.jpg"
              class="img-fluid"
              alt="Corgi - AMC Pacer toy car"
            />
            <h1 className="pt-5">
              Fog makes the world softer. The camera makes it stay.
            </h1>
            <img
              className="py-3 py-md-5 landscape"
              src="./A7C00017.jpg"
              class="img-fluid"
              alt="Foggy bridge"
            />
            <img
              className="py-3 py-md-5 portrait"
              src="./A7C00633.jpg"
              class="img-fluid"
              alt="FOggy road"
            />
            <img
              className="py-3 py-md-5 portrait"
              src="./A7C00790.jpg"
              class="img-fluid"
              alt="Foggy electric"
            />
          </div>
        </div>
        <div class="container-fluid custom-max-width">
          <div class="row justify-content-end py-5">
            <div class="col-9">
              <h4 className="pt-5">
                This site is like me — slow to update.{" "}
                <a href="https://www.instagram.com/snabb.studio/">Instagram</a>{" "}
                is quicker, but only a little.
              </h4>
            </div>
          </div>
          <div class="row justify-content-start py-5 mb-5">
            <div class="col-7 mb-5">
              <h4 className="pt-5 mb-5">
              <a href="mailto:s.sjoblom@gmail.com">Send me a message.</a> I’ll
                probably answer faster than a toy car in the fog.
              </h4>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
