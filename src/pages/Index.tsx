import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import Sermons from "@/components/Sermons";
import Offering from "@/components/Offering";
import Events from "@/components/Events";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Experience />
        <Sermons />
        <Offering />
        <Events />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
