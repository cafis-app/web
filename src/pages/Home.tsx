import {
  ArrowRight,
  BarChart3,
  Check,
  Layers,
  Menu,
  Shield,
  Sparkles,
  Star,
  Workflow,
  Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
]

const LOGOS = ["Acme", "Globex", "Initech", "Umbrella", "Soylent", "Hooli"]

const FEATURES = [
  {
    icon: Zap,
    title: "Automated workflows",
    description:
      "Build no-code automations that connect every tool your team already uses in minutes, not weeks.",
  },
  {
    icon: BarChart3,
    title: "Real-time analytics",
    description:
      "Track the metrics that matter with live dashboards and reports you can share with anyone.",
  },
  {
    icon: Layers,
    title: "Unified workspace",
    description:
      "Bring docs, tasks, and conversations into a single place so nothing falls through the cracks.",
  },
  {
    icon: Shield,
    title: "Enterprise-grade security",
    description:
      "SOC 2 Type II compliant with SSO, granular permissions, and audit logs out of the box.",
  },
  {
    icon: Workflow,
    title: "Powerful integrations",
    description:
      "Connect to over 100 tools including Slack, Notion, and GitHub with just a couple of clicks.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted insights",
    description:
      "Let built-in AI summarize threads, draft updates, and surface what needs your attention.",
  },
]

const STATS = [
  { value: "12k+", label: "Teams onboard" },
  { value: "99.99%", label: "Uptime SLA" },
  { value: "4.9/5", label: "Average rating" },
  { value: "40+", label: "Integrations" },
]

const TESTIMONIALS = [
  {
    name: "Jordan Blake",
    role: "VP of Operations, Globex",
    quote:
      "We replaced four separate tools with this platform and cut our weekly reporting time in half. It just works.",
    avatar: "https://placehold.co/100x100/6d28d9/ffffff?text=JB",
  },
  {
    name: "Priya Nair",
    role: "Head of Product, Initech",
    quote:
      "The automations alone paid for the subscription in the first month. Our onboarding flow used to take days.",
    avatar: "https://placehold.co/100x100/0f766e/ffffff?text=PN",
  },
  {
    name: "Marco Silva",
    role: "Engineering Lead, Hooli",
    quote:
      "Rock-solid reliability and a support team that actually responds. Migrating our whole org was painless.",
    avatar: "https://placehold.co/100x100/b45309/ffffff?text=MS",
  },
]

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "For individuals trying things out.",
    features: [
      "Up to 3 projects",
      "1 GB storage",
      "Community support",
      "Basic analytics",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per user / month",
    description: "For growing teams that need more power.",
    features: [
      "Unlimited projects",
      "100 GB storage",
      "Priority support",
      "Advanced analytics",
      "Custom integrations",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "billed annually",
    description: "For organizations with advanced needs.",
    features: [
      "Unlimited everything",
      "Dedicated account manager",
      "SSO & SCIM",
      "Custom SLAs",
      "Audit logs",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
]

const FAQS = [
  {
    question: "Can I try the product before paying?",
    answer:
      "Yes, every plan starts with a 14-day free trial and no credit card is required to get started.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Absolutely. You can upgrade, downgrade, or cancel your plan at any time from your account settings.",
  },
  {
    question: "Do you offer discounts for nonprofits or education?",
    answer:
      "Yes, we offer 30% off for verified nonprofits and educational institutions. Reach out to our sales team.",
  },
  {
    question: "Is my data secure?",
    answer:
      "We're SOC 2 Type II compliant and encrypt data in transit and at rest. Enterprise plans include SSO and audit logs.",
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
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            Nimbus
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
            <Button>
              Download app
              <ArrowRight />
            </Button>
          </div>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu />
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
          <Badge variant="secondary" className="mx-auto">
            <Sparkles className="opacity-70" />
            Now with AI-powered workflows
          </Badge>
          <h1 className="mx-auto mt-6 max-w-3xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Run your entire team from one calm workspace
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-muted-foreground sm:text-lg">
            Nimbus brings your docs, tasks, and conversations together with
            automation and analytics built in, so your team spends less time
            switching tabs and more time shipping.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto">
              Start for free
              <ArrowRight />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Watch demo
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            No credit card required &middot; Free 14-day trial
          </p>

          <div className="mt-16 overflow-hidden rounded-2xl ring-1 ring-foreground/10">
            <img
              src="https://placehold.co/1200x700/f4f4f5/71717a?text=Product+Screenshot"
              alt="Product dashboard preview"
              className="w-full dark:hidden"
            />
            <img
              src="https://placehold.co/1200x700/27272a/a1a1aa?text=Product+Screenshot"
              alt="Product dashboard preview"
              className="hidden w-full dark:block"
            />
          </div>
        </section>

        {/* Logo cloud */}
        <section className="border-y bg-muted/30 py-10">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-center text-sm text-muted-foreground">
              Trusted by teams at fast-growing companies
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70 grayscale">
              {LOGOS.map((logo) => (
                <span
                  key={logo}
                  className="font-heading text-lg font-semibold text-muted-foreground"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline">Features</Badge>
            <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Everything your team needs, nothing it doesn&apos;t
            </h2>
            <p className="mt-4 text-balance text-muted-foreground">
              Purpose-built tools that adapt to how your team already works,
              backed by infrastructure that scales with you.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="ring-foreground/10">
                <CardContent className="flex flex-col gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </span>
                  <h3 className="font-heading font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="border-y bg-muted/30 py-16">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 text-center md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-heading text-3xl font-semibold sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="mx-auto max-w-6xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline">Testimonials</Badge>
            <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Loved by teams around the world
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <Card key={testimonial.name} className="ring-foreground/10">
                <CardContent className="flex flex-col gap-4">
                  <div className="flex gap-0.5 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={testimonial.avatar}
                        alt={testimonial.name}
                      />
                      <AvatarFallback>
                        {testimonial.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-y bg-muted/30 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline">Pricing</Badge>
              <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Simple pricing that scales with you
              </h2>
              <p className="mt-4 text-balance text-muted-foreground">
                Start for free, upgrade when you need more. No hidden fees,
                cancel anytime.
              </p>
            </div>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {PLANS.map((plan) => (
                <Card
                  key={plan.name}
                  className={
                    plan.highlighted
                      ? "ring-2 ring-primary"
                      : "ring-foreground/10"
                  }
                >
                  <CardContent className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-medium">{plan.name}</h3>
                      {plan.highlighted ? <Badge>Most popular</Badge> : null}
                    </div>
                    <div>
                      <span className="font-heading text-4xl font-semibold">
                        {plan.price}
                      </span>
                      <span className="ml-1 text-sm text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                    <Separator />
                    <ul className="flex flex-col gap-2.5 text-sm">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="size-4 shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-auto w-full"
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
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
              Ready to bring your team together?
            </h2>
            <p className="max-w-xl text-balance text-primary-foreground/80">
              Join thousands of teams already running on Nimbus. Get started in
              minutes, no credit card required.
            </p>
            <Button size="lg" variant="secondary">
              Start your free trial
              <ArrowRight />
            </Button>
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
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              Nimbus
            </a>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              The all-in-one workspace for modern teams.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <p className="font-medium">Product</p>
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground"
              >
                Pricing
              </a>
              <a
                href="#faq"
                className="text-muted-foreground hover:text-foreground"
              >
                FAQ
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-medium">Company</p>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                About
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Blog
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Careers
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-medium">Legal</p>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
        <div className="border-t px-6 py-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Nimbus, Inc. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default Home
