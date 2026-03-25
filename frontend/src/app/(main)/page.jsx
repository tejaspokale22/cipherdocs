import Hero from "@/app/components/Hero";
import Features from "@/app/components/Features";
import Roles from "@/app/components/Roles";
import HowItWorks from "@/app/components/HowItWorks";
import UseCases from "@/app/components/UseCases";
import CTA from "@/app/components/CTA";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <main className="bg-white text-black">
      <Hero />
      <Features />
      <Roles />
      <HowItWorks />
      <UseCases />
      <CTA />
      <Footer />
    </main>
  );
}
