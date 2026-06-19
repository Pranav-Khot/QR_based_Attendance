import React, { useEffect, useState } from "react";
import "../styles/Transition.css";

const words = ["Registration"];

const Transition = () => {
    const [index, setIndex] = useState(0);
    const [dim, setDim] = useState({ w: window.innerWidth, h: window.innerHeight });

    useEffect(() => {
        const handleResize = () =>
            setDim({ w: window.innerWidth, h: window.innerHeight });
        window.addEventListener("resize", handleResize);

        const timeout = setTimeout(() => {
            if (index < words.length - 1) {
                setIndex(index + 1);
            }
        }, index === 0 ? 290 : index === words.length - 1 ? 1200 : 265);

        return () => {
            window.removeEventListener("resize", handleResize);
            clearTimeout(timeout);
        };
    }, [index]);

    /* ================= ORIGINAL LOGIC RETAINED & FIXED ================= */
    const curveDepth = 450; 
    const targetCurv = 60;  

    // 1. INITIAL: Top edge gehra curved hai
    const initialPath = `M0 ${dim.h + 200} 
    Q${dim.w / 2} ${dim.h + 200 - curveDepth} ${dim.w} ${dim.h + 200} 
    L${dim.w} ${dim.h + 1200} 
    Q${dim.w / 2} ${dim.h + 1200 + curveDepth} 0 ${dim.h + 1200} 
    Z`;

    // 2. TARGET: FIX - Top edge ko flat nahi, balki UPWARD CURVED rakha hai 
    // taaki wo upar jate waqt flat na ho jaye
    const targetPath = `M0 0 
    Q${dim.w / 2} -${curveDepth / 2} ${dim.w} 0 
    L${dim.w} ${dim.h} 
    Q${dim.w / 2} ${dim.h + targetCurv} 0 ${dim.h} 
    Z`;

    // 3. EXIT: Pura upar nikal jana
    const exitPath = `M0 -1000 
    Q${dim.w / 2} -${1000 + curveDepth} ${dim.w} -1000 
    L${dim.w} 0 
    Q${dim.w / 2} ${targetCurv} 0 0 
    Z`;

    return (
        <div className="loader-wrapper">
            <div className="loader-text-css">
                <span className="dot"></span>
                <span className={index === words.length - 1 ? "final-word" : ""}>
                    {words[index]}
                </span>
            </div>

            <svg
                className="loader-svg base"
                viewBox={`0 0 ${dim.w} ${dim.h + 1000}`}
                preserveAspectRatio="none"
            >
                <path d={initialPath} fill="#004135ff">
                    {/* ENTRY: FAST (0.5s) - Parda jhatke se aayega aur curved hi rahega */}
                    <animate
                        attributeName="d"
                        to={targetPath}
                        dur="0.5s"
                        begin="0s"
                        fill="freeze"
                        calcMode="spline"
                        keySplines="0.1, 0.9, 0.2, 1"
                    />
                    {/* EXIT: SLOW (8.6s) - Exit ko 1.2s baad shuru kiya hai taaki parda thodi der ruke */}
                    <animate
                        attributeName="d"
                        from={targetPath}
                        to={exitPath} 
                        dur="8.6s"
                        begin="1.2s" 
                        fill="freeze"
                        calcMode="spline"
                        keySplines="0.4, 0, 0.2, 1"
                    />
                </path>
            </svg>
        </div>
    );
};

export default Transition;