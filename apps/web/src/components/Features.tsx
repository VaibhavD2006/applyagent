"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const FEATURES = [
  {
    name: "No hallucinated facts",
    desc: "Each generated answer cites the exact profile field it draws from. If a claim can't be traced to your resume, it doesn't go into the form.",
    tag: "Zero fabrication",
  },
  {
    name: "Nothing submits without your token",
    desc: "Every flagged answer, sensitive field, and low-confidence response waits in a review queue. One signed approval unlocks the submit action.",
    tag: "Always in control",
  },
  {
    name: "Standard fields skip the LLM",
    desc: "Name, email, phone, location: filled directly from your structured profile. Faster, cheaper, and auditable with no prompt involved.",
    tag: "Deterministic",
  },
  {
    name: "Works across every major job board",
    desc: "Greenhouse, Lever, Workday, and any generic HTML form. The agent adapts to each ATS's DOM structure without any configuration on your part.",
    tag: "Multi-ATS",
  },
  {
    name: "Your profile is versioned and immutable",
    desc: "Every update creates a new version row. You can trace which exact facts answered which question on any application, long after submission.",
    tag: "Full audit trail",
  },
];

export default function Features() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="section-wrap" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 16 }}
      >
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          Not just another autofill
        </h2>
        <p style={{ fontSize: "1rem", color: "var(--muted)", maxWidth: 500, lineHeight: 1.7 }}>
          Every decision in ApplyAgent exists to prevent the failure mode of
          AI job tools: confidently wrong answers and silent submissions.
        </p>
      </motion.div>

      <div className="feature-roster" style={{ marginTop: 48 }}>
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.name}
            className="feature-row"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.08 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="feature-name">{f.name}</div>
            <div className="feature-right">
              <p className="feature-desc">{f.desc}</p>
              <span className="feature-tag">{f.tag}</span>
            </div>
          </motion.div>
        ))}
        {/* Bottom border */}
        <div style={{ borderTop: "1px solid var(--border)" }} />
      </div>
    </section>
  );
}
