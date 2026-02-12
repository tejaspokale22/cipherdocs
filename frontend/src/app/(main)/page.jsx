import Hero from "@/app/components/Hero";
import Features from "@/app/components/Features";
import Stats from "@/app/components/Stats";
import HowItWorks from "@/app/components/HowItWorks";
import UseCases from "@/app/components/UseCases";
// import Testimonials from "@/app/components/Testimonials";
import CTA from "@/app/components/CTA";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <main className="bg-white text-black">
      <Hero />
      <Features />
      <Stats />
      <HowItWorks />
      <UseCases />
      {/* <Testimonials /> */}
      <CTA />
      <Footer />
    </main>
  );
}
