import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getActivePageTransition } from './TransitionLink';

let keyboardNavigation = false;

// Navigation never waits for motion. Base HTML stays visible, including without JS.
export function usePageMotion() {
  const root = useRef(null);
  const router = useRouter();
  const running = useRef([]);
  const cancel = () => {
    running.current.forEach(animation => animation.cancel());
    running.current = [];
  };

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onKey = () => { keyboardNavigation = true; cancel(); };
    const onPointer = () => { keyboardNavigation = false; };
    router.events.on('routeChangeError', cancel);
    preference.addEventListener('change', cancel);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('pointerdown', onPointer, true);
    return () => {
      cancel();
      router.events.off('routeChangeError', cancel);
      preference.removeEventListener('change', cancel);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('pointerdown', onPointer, true);
    };
  }, [router.events]);

  useEffect(() => {
    cancel();
    const main = root.current;
    if (!main?.animate || keyboardNavigation) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ease = getComputedStyle(document.documentElement).getPropertyValue('--ease').trim();
    const transition = getActivePageTransition();
    let disposed = false;
    const duration = reduce ? 200 : 1200;
    const delay = transition && !reduce ? 450 : 0;
    const frames = (distance, fade = false) => Array.from({ length: 101 }, (_, i) => {
      const progress = i === 100 ? 1 : 1 - 2 ** (-i / 10);
      return { offset: i / 100,
        ...(distance ? { transform: `translateY(${distance * (1 - progress)}px)` } : {}),
        ...(fade ? { opacity: 0.55 + 0.45 * progress } : {}),
      };
    });
    const enter = (element, distance, fade) => {
      const animation = element.animate(reduce
        ? [{ opacity: 0.65 }, { opacity: 1 }]
        : frames(distance, fade), {
        duration, delay, easing: reduce ? ease : 'linear', fill: 'backwards',
      });
      if (transition && !reduce) animation.pause();
      running.current.push(animation);
    };
    // Fade only content containers. The paper and dot grid belong to their
    // parent shell and remain opaque. During navigation only the snapshot
    // moves, so Safari never hands off between two different transforms.
    const shell = main.parentElement;
    [shell.querySelector(':scope > header'), main, shell.querySelector(':scope > footer')]
      .filter(Boolean).forEach(element => enter(element, !transition && !reduce && element === main ? 96 : 0, true));
    if (transition && !reduce) {
      const prepared = [...running.current];
      transition.ready.then(() => {
        if (disposed) return;
        const start = document.timeline.currentTime;
        prepared.forEach(animation => { animation.startTime = start; });
      }, () => { if (!disposed) cancel(); });
    }
    return () => { disposed = true; cancel(); };
  }, [router.asPath.split('#')[0]]);

  return root;
}
