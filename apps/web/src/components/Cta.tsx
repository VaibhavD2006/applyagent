"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function Cta() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      className="relative overflow-hidden text-center"
      style={{ padding: "120px 24px 140px" }}
      ref={ref}
    >
      {/* Glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -40,
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 400,
          background:
            "radial-gradient(ellipse at center, oklch(79% 0.19 200 / 0.09) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative" }}
      >
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(2.2rem, 6vw, 4.2rem)",
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
            marginBottom: 22,
          }}
        >
          Ready to apply
          <br />
          <span style={{ color: "var(--cyan)" }}>properly?</span>
        </h2>

        <p style={{ fontSize: "1.05rem", color: "var(--muted)", marginBottom: 40 }}>
          Join the waitlist. Rolling out access in batches.
        </p>

        <div className="cta-email-row">
          <input
            className="cta-input"
            type="email"
            placeholder="your@email.com"
            aria-label="Email address"
          />
          <motion.button
            className="btn-primary"
            style={{ whiteSpace: "nowrap" }}
            whileHover={{ scale: 1.03, boxShadow: "0 0 40px oklch(79% 0.19 200 / 0.45)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            Join waitlist
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}
