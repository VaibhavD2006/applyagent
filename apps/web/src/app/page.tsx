import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Pipeline from "@/components/Pipeline";
import Features from "@/components/Features";
import ApprovalGate from "@/components/ApprovalGate";
import Cta from "@/components/Cta";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <div className="divider" />
      <Pipeline />
      <div className="divider" />
      <Features />
      <ApprovalGate />
      <Cta />
      <Footer />
    </main>
  );
}
