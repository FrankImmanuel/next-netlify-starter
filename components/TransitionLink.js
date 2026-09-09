import Link from 'next/link';
import { useRouter } from 'next/router';

let activeTransition;
export const getActivePageTransition = () => activeTransition;

export default function TransitionLink({ onClick, href, replace, scroll, shallow, ...props }) {
  const router = useRouter();
  return <Link {...props} href={href} replace={replace} scroll={scroll} shallow={shallow} onClick={event => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.currentTarget.target === '_blank' || event.currentTarget.hasAttribute('download')) return;
    const next = new URL(event.currentTarget.href);
    if (next.origin !== window.location.origin || next.pathname.startsWith('/admin') || next.pathname + next.search === window.location.pathname + window.location.search || shallow) return;
    activeTransition?.skipTransition();
    if (!event.detail || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !document.startViewTransition) return;
    event.preventDefault();
    const transition = document.startViewTransition(async () => {
      await router[replace ? 'replace' : 'push'](next.pathname + next.search + next.hash, undefined, { scroll });
    });
    activeTransition = transition;
    transition.ready.catch(() => {});
    transition.finished.catch(() => {}).finally(() => {
      if (activeTransition === transition) activeTransition = undefined;
    });
  }} />;
}
