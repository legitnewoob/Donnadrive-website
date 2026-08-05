import Header from "../components/Header";
import Hero from "../components/Hero";
import DrivingScene from "../components/DrivingScene";
import MeetDonna from "../components/MeetDonna";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import ScrollProgress from "../components/ScrollProgress";
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
      <DrivingScene />
      <MeetDonna />
      <WhatsAppDemo />
      <Benefits />
      <DonnaCapabilities />
      <BookingJourney />
      <Pricing />
      <FAQ />
      {/* <FinalCTA /> */}
      <Footer />
    </div>
  );
};

export default Index;
