import { Link } from "react-router-dom";
import { ArrowRight, PiggyBank, Sparkles, Target, Wallet, TrendingUp, FileText } from "lucide-react";

const FEATURES = [
  { icon: Wallet, title: "Smart expense tracking", desc: "Every transaction, categorized and searchable in seconds." },
  { icon: Sparkles, title: "AI financial insights", desc: "Ask plain questions about your money and get grounded answers." },
  { icon: Target, title: "Budgets that warn you early", desc: "See a budget creeping toward its limit before it's a problem." },
  { icon: PiggyBank, title: "Savings goals", desc: "Track progress toward what you're actually saving for." },
  { icon: TrendingUp, title: "Expense predictions", desc: "A running estimate of next month, based on your own history." },
  { icon: FileText, title: "Reports you can export", desc: "Monthly and yearly summaries as CSV or PDF, whenever you need them." },
];

const STEPS = [
  "Add your transactions",
  "Track your spending",
  "Get AI insights",
  "Improve your financial habits",
];

export const LandingPage = () => (
  <div className="min-h-screen bg-paper text-ink">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-8">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald text-white font-display text-base">
          S
        </div>
        <span className="font-display text-lg">SpendSense</span>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/login" className="text-sm text-ink/80 hover:text-ink">
          Log in
        </Link>
        <Link
          to="/register"
          className="rounded-lg bg-emerald px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Get started
        </Link>
      </div>
    </header>

    <section className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
      <h1 className="font-display text-4xl leading-tight md:text-6xl">
        Understand where your money goes.
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-base text-muted md:text-lg">
        Track expenses, manage budgets, achieve financial goals, and get AI-powered insights into
        your spending.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/register"
          className="flex items-center gap-1.5 rounded-lg bg-emerald px-5 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          Get started <ArrowRight size={16} />
        </Link>
        <Link
          to="/login"
          className="rounded-lg border border-line px-5 py-3 text-sm font-medium hover:bg-paper-dim"
        >
          View demo
        </Link>
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border border-line p-5">
            <f.icon size={20} className="text-emerald" />
            <h3 className="mt-3 font-display text-lg">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="border-t border-line bg-paper-dim/50 py-14">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <h2 className="text-center font-display text-2xl">How it works</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step} className="text-center">
              <div className="mx-auto mb-2 flex size-9 items-center justify-center rounded-full border border-emerald text-emerald font-display">
                {i + 1}
              </div>
              <p className="text-sm">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span>SpendSense</span>
        <div className="flex gap-5">
          <span>Product</span>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
        </div>
      </div>
    </footer>
  </div>
);
