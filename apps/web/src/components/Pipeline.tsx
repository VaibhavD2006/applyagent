"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const STEPS = [
  {
    n: "1",
    lit: true,
    title: "Upload your resume",
    desc: "Drop a PDF or DOCX. ApplyAgent reads every line and builds a structured profile with stable fact identifiers. No hallucinated employers, no invented dates.",
  },
  {
    n: "2",
    lit: true,
    title: "Paste the job URL",
    desc: "The agent opens the application form, detects every field, classifies each question, and maps your profile facts before writing a single character.",
  },
  {
    n: "3",
    lit: true,
    title: "Review every answer",
    desc: "Open-ended questions are answered using only your verified profile. Sensitive fields and low-confidence answers are flagged and held for your approval.",
  },
  {
    n: "4",
    lit: false,
    title: "Approve and submit",
    desc: "One click issues the approval token. The agent fills the form and submits. Nothing moves without your explicit sign-off.",
  },
];

export default function Pipeline() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="section-wrap">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: "center", marginBottom: 64 }}
      >
        <h2
          className="font-display"
          style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, marginBottom: 18 }}
        >
          From resume to submitted
          <br />
          in four steps
        </h2>
        <p style={{ fontSize: "1rem", color: "var(--muted)", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
          A deterministic pipeline that maps your profile to each form,
          generates grounded answers, and never submits without your
          explicit sign-off.
        </p>
      </motion.div>

      <div className="pipeline" ref={ref}>
        <div className="pipeline-rail" aria-hidden />
        {STEPS.map((step, i) => (
          <motion.div
            key={step.n}
            className="pipeline-step"
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={`step-node ${step.lit ? "step-node-lit" : "step-node-dim"}`}>
              {step.n}
            </div>
            <div className="step-body">
              <div className="step-title">{step.title}</div>
              <div className="step-desc">{step.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
