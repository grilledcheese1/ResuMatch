import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function fadeSlideIn(
  targets: gsap.TweenTarget,
  options: { delay?: number; stagger?: number } = {}
) {
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", delay: options.delay ?? 0, stagger: options.stagger ?? 0 }
  );
}

export function staggerCards(targets: gsap.TweenTarget) {
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 24, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power2.out", stagger: 0.1 }
  );
}

export function fadeScaleIn(
  targets: gsap.TweenTarget,
  options: { delay?: number; duration?: number } = {}
) {
  return gsap.fromTo(
    targets,
    { opacity: 0, scale: 0.96 },
    { opacity: 1, scale: 1, duration: options.duration ?? 0.5, ease: "power2.out", delay: options.delay ?? 0 }
  );
}

export function scaleIn(
  targets: gsap.TweenTarget,
  options: { delay?: number } = {}
) {
  return gsap.fromTo(
    targets,
    { opacity: 0, scale: 0.95 },
    { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out", delay: options.delay ?? 0 }
  );
}

export function navbarSlideDown(target: gsap.TweenTarget) {
  return gsap.fromTo(
    target,
    { opacity: 0, y: -16 },
    { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
  );
}

export function scrollFadeIn(targets: gsap.TweenTarget, triggerEl: Element) {
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 16 },
    {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: triggerEl,
        start: "top 85%",
        once: true,
      },
    }
  );
}

export function drawArc(
  pathEl: SVGPathElement,
  pathLength: number,
  score: number
) {
  const endOffset = pathLength * (1 - score / 100);
  return gsap.fromTo(
    pathEl,
    { strokeDashoffset: pathLength },
    { strokeDashoffset: endOffset, duration: 1, ease: "power2.out" }
  );
}

export function countUp(
  target: number,
  onUpdate: (val: number) => void,
  duration = 1
) {
  const obj = { val: 0 };
  return gsap.to(obj, {
    val: target,
    duration,
    ease: "power2.out",
    onUpdate: () => onUpdate(Math.round(obj.val)),
  });
}
