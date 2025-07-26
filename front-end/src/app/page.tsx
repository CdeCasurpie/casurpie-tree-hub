import Header from "@/components/main/Header";
import Hero from "@/components/main/Hero";
import Features from "@/components/main/Features";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-principal">
      <Header />
      <Hero />
      <div className="container mx-auto px-6">
        <Features />
      </div>
    </div>
  );
}
