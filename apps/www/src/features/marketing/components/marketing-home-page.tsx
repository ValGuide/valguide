import { HeroSection } from './hero-section'
import { LocaleChrome } from './locale-chrome'
import { PricingSection, PilotSection } from './pricing-section'
import { ProblemSection, SolutionSection, UseCasesSection, WhySection } from './marketing-sections'
import { SiteFooter, TrustSection } from './trust-footer'

export function MarketingHomePage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <LocaleChrome />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <WhySection />
      <PricingSection />
      <PilotSection />
      <UseCasesSection />
      <TrustSection />
      <SiteFooter />
    </main>
  )
}
