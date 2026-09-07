import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

const ScrollContext = createContext(null);
export const useScrollMotion = () => useContext(ScrollContext);

// Wheel inertia gives the gallery a continuous, spatial feel. Touch keeps native momentum.
export function ScrollMotion({ children }) {
  const [controller, setController] = useState(null);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let lenis;
    let frame;
    const configure = () => {
      cancelAnimationFrame(frame);
      lenis?.destroy();
      lenis = null;
      setController(null);
      if (preference.matches) return;
      lenis = new Lenis({ smoothWheel: true, syncTouch: false, autoRaf: false });
      setController(lenis);
      const tick = (time) => {
        lenis?.raf(time);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    configure();
    preference.addEventListener('change', configure);
    return () => {
      preference.removeEventListener('change', configure);
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);

  return <ScrollContext.Provider value={controller}>{children}</ScrollContext.Provider>;
}

const speeds = [0.12, -0.18, 0.08, -0.1, 0.16, -0.12, 0.1, -0.16];

export function useGalleryParallax(count, sequence) {
  const root = useRef(null);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const rows = [...root.current.querySelectorAll('.work')].map((element, index) => ({
      element,
      image: element.querySelector('.photo-motion'),
      speed: speeds[index % speeds.length],
      center: 0,
      height: 0,
    }));
    let frame;
    let viewport = window.innerHeight;
    let touchScale = window.innerWidth <= 700 ? 0.35 : 1;

    const paint = () => {
      frame = null;
      const center = window.scrollY + viewport / 2;
      rows.forEach((row) => {
        if (preference.matches || sequence) {
          row.image.style.transform = '';
          return;
        }
        const distance = center - row.center;
        const offset = Math.max(-110, Math.min(110, distance * row.speed)) * touchScale;
        row.image.style.transform = `translate3d(0, ${Math.round(offset * (window.devicePixelRatio || 1)) / (window.devicePixelRatio || 1)}px, 0)`;
      });
    };
    const schedule = () => {
      if (frame == null) frame = requestAnimationFrame(paint);
    };
    const measure = () => {
      viewport = window.innerHeight;
      touchScale = window.innerWidth <= 700 ? 0.35 : 1;
      rows.forEach((row) => {
        // Measure the untransformed figure; only its child moves.
        const bounds = row.element.getBoundingClientRect();
        row.center = bounds.top + window.scrollY + bounds.height / 2;
      });
      schedule();
    };
    const resize = new ResizeObserver(measure);
    resize.observe(root.current);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    preference.addEventListener('change', schedule);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
      preference.removeEventListener('change', schedule);
      rows.forEach((row) => { row.image.style.transform = ''; });
    };
  }, [count, sequence]);

  return root;
}
