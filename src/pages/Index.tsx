import Header from "../components/Header";
import Hero from "../components/Hero";
import MeetDonna from "../components/MeetDonna";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import Contact from "../components/Contact";
import ScrollProgress from "../components/ScrollProgress";
import BeautyOfDonnaDrive from "@/components/BeautyOfDonnaDrive";
import DonnaCapabilities from "@/components/DonnaCapabilities";
import WhatsAppDemo from "@/components/WhatsappDemo";
import Benefits from "@/components/Benefits";
import BookingJourney from "@/components/BookingJourney";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <ScrollProgress />
      <Header />
      <Hero />
      <MeetDonna />
      <WhatsAppDemo />
      <Benefits />
      <DonnaCapabilities />
      <BookingJourney />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
