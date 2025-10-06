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
          content="Snabb Studio is not a typical photography service. I capture unplanned, everyday moments with humor, honesty, and often a touch of fog."
        />
        <meta
          property="og:title"
          content="Snabb Studio | Photography of Unplanned Moments"
        />
        <meta
          property="og:description"
          content="Snabb Studio is not a typical photography service. I capture unplanned, everyday moments with humor, honesty, and often a touch of fog."
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
              "https://www.instagram.com/snabb.studio"
            ]
          }
          `}</script>
      </Head>
      <main className="d-flex justify-content-start align-items-start flex-column">
        <div className="flex-container mb-5 custom-max-width">
          <div className="row">
            <div className="hero my-5">
              Snabb studio
            </div>
            <h1 className="mb-5">
              — pointing a camera at less boring stuff since 2023
            </h1>
            <div class="masonry wrapper switcher">
              <div class="flow">
                <img src="./A7C00127-HDR.jpg" alt="" />
                <img src="./A7C00699.jpg" alt="" />
                <img src="./A7C00672.jpg" alt="" />
                <img src="./A7C00885.jpg" alt="" />
                <img src="./A7C00427.jpg" alt="" />
                <img src="./A7C00410.jpg" alt="" />
                <img src="./A7C00023.jpg" alt="" />
                <img src="./A7C00138.jpg" alt="" />
                <img src="./A7C00267.jpg" alt="" />
                <img src="./A7C00326.jpg" alt="" />
                <img src="./A7C00641.jpg" alt="" />
                <img src="./A7C01079.jpg" alt="" />
              </div>
              <div class="flow">
                <img src="./A7C00375.jpg" alt="" />
                <img src="./A7C00015-HDR.jpg" alt="" />
                <img src="./A7C00121.jpg" alt="" />
                <img src="./A7C00133.jpg" alt="" />
                <img src="./A7C00248.jpg" alt="" />
                <img src="./A7C00195.jpg" alt="" />
                <img src="./A7C00289.jpg" alt="" />
                <img src="./A7C00621.jpg" alt="" />
                <img src="./A7C00639.jpg" alt="" />
                <img src="./A7C00651.jpg" alt="" />
                <img src="./A7C00844.jpg" alt="" />
              </div>
              <div class="flow">
                <img src="./A7C00260.jpg" alt="" />
                <img src="./A7C00017.jpg" alt="" />
                <img src="./A7C00633.jpg" alt="" />
                <img src="./A7C00790.jpg" alt="" />
                <img src="./A7C00248-2.jpg" alt="" />
                <img src="./A7C00298.jpg" alt="" />
                <img src="./A7C00627.jpg" alt="" />
                <img src="./A7C00785.jpg" alt="" />
                <img src="./A7C01333.jpg" alt="" />
              </div>
            </div>
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
