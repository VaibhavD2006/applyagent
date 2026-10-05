"use client";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

const STEPS = [
  {
    label: "Resume parsed & profile built",
    state: "done",
    stateLabel: "done",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    label: "Form fields mapped (14 / 14)",
    state: "done",
    stateLabel: "done",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    label: "Generating open-ended answers",
    state: "active",
    stateLabel: "filling",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx={12} cy={12} r={3} />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
  {
    label: "Awaiting your approval",
    state: "pending",
    stateLabel: "next",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function Hero() {
  return (
    <section className="hero-section relative overflow-hidden text-center">
      {/* Background glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 40,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 480,
          background:
            "radial-gradient(ellipse at center, oklch(79% 0.19 200 / 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <motion.div variants={container} initial="hidden" animate="show">
        {/* Live badge */}
        <motion.div variants={item} className="flex justify-center mb-9">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--cyan-glow)",
              border: "1px solid var(--cyan-border)",
              borderRadius: 100,
              padding: "5px 14px 5px 10px",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--cyan)",
              letterSpacing: "0.02em",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--cyan)",
                display: "inline-block",
                animation: "state-blink 2s ease-in-out infinite",
              }}
            />
            Now in early access
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="font-display"
          style={{
            fontSize: "clamp(3rem, 8vw, 5.8rem)",
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: "-0.04em",
            maxWidth: 780,
            margin: "0 auto 26px",
          }}
        >
          Your resume.
          <br />
          Every job.
          <br />
          <span style={{ color: "var(--cyan)" }}>Zero friction.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={item}
          style={{
            fontSize: "clamp(1rem, 2vw, 1.15rem)",
            color: "var(--muted)",
            maxWidth: 500,
            margin: "0 auto 44px",
            lineHeight: 1.7,
          }}
        >
          Upload your resume once. ApplyAgent maps each form field to your
          actual profile, generates grounded answers, and waits for your
          go-ahead before submitting anything.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={item}
          className="flex justify-center flex-wrap gap-3"
          style={{ marginBottom: 64 }}
        >
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.02, boxShadow: "0 0 40px oklch(79% 0.19 200 / 0.45)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            Start applying for free
          </motion.button>
          <motion.button
            className="btn-ghost"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            Watch a demo
          </motion.button>
        </motion.div>

        {/* Agent status card */}
        <motion.div
          variants={cardVariant}
          className="agent-card mx-auto"
        >
          {/* Card header */}
          <div className="agent-card-header">
            <div className="traffic" style={{ background: "#ff6058" }} />
            <div className="traffic" style={{ background: "#febc2e" }} />
            <div className="traffic" style={{ background: "#28c840" }} />
            <span
              className="font-body text-muted"
              style={{ fontSize: 12, fontWeight: 600, marginLeft: 6, flex: 1 }}
            >
              agent.run — Stripe Backend Engineer
            </span>
            <span className="agent-live">LIVE</span>
          </div>

          {/* Steps */}
          <div className="agent-body">
            {STEPS.map((s) => (
              <div key={s.label} className={`agent-row row-${s.state}`}>
                <div className="agent-row-icon">{s.icon}</div>
                <span className="agent-row-label">{s.label}</span>
                <span className="agent-state">{s.stateLabel}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
