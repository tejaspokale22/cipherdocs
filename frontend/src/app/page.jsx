import Hero from "@/app/components/Hero";
import Features from "@/app/components/Features";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <main className="bg-white text-black">
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
