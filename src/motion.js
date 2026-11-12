import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import Lenis from "lenis";

// One motion idea for the whole page: signal from noise.
//   - identity text (tagline, section titles, "Let's talk") decodes from binary
//   - hovering a tagline word injects noise into it (amber), and it recovers
//   - hairlines draw in; body content settles into place
// The cover's name (NameField.jsx) follows the same rule.
// Everything is skipped for people who prefer reduced motion.

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin);

const AMBER = "#e3a35b";
let lenis = null;

export function scrollToElement(el, onDone) {
  if (lenis) {
    lenis.scrollTo(el, { offset: -Math.round(window.innerHeight * 0.28), duration: 1.4, onComplete: onDone });
  } else {
    el.scrollIntoView({ behavior: "auto", block: "center" });
    onDone?.();
  }
}

export function refreshMotion() {
  ScrollTrigger.refresh();
}

// Split into words with fixed widths so lines don't reflow while scrambling.
function splitWords(el) {
  const split = SplitText.create(el, { type: "words" });
  split.words.forEach((w) => {
    w.dataset.text = w.textContent;
  });
  return split.words;
}

function lock(w) {
  w.style.width = `${w.getBoundingClientRect().width}px`;
  w.style.whiteSpace = "nowrap";
}

function unlock(w) {
  w.style.width = "";
  w.style.whiteSpace = "";
}

function decode(words, { delay = 0, stagger = 0.05, duration = 1, host = null } = {}) {
  words.forEach(lock);
  words.forEach((w) => {
    w.textContent = "\u00a0";
  });
  host?.classList.add("is-decoding");
  return gsap.to(words, {
    duration,
    delay,
    stagger,
    ease: "none",
    scrambleText: (i, w) => ({ text: w.dataset.text, chars: "01", speed: 0.7, revealDelay: duration * 0.35 }),
    onComplete: () => {
      words.forEach(unlock);
      host?.classList.remove("is-decoding");
    },
  });
}

function disturbable(words) {
  const off = [];
  words.forEach((w) => {
    const onEnter = () => {
      if (gsap.isTweening(w)) return;
      lock(w);
      gsap
        .timeline({ onComplete: () => unlock(w) })
        .to(w, { duration: 0.55, ease: "none", scrambleText: { text: w.dataset.text, chars: "01", speed: 1 } }, 0)
        .fromTo(w, { color: AMBER }, { color: "", duration: 1, ease: "power2.out", clearProps: "color" }, 0);
    };
    w.addEventListener("mouseenter", onEnter);
    off.push(() => w.removeEventListener("mouseenter", onEnter));
  });
  return () => off.forEach((fn) => fn());
}

function opening() {
  gsap
    .timeline({ defaults: { ease: "expo.out" } })
    .from(".topbar-rule", { scaleX: 0, duration: 1.8, ease: "expo.inOut" }, 0.3)
    .from(".topbar > :not(.rule)", { yPercent: -80, opacity: 0, duration: 1.1, stagger: 0.07 }, 0.6);

  const tagline = document.querySelector(".tagline");
  const words = splitWords(tagline);
  decode(words, { delay: 1.2, stagger: 0.03, duration: 1.1, host: tagline });
  return disturbable(words);
}

function sections() {
  gsap.utils.toArray(".section").forEach((section) => {
    const words = splitWords(section.querySelector(".title-inner"));
    words.forEach(lock);
    words.forEach((w) => {
      w.textContent = "\u00a0";
    });
    ScrollTrigger.create({
      trigger: section,
      start: "top 82%",
      once: true,
      onEnter: () => {
        gsap.from(section.querySelector(".head-rule"), { scaleX: 0, duration: 1.5, ease: "expo.inOut" });
        gsap.from(section.querySelector(".section-num"), { opacity: 0, duration: 0.8, delay: 0.3 });
        decode(words, { delay: 0.15, stagger: 0.08, duration: 1 });
      },
    });
  });

  // Body content settles in small staggered groups as it scrolls into view.
  gsap.set(".rv", { y: 40, opacity: 0 });
  ScrollTrigger.batch(".rv", {
    start: "top 90%",
    once: true,
    onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", stagger: 0.08, overwrite: true }),
  });
}

function contact() {
  const words = splitWords(document.querySelector(".contact-name"));
  words.forEach(lock);
  words.forEach((w) => {
    w.textContent = "\u00a0";
  });
  ScrollTrigger.create({
    trigger: ".contact",
    start: "top 75%",
    once: true,
    onEnter: () => {
      decode(words, { stagger: 0.12, duration: 1.2 });
      gsap.from(".contact .index-rule", { scaleX: 0, duration: 1.5, ease: "expo.inOut", delay: 0.2 });
    },
  });
}

export function startMotion(root) {
  const mm = gsap.matchMedia(root);

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    lenis = new Lenis({ lerp: 0.085, anchors: { offset: -40 } });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const offHover = opening();
    sections();
    contact();

    return () => {
      offHover();
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenis = null;
    };
  });

  return () => mm.revert();
}
