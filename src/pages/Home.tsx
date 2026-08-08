import {
  FileClock,
  Globe2,
  Lock,
  Menu,
  Send,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { PhoneFrame } from "@/components/phone-frame"

import apologyFormScreen from "@/assets/apology-form-screen.png"
import apologyScreen from "@/assets/apology-screen.png"
import cafisLogo from "@/assets/cafis-logo-no-bg.png"
import homeScreen from "@/assets/home-screen.png"
import profileScreen from "@/assets/profile-screen.png"
import walletScreen from "@/assets/wallet-screen.png"

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
]

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Your money is held safely",
    description:
      "The moment you send an apology, the funds move into escrow. They're only released to the other person once they accept — otherwise every cent comes back to you.",
  },
  {
    icon: FileClock,
    title: "Track every apology",
    description:
      "See everything you've sent and received in one place, with a clear status for each: pending, accepted, or declined.",
  },
  {
    icon: Send,
    title: "Reach anyone, even without the app",
    description:
      "No account on Cafis yet? We'll text them a claim link straight away. They have 7 days to accept before the money is automatically returned to you.",
  },
  {
    icon: Wallet,
    title: "A simple wallet",
    description:
      "Deposit and withdraw in a couple of taps, and see your balance and transaction history update instantly.",
  },
  {
    icon: Globe2,
    title: "Built for Somaliland",
    description:
      "The entire app is in Somali, priced in US dollars, and covers the cities you actually send money to.",
  },
  {
    icon: Lock,
    title: "Your account, protected",
    description:
      "Update your profile and password anytime, with account security built in from the start.",
  },
]

const STEPS = [
  {
    title: "Tell us who, and why",
    description:
      "Enter their name, phone number, and city, then write your apology in your own words.",
  },
  {
    title: "Set the amount",
    description: "Decide how much you want to send to make things right.",
  },
  {
    title: "We hold it safely",
    description:
      "Your funds move into escrow immediately — whether or not they're on Cafis yet.",
  },
  {
    title: "They respond",
    description:
      "They accept and the money settles with them, or decline and it's refunded to you in full.",
  },
]

const SCREENSHOTS = [
  {
    src: walletScreen,
    alt: "Cafis wallet screen showing balance and recent activity",
    caption: "Your wallet",
  },
  {
    src: apologyScreen,
    alt: "Cafis screen listing sent and received apology requests",
    caption: "Every apology, tracked",
  },
  { src: profileScreen, alt: "Cafis profile screen", caption: "Your account" },
]

const FAQS = [
  {
    question: "What happens to my money while I wait for a response?",
    answer:
      "It sits safely in escrow — moved out of your available balance the moment you send the apology, but not yet paid to anyone. If they accept, it settles with them. If they decline, it's returned to your wallet in full.",
  },
  {
    question: "What if the person I'm apologizing to doesn't use Cafis?",
    answer:
      "We send them an SMS with a secure link to claim the money. They have 7 days to accept it — if they don't, the transfer expires and your funds are automatically refunded.",
  },
  {
    question: "What currency does Cafis use?",
    answer: "All wallets and apologies on Cafis are in US dollars.",
  },
  {
    question: "Can I change my mind after sending an apology?",
    answer:
      "Once it's sent, the amount is held in escrow until the recipient responds. If they decline, or the request expires unclaimed, you get your money back automatically.",
  },
]

export function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a
            href="#"
            className="flex items-center gap-2 font-heading font-semibold"
          >
            <img src={cafisLogo} alt="Cafis" className="size-8" />
            Cafis
          </a>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Button>Download the app</Button>
          </div>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu />
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-16 pb-20 md:grid-cols-2 md:pt-24">
          <div>
            <Badge variant="secondary">
              <Sparkles className="opacity-70" />
              Now live in Somaliland
            </Badge>
            <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Say sorry the right way — with money that means it
            </h1>
            <p className="mt-6 max-w-lg text-balance text-muted-foreground sm:text-lg">
              Cafis helps you settle a debt or make amends with a real apology,
              backed by real money. Your funds stay safely in escrow until the
              person you're apologizing to accepts.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto">
                Download for iOS
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Get it on Android
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Coming soon to the App Store and Google Play
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <PhoneFrame
              src={homeScreen}
              alt="Cafis home screen showing wallet balance and quick actions"
            />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-y bg-muted/30 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline">Features</Badge>
              <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Everything you need to make things right
              </h2>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <Card key={feature.title} className="ring-foreground/10">
                  <CardContent className="flex flex-col gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="size-5" />
                    </span>
                    <h3 className="font-heading font-medium">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div className="order-2 flex justify-center md:order-1">
              <PhoneFrame
                src={apologyFormScreen}
                alt="Cafis apology request form"
              />
            </div>
            <div className="order-1 md:order-2">
              <Badge variant="outline">How it works</Badge>
              <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                From apology to settlement in four steps
              </h2>
              <ol className="mt-8 flex flex-col gap-6">
                {STEPS.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Screenshot gallery */}
        <section className="border-y bg-muted/30 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline">See it in action</Badge>
              <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                A closer look at Cafis
              </h2>
            </div>
            <div className="mt-14 grid gap-10 sm:grid-cols-3">
              {SCREENSHOTS.map((screenshot) => (
                <div
                  key={screenshot.caption}
                  className="flex flex-col items-center gap-4"
                >
                  <PhoneFrame src={screenshot.src} alt={screenshot.alt} />
                  <p className="text-sm font-medium text-muted-foreground">
                    {screenshot.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
          <div className="text-center">
            <Badge variant="outline">FAQ</Badge>
            <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <Accordion className="mt-10" defaultValue={["item-0"]}>
            {FAQS.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Ready to make things right?
            </h2>
            <p className="max-w-xl text-balance text-primary-foreground/80">
              Download Cafis and send your first apology today.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="secondary">
                Download for iOS
              </Button>
              <Button size="lg" variant="secondary">
                Get it on Android
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:justify-between">
          <div>
            <a
              href="#"
              className="flex items-center gap-2 font-heading font-semibold"
            >
              <img src={cafisLogo} alt="Cafis" className="size-8" />
              Cafis
            </a>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Settle debts and make amends, backed by real money held safely
              until the other person responds.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <p className="font-medium">Product</p>
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#faq"
              className="text-muted-foreground hover:text-foreground"
            >
              FAQ
            </a>
          </div>
        </div>
        <div className="border-t px-6 py-6 text-center text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Cafis. All rights reserved.
            {" · "}
            <Link to="/login" className="hover:text-foreground hover:underline">
              Admin login
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home
