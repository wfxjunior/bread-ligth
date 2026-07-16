import { Hero } from "@/components/sections/Hero";
import { ProductStory } from "@/components/sections/ProductStory";
import { CoreExperience } from "@/components/sections/CoreExperience";
import { FeatureSections } from "@/components/sections/FeatureSections";
import { BibleLibrary } from "@/components/sections/BibleLibrary";
import { ReadingAtmospheres } from "@/components/sections/ReadingAtmospheres";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { AppPreview } from "@/components/sections/AppPreview";
import { Pricing } from "@/components/sections/Pricing";
import { Waitlist } from "@/components/sections/Waitlist";
import { FAQ } from "@/components/sections/FAQ";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductStory />
      <CoreExperience />
      <FeatureSections />
      <BibleLibrary />
      <ReadingAtmospheres />
      <HowItWorks />
      <AppPreview />
      <Pricing />
      <Waitlist />
      <FAQ />
    </>
  );
}
