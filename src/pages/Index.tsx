import Header from "../components/Header";
import Hero from "../components/Hero";
import DrivingScene from "../components/DrivingScene";
import MeetDonna from "../components/MeetDonna";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import WhatsAppDemo from "@/components/WhatsappDemo";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <DrivingScene />
      <MeetDonna />
      <WhatsAppDemo />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
