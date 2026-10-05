"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function ApprovalGate() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div className="approval-wrap" ref={ref}>
      <div className="approval-inner">
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2
            className="font-display"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, marginBottom: 18 }}
          >
            You decide.
            <br />
            The agent executes.
          </h2>
          <p style={{ fontSize: "0.95rem", color: "var(--muted)", lineHeight: 1.75, maxWidth: 380 }}>
            Before any form gets submitted, you see every answer. Flag a
            response, edit a field, or reject the whole application. The
            agent cannot move past this screen without your token.
          </p>
        </motion.div>

        {/* Right: review card */}
        <motion.div
          className="approval-card"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Candidate header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 800,
                color: "#fff",
                fontFamily: "var(--font-display)",
                flexShrink: 0,
              }}
            >
              A
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--heading)" }}>
                Alice Chen
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Stripe — Backend Engineer
              </div>
            </div>
          </div>

          <div className="review-row">
            <div className="review-label">Full name</div>
            <div className="review-value">Alice Chen</div>
          </div>
          <div className="review-row">
            <div className="review-label">Years of experience</div>
            <div className="review-value">4 years</div>
          </div>
          <div className="review-row">
            <div className="review-label">Why do you want to work at Stripe?</div>
            <div className="review-value" style={{ fontSize: 12.5, fontWeight: 400, color: "var(--ink)" }}>
              I've used the Payments API extensively across two roles and
              care deeply about developer experience at that layer...
            </div>
          </div>
          <div className="review-row flagged">
            <div className="review-label flag">⚠ Requires sponsorship — review before approving</div>
            <div className="review-value">Flagged for your review</div>
          </div>

          <div className="approval-actions">
            <motion.button
              className="btn-approve"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              Approve &amp; Submit
            </motion.button>
            <motion.button
              className="btn-reject"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              Reject
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
