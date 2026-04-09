import Head from "next/head";
import { useState, useEffect } from "react";
import { GridFour, Rectangle } from "phosphor-react";
import { ReactLenis, useLenis } from "lenis/react";

const imageColumns = [
  [
    "7RV00310.jpg",
    "7RV00648.jpg",
    "7RV00359.jpg",
    "7RV00064.jpg",
    "A7C00672.jpg",
    "A7C00427.jpg",
    "A7C00023.jpg",
    "A7C00267.jpg",
    "A7C00641.jpg",
  ],
  [
    "7RV00537.jpg",
    "A7C00375.jpg",
    "A7C00015-HDR.jpg",
    "A7C00195.jpg",
    "A7C00289.jpg",

    "A7C00844.jpg",
  ],
  [
    "A7C00017.jpg",
    "A7C00633.jpg",
    "A7C00790.jpg",
    "A7C00248-2.jpg",
    "A7C00298.jpg",
    "A7C00627.jpg",
    "A7C00785.jpg",
  ],
];

export default function Home() {
  const [layoutMode, setLayoutMode] = useState("fullwidth");
  const allImages = imageColumns.flat();

  useEffect(() => {
    let smoother;

    if (typeof window === "undefined") return;

    setTimeout(() => {
      // Using CSS smooth scrolling - no GSAP needed
      console.log("Using CSS smooth scrolling");
    }, 500);

    // Disable right-click on images
    const handleContextMenu = (e) => {
      if (e.target.tagName === "IMG") e.preventDefault();
    };

    // Disable drag-and-drop of images
    const handleDragStart = (e) => {
      if (e.target.tagName === "IMG") e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      if (smoother) smoother.kill();
    };
  }, []);

  return (
    <>
      <ReactLenis root />
      <Head>
        <title>Snabb Studio – with the intention to make photos that feel like something</title>
        <link rel="icon" href="/icon.svg" />
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
        <script type="application/ld+json">{`{"@context": "https://schema.org", "@type": "Person", "name": "Snabb Studio", "alternateName": "snabb.studio", "jobTitle": "Photographer / Artist", "description": "photography with the intention to make something you feel not something you understand", "url": "https://snabb.studio", "sameAs": ["https://www.instagram.com/snabb.studio"]}`}</script>
      </Head>

      <div>
        <main className="d-flex justify-content-start align-items-start flex-column">
          {/* Gallery */}
          <div
            className={`masonry wrapper ${layoutMode === "fullwidth" ? "fullwidth" : ""}`}
          >
            <div className="switcher">
              {layoutMode === "masonry" ? (
                imageColumns.map((column, index) => (
                  <div key={index} className="flow">
                    {column.map((src) => (
                      <div key={src} className="image-protection">
                        <img src={`/${src}`} alt="" />
                        <div className="image-overlay"></div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="flow">
                  {allImages.map((src) => (
                    <div key={src} className="image-protection">
                      <img src={`/${src}`} alt="" />
                      <div className="image-overlay"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>


          {/* Copyright */}
          <div className="container-fluid text-center py-3 pt-4">
            <div className="row justify-content-center">
              <p className="text-center s">
                © 2026 Snabb Studio. All photos are mine, not yours. You may
                look, scroll, and admire — but don't copy, steal, or use them
                for your own projects without asking. If you want to license an
                image, <a href="mailto:s.sjoblom@gmail.com">contact me</a>.
              </p>
            </div>
          </div>
        </main>
      </div>


      <div
      >
        <div className="flex-container mb-5 custom-max-width">
          <div className="row">
            <div className="hero fixed-center w-80 mb-5 pb-5">
              <img src="/logo.svg" className="img-fluid w-100 mb-5 pb-5" alt="" />
            </div>
            <div className="fixed-center w-80 blend-difference mt-5 pt-5">
              <h6 className="pt-5 mt-5 hero-subtitle">
                with the intention to make photos that feel like something
              </h6>
            </div>
{/*             <div
              className="layout-toggle mb-4 fixed-center"
              style={{ pointerEvents: "auto" }}
            >
              <button
                type="button"
                className="toggle-switch"
                onClick={() =>
                  setLayoutMode(
                    layoutMode === "masonry" ? "fullwidth" : "masonry",
                  )
                }
                aria-label="Toggle between masonry and full width layout"
                data-mode={layoutMode}
              >
                <span className="toggle-track">
                  <span className="toggle-icon toggle-icon-left">
                    <GridFour size={14} weight="bold" />
                  </span>
                  <span className="toggle-thumb">
                    {layoutMode === "masonry" ? (
                      <GridFour size={16} weight="bold" />
                    ) : (
                      <Rectangle size={16} weight="bold" />
                    )}
                  </span>
                  <span className="toggle-icon toggle-icon-right">
                    <Rectangle size={14} weight="bold" />
                  </span>
                </span>
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
}
