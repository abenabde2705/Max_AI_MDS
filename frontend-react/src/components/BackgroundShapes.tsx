import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Heart SVG path
const HEART = 'M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z';
// Star polygon points
const STAR = '12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26';
// Sparkle (4-point star)
const SPARKLE = '12,1 13.8,10.2 23,12 13.8,13.8 12,23 10.2,13.8 1,12 10.2,10.2';

const BackgroundShapes: React.FC = () => {
  const blob1Ref   = useRef<SVGSVGElement>(null);
  const blob2Ref   = useRef<SVGSVGElement>(null);
  const blob3Ref   = useRef<SVGSVGElement>(null);
  const heart1Ref  = useRef<SVGSVGElement>(null);
  const heart2Ref  = useRef<SVGSVGElement>(null);
  const heart3Ref  = useRef<SVGSVGElement>(null);
  const star1Ref   = useRef<SVGSVGElement>(null);
  const star2Ref   = useRef<SVGSVGElement>(null);
  const sparkleRef = useRef<SVGSVGElement>(null);
  const dotGroupRef = useRef<SVGSVGElement>(null);
  // Rising bubbles — each is its own SVG so GSAP can move them freely
  const bub1 = useRef<SVGSVGElement>(null);
  const bub2 = useRef<SVGSVGElement>(null);
  const bub3 = useRef<SVGSVGElement>(null);
  const bub4 = useRef<SVGSVGElement>(null);
  const bub5 = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── BIG BLOBS ───────────────────────────────────────────────────

      // Blob 1: top-left, breathing + slow drift
      if (blob1Ref.current) {
        gsap.to(blob1Ref.current, {
          scale: 1.18,
          duration: 4.5,
          yoyo: true,
          repeat: -1,
          ease: 'power2.inOut',
          transformOrigin: '50% 50%',
        });
        gsap.to(blob1Ref.current, {
          y: '+=40',
          x: '+=25',
          duration: 7,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
        gsap.to(blob1Ref.current, {
          y: -220,
          ease: 'none',
          scrollTrigger: { scrub: 2, start: 'top top', end: 'bottom bottom' },
        });
      }

      // Blob 2: right, yellow, gentle wobble
      if (blob2Ref.current) {
        gsap.to(blob2Ref.current, {
          scale: 1.14,
          rotation: 20,
          duration: 5.5,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          delay: 1.5,
          transformOrigin: '50% 50%',
        });
        gsap.to(blob2Ref.current, {
          y: '+=30',
          duration: 6.5,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        });
      }

      // Blob 3: lower-left, parallax scroll
      if (blob3Ref.current) {
        gsap.to(blob3Ref.current, {
          scale: 1.1,
          duration: 6,
          yoyo: true,
          repeat: -1,
          ease: 'power1.inOut',
          delay: 2,
          transformOrigin: '50% 50%',
        });
        gsap.to(blob3Ref.current, {
          y: -180,
          ease: 'none',
          scrollTrigger: { scrub: 1.5, start: 'top top', end: 'bottom bottom' },
        });
      }

      // ── HEARTS ──────────────────────────────────────────────────────

      [heart1Ref, heart2Ref, heart3Ref].forEach((ref, i) => {
        if (!ref.current) return;
        // Bouncy entrance
        gsap.from(ref.current, {
          scale: 0,
          rotation: -30 + i * 20,
          duration: 1,
          delay: 0.3 + i * 0.5,
          ease: 'elastic.out(1, 0.45)',
          transformOrigin: '50% 50%',
        });
        // Heartbeat pulse
        gsap.to(ref.current, {
          scale: 1.35,
          duration: 0.35,
          yoyo: true,
          repeat: -1,
          repeatDelay: 1.2 + i * 0.3,
          ease: 'power2.out',
          transformOrigin: '50% 50%',
        });
        // Gentle float with slight tilt
        gsap.to(ref.current, {
          y: `+=${18 + i * 6}`,
          rotation: i % 2 === 0 ? 12 : -12,
          duration: 3.5 + i * 0.6,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          delay: i * 0.7,
          transformOrigin: '50% 50%',
        });
      });

      // ── STARS ───────────────────────────────────────────────────────

      [star1Ref, star2Ref].forEach((ref, i) => {
        if (!ref.current) return;
        // Entrance: pop in with overshoot
        gsap.from(ref.current, {
          scale: 0,
          rotation: -180,
          duration: 0.9,
          delay: 0.8 + i * 0.6,
          ease: 'back.out(2)',
          transformOrigin: '50% 50%',
        });
        // Continuous spin
        gsap.to(ref.current, {
          rotation: '+=360',
          duration: 9 + i * 4,
          repeat: -1,
          ease: 'none',
          transformOrigin: '50% 50%',
        });
        // Twinkle opacity
        gsap.to(ref.current, {
          opacity: 0.12,
          duration: 1.4 + i * 0.4,
          yoyo: true,
          repeat: -1,
          ease: 'power2.inOut',
          delay: i,
        });
        // Float
        gsap.to(ref.current, {
          y: '+=22',
          x: `+=${i % 2 === 0 ? 18 : -18}`,
          duration: 5 + i,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          delay: i * 1.5,
        });
      });

      // ── SPARKLE ─────────────────────────────────────────────────────

      if (sparkleRef.current) {
        gsap.from(sparkleRef.current, {
          scale: 0,
          duration: 0.7,
          delay: 1.8,
          ease: 'elastic.out(1.2, 0.5)',
          transformOrigin: '50% 50%',
        });
        gsap.to(sparkleRef.current, {
          rotation: '+=360',
          duration: 5,
          repeat: -1,
          ease: 'none',
          transformOrigin: '50% 50%',
        });
        gsap.to(sparkleRef.current, {
          scale: 1.4,
          opacity: 0.15,
          duration: 1.2,
          yoyo: true,
          repeat: -1,
          ease: 'power2.inOut',
          delay: 0.5,
          transformOrigin: '50% 50%',
        });
      }


      // ── RISING BUBBLES ──────────────────────────────────────────────

      const bubbles = [bub1, bub2, bub3, bub4, bub5];
      bubbles.forEach((ref, i) => {
        if (!ref.current) return;
        const dur = 9 + i * 1.8;
        const tl = gsap.timeline({ repeat: -1, delay: i * 2.2 });
        tl.set(ref.current, { opacity: 0, y: 0 })
          .to(ref.current, { opacity: 0.4, duration: 1, ease: 'power1.in' })
          .to(ref.current, { y: -280, duration: dur - 2, ease: 'none' }, 0)
          .to(ref.current, { opacity: 0, duration: 1.5, ease: 'power1.out' }, '>-1.5');
      });

      // ── DOT CLUSTER ─────────────────────────────────────────────────

      if (dotGroupRef.current) {
        gsap.to(dotGroupRef.current, {
          y: '+=24',
          x: '+=12',
          duration: 3.2,
          yoyo: true,
          repeat: -1,
          ease: 'back.inOut(1.7)',
        });
        // Individual dots bounce in staggered
        const dotsEl = dotGroupRef.current.querySelectorAll('circle');
        gsap.from(dotsEl, {
          scale: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)',
          stagger: 0.12,
          delay: 1,
          transformOrigin: '50% 50%',
        });
        gsap.to(dotsEl, {
          y: '-=10',
          duration: 1.5,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          stagger: 0.2,
          delay: 1.5,
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ── BIG BLOBS ── */}
      <svg ref={blob1Ref} width="560" height="560" viewBox="0 0 200 200"
        style={{ position: 'absolute', top: '-110px', left: '-140px', opacity: 0.14 }}>
        <path fill="#651E79"
          d="M44.8,-62.3C57.1,-54.3,65.5,-40.3,70.1,-25.2C74.7,-10.1,75.5,6.1,70.8,20.5C66.1,34.9,55.9,47.6,43,56.3C30.1,65,14.6,69.7,-1.2,71.2C-17,72.7,-33.8,71,-47.2,63C-60.6,55,-70.5,40.7,-74.5,24.9C-78.5,9.1,-76.5,-8.2,-69.9,-23.1C-63.3,-38,-52.1,-50.5,-39.1,-58.5C-26.1,-66.5,-11.4,-70,2.8,-73.8C17,-77.6,32.5,-70.3,44.8,-62.3Z"
          transform="translate(100 100)" />
      </svg>

      <svg ref={blob2Ref} width="340" height="340" viewBox="0 0 200 200"
        style={{ position: 'absolute', top: '6%', right: '-65px', opacity: 0.09 }}>
        <path fill="#DAE63D"
          d="M39.5,-52.1C51.6,-43.8,62,-32.2,66.2,-18.4C70.4,-4.6,68.4,11.4,62.3,25.4C56.2,39.4,46,51.4,33.2,58.5C20.4,65.6,5,67.8,-10.5,65.8C-26,63.8,-41.5,57.6,-52.8,46.8C-64.1,36,-71.2,20.6,-72.4,4.5C-73.6,-11.6,-68.9,-28.5,-59,-41.1C-49.1,-53.7,-34,-62,-19.5,-65.5C-5,-69,9,-65.7,22.2,-60.2C35.4,-54.7,27.4,-60.4,39.5,-52.1Z"
          transform="translate(100 100)" />
      </svg>

      <svg ref={blob3Ref} width="430" height="430" viewBox="0 0 200 200"
        style={{ position: 'absolute', top: '50%', left: '-95px', opacity: 0.13 }}>
        <path fill="#470059"
          d="M36.4,-48.4C46.9,-40.1,55,-28.7,60.3,-15.3C65.6,-1.9,68.1,13.5,64.2,27.2C60.3,40.9,50,53,37.2,60.5C24.4,68,9.1,70.9,-5.2,68.9C-19.5,66.9,-32.8,60,-44.2,50.4C-55.6,40.8,-65.2,28.5,-68.8,14.4C-72.4,0.3,-70,-15.6,-63.1,-28.6C-56.2,-41.6,-44.8,-51.7,-32.4,-59.6C-20,-67.5,-6.6,-73.2,5.2,-80.4C17,-87.6,25.9,-56.7,36.4,-48.4Z"
          transform="translate(100 100)" />
      </svg>

      {/* ── HEARTS ── */}
      <svg ref={heart1Ref} width="52" height="52" viewBox="0 0 24 24"
        style={{ position: 'absolute', top: '16%', left: '7%', opacity: 0.32 }}>
        <path fill="#DAE63D" d={HEART} />
      </svg>

      <svg ref={heart2Ref} width="38" height="38" viewBox="0 0 24 24"
        style={{ position: 'absolute', top: '40%', right: '10%', opacity: 0.26 }}>
        <path fill="#DAE63D" d={HEART} />
      </svg>

      <svg ref={heart3Ref} width="46" height="46" viewBox="0 0 24 24"
        style={{ position: 'absolute', top: '76%', left: '22%', opacity: 0.22 }}>
        <path fill="#c070e0" d={HEART} />
      </svg>

      {/* ── STARS ── */}
      <svg ref={star1Ref} width="58" height="58" viewBox="0 0 24 24"
        style={{ position: 'absolute', top: '10%', right: '18%', opacity: 0.4 }}>
        <polygon fill="#DAE63D" points={STAR} />
      </svg>

      <svg ref={star2Ref} width="40" height="40" viewBox="0 0 24 24"
        style={{ position: 'absolute', top: '63%', left: '4%', opacity: 0.32 }}>
        <polygon fill="#DAE63D" points={STAR} />
      </svg>

      {/* ── SPARKLE ── */}
      <svg ref={sparkleRef} width="44" height="44" viewBox="0 0 24 24"
        style={{ position: 'absolute', top: '55%', right: '8%', opacity: 0.38 }}>
        <polygon fill="#DAE63D" points={SPARKLE} />
      </svg>


      {/* ── RISING BUBBLES ── */}
      <svg ref={bub1} width="16" height="16" viewBox="0 0 16 16"
        style={{ position: 'absolute', bottom: '5%', left: '11%', opacity: 0 }}>
        <circle cx="8" cy="8" r="7" fill="#DAE63D" />
      </svg>
      <svg ref={bub2} width="11" height="11" viewBox="0 0 11 11"
        style={{ position: 'absolute', bottom: '8%', left: '29%', opacity: 0 }}>
        <circle cx="5.5" cy="5.5" r="5" fill="#DAE63D" />
      </svg>
      <svg ref={bub3} width="20" height="20" viewBox="0 0 20 20"
        style={{ position: 'absolute', bottom: '3%', left: '53%', opacity: 0 }}>
        <circle cx="10" cy="10" r="9" fill="#c070e0" />
      </svg>
      <svg ref={bub4} width="13" height="13" viewBox="0 0 13 13"
        style={{ position: 'absolute', bottom: '10%', left: '72%', opacity: 0 }}>
        <circle cx="6.5" cy="6.5" r="6" fill="#DAE63D" />
      </svg>
      <svg ref={bub5} width="17" height="17" viewBox="0 0 17 17"
        style={{ position: 'absolute', bottom: '6%', left: '88%', opacity: 0 }}>
        <circle cx="8.5" cy="8.5" r="8" fill="#651E79" />
      </svg>

      {/* ── DOT CLUSTER ── */}
      <svg ref={dotGroupRef} width="120" height="60" viewBox="0 0 120 60"
        style={{ position: 'absolute', top: '86%', right: '8%', opacity: 0.38 }}>
        <circle cx="12" cy="32" r="7" fill="#DAE63D" />
        <circle cx="34" cy="18" r="5" fill="#c070e0" />
        <circle cx="58" cy="36" r="8" fill="#DAE63D" />
        <circle cx="82" cy="16" r="5" fill="#651E79" />
        <circle cx="106" cy="34" r="4" fill="#DAE63D" />
      </svg>
    </div>
  );
};

export default BackgroundShapes;
