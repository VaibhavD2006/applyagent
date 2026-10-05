"use client";
import { motion } from "framer-motion";

export default function Nav() {
  return (
    <motion.nav
      className="nav-pill"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <span
        className="font-display font-bold text-heading"
        style={{ fontSize: 17, letterSpacing: "-0.02em" }}
      >
        Apply<span style={{ color: "var(--cyan)" }}>Agent</span>
      </span>

      <div className="nav-links flex gap-7">
        {["How it works", "Features", "Pricing"].map((label) => (
          <a
            key={label}
            href="#"
            className="text-muted font-medium transition-colors duration-150 hover:text-heading"
            style={{ fontSize: 14, textDecoration: "none" }}
          >
            {label}
          </a>
        ))}
      </div>

      <motion.button
        className="btn-primary"
        style={{ borderRadius: 100, fontSize: 13, padding: "8px 18px" }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        Get early access
      </motion.button>
    </motion.nav>
  );
}
