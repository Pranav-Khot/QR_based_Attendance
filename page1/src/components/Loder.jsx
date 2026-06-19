


import React, { useEffect, useState, useRef } from "react";
import "../styles/outer/Loder.css";

const words = [
  "Welcome to",
  "Bonjour",
  "Hola",
  "Ciao",
  "नमस्ते",
  "こんにちは",
  "Guten Tag",
  "Olá",
  "Привет",
  "Welcome to",
  "Fortune Cloud",
];

const RISE_START    = 1950; // ms — matches SVG begin="1.95s"
const RISE_DURATION = 1200; // ms — matches SVG dur="1.2s"

const Loder = ({ onFinished }) => {
  const [index, setIndex] = useState(0);
  const [dim, setDim]     = useState({ w: window.innerWidth, h: window.innerHeight });
  const timerRef          = useRef(null);

  /* ── Word cycling ───────────────────────────────────────────── */
  useEffect(() => {
    const delay =
      index === 0                   ? 120
      : index === words.length - 1  ? RISE_START  
      : 100;

    timerRef.current = setTimeout(() => {
      if (index < words.length - 1) setIndex((prev) => prev + 1);
    }, delay);

    // Notify parent only AFTER curtain has fully left the screen
    if (index === words.length - 1) {
      setTimeout(() => {
        if (onFinished) onFinished();
      }, RISE_START + RISE_DURATION);
    }

    return () => clearTimeout(timerRef.current);
  }, [index, onFinished]);

  /* ── Responsive resize ──────────────────────────────────────── */
  useEffect(() => {
    const handleResize = () =>
      setDim({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const curveDepth = 200; // how far the curve bows below the viewport edge

  // Initial: curved bottom — bows downward past viewport edge
  const initialPath = `M0 0 L${dim.w} 0 L${dim.w} ${dim.h} Q${dim.w / 2} ${dim.h + curveDepth} 0 ${dim.h} L0 0`;
  // Target: flat bottom edge — straightens as curtain lifts
  const targetPath  = `M0 0 L${dim.w} 0 L${dim.w} ${dim.h} Q${dim.w / 2} ${dim.h} 0 ${dim.h} L0 0`;

  return (
    <div className="loader-wrapper">

      {/* ── Cycling / final text ─────────────────────────────── */}
      <div className="loader-text-css">
        <span className="dot" />
        <span className={index === words.length - 1 ? "final-word" : ""}>
          {words[index]}
        </span>
      </div>

    
      <svg
        className="loader-svg"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <path d={initialPath} fill="#0B1F15">
          <animate
            attributeName="d"
            to={targetPath}
            dur={`${RISE_DURATION / 1000}s`}
            begin="1.95s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.76, 0, 0.24, 1"
          />
        </path>

      </svg>

    </div>
  );
};

export default Loder;