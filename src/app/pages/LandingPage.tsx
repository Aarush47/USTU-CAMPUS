import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import "../../styles/landing.css";

import heroImg from "../../assets/hero-campus.jpg";
import featLibrary from "../../assets/feat-library.jpg";
import featSmart from "../../assets/feat-smart.jpg";
import featLabs from "../../assets/feat-labs.jpg";
import featSports from "../../assets/feat-sports.jpg";
import featCanteen from "../../assets/feat-canteen.jpg";
import attendanceBg from "../../assets/attendance-bg.jpg";
import food1 from "../../assets/food-1.jpg";
import food2 from "../../assets/food-2.jpg";
import food3 from "../../assets/food-3.jpg";
import food4 from "../../assets/food-4.jpg";
import book1 from "../../assets/book-1.jpg";
import book2 from "../../assets/book-2.jpg";
import book3 from "../../assets/book-3.jpg";
import contactImg from "../../assets/contact-student.jpg";
import siteLogo from "../../logo.webp";

const navLinks = [
  { label: "Facilities", href: "#facilities" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Canteen", href: "#canteen" },
  { label: "Library", href: "#library" },
  { label: "Contact", href: "#contact" },
];

const facilities = [
  {
    title: "Library",
    desc: "A timeless space for deep work, with thousands of titles and quiet corners.",
    img: featLibrary,
    tag: "01",
  },
  {
    title: "Smart Classes",
    desc: "Modern rooms equipped with interactive displays and collaborative tools.",
    img: featSmart,
    tag: "02",
  },
  {
    title: "Laboratories",
    desc: "Fully equipped labs for research, experiments and hands-on learning.",
    img: featLabs,
    tag: "03",
  },
  {
    title: "Sports",
    desc: "Outdoor tracks, fields and courts to balance the mind and the body.",
    img: featSports,
    tag: "04",
  },
  {
    title: "Canteen",
    desc: "A warm, social place to eat, recharge and meet between classes.",
    img: featCanteen,
    tag: "05",
  },
];

const subjects = [
  { name: "Algorithms", value: 94 },
  { name: "Linear Algebra", value: 88 },
  { name: "Physics", value: 76 },
  { name: "Design Theory", value: 91 },
];

const foods = [
  { name: "Garden Sandwich", price: 80, tag: "Fresh", img: food1 },
  { name: "Heart Latte", price: 90, tag: "Hot", img: food2 },
  { name: "Mediterranean Bowl", price: 140, tag: "Veg", img: food3 },
  { name: "Cocoa Muffin", price: 60, tag: "Sweet", img: food4 },
];

const books = [
  { title: "The Art of Computation", author: "M. Aldrin", cat: "Computer Science", img: book1 },
  { title: "Vintage Letters", author: "S. Holloway", cat: "Literature", img: book2 },
  { title: "Quiet Pages", author: "L. Noren", cat: "Philosophy", img: book3 },
];

const faqs = [
  {
    q: "How do I sign up for USTUCampus?",
    a: "Use your university email to create an account - your timetable, attendance and library records sync automatically within minutes.",
  },
  { q: "Can I order food in advance?", a: "Yes. Order from the canteen anytime - pick a slot and skip the line entirely." },
  {
    q: "Is my attendance data private?",
    a: "Always. Only you and your authorized faculty can see your records, secured end-to-end.",
  },
  {
    q: "Does it work offline?",
    a: "Most features cache locally - your timetable, books on loan and balance are accessible without a connection.",
  },
  {
    q: "How do I reserve a library book?",
    a: "Search a title, tap reserve, and pick it up at the counter within 48 hours.",
  },
];

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="ustu-bloom">
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}>
        <div
          className={`mx-auto max-w-6xl px-6 flex items-center justify-between rounded-full transition-all duration-500 ${
            scrolled ? "glass shadow-soft py-2.5 px-4" : ""
          }`}
        >
          <a href="#top" className="flex items-center gap-2">
            <img
              src={siteLogo}
              alt="USTU Campus"
              className={`h-10 w-auto rounded-md object-contain bg-white/90 p-1 shadow-sm ${scrolled ? "" : "ring-1 ring-black/5"}`}
            />
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  scrolled ? "text-foreground/80 hover:text-primary" : "text-white/80 hover:text-white"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/sign-in"
              className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
            >
              Sign in
            </Link>
            <Link
              to="/sign-up"
              className="inline-flex items-center rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            >
              Sign up
            </Link>
          </div>
          <Link
            to="/sign-in"
            className="hidden md:inline-flex items-center rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      <section id="top" className="relative min-h-screen w-full overflow-hidden">
        <img
          src={heroImg}
          alt="USTU Campus at golden hour"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover scale-105"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 bg-black/25" />

        <div className="relative z-10 flex min-h-screen items-end pb-24 md:pb-32 px-6">
          <div className="mx-auto max-w-6xl w-full">
            <div className="max-w-3xl animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full glass-dark px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white/90">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Welcome to the new campus era
              </span>
              <h1 className="mt-6 font-display text-5xl md:text-7xl lg:text-8xl text-white leading-[1.02]">
                Welcome to <em className="not-italic text-accent">USTUCampus</em>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-white/85 max-w-xl font-light">
                Smart, simple, connected campus life - beautifully designed for the way students learn, eat, study
                and live today.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#facilities"
                  className="group inline-flex items-center gap-2 rounded-full bg-white text-foreground px-7 py-3.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all shadow-glow"
                >
                  Explore Now
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="#dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 text-white px-7 py-3.5 text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  View Dashboard
                </a>
              </div>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl">
              {[
                { v: "12K+", l: "Students" },
                { v: "120+", l: "Programs" },
                { v: "98%", l: "Satisfaction" },
              ].map((s) => (
                <div key={s.l} className="border-l border-white/20 pl-4">
                  <div className="font-display text-3xl md:text-4xl text-white">{s.v}</div>
                  <div className="text-xs uppercase tracking-widest text-white/70 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="facilities" className="py-28 px-6 bg-background">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
            <div className="max-w-xl">
              <span className="text-xs uppercase tracking-[0.25em] text-accent-foreground/70">- Facilities</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl text-foreground">
                Everything you need,<br />
                <em className="not-italic text-primary/70">in one place.</em>
              </h2>
            </div>
            <p className="text-muted-foreground max-w-md">
              From quiet study to lively conversations - discover the spaces that shape student life on campus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((item, idx) => (
              <article
                key={item.title}
                className={`group relative overflow-hidden rounded-3xl bg-card shadow-card hover:shadow-glow transition-all duration-500 ${
                  idx === 0 ? "lg:row-span-2" : ""
                }`}
              >
                <div className={`overflow-hidden ${idx === 0 ? "aspect-[4/5]" : "aspect-[4/3]"}`}>
                  <img
                    src={item.img}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute top-4 left-4 rounded-full glass px-3 py-1 text-xs font-mono text-cocoa">{item.tag}</div>
                <div className="p-6">
                  <h3 className="font-display text-2xl text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="dashboard" className="relative py-28 px-6 overflow-hidden bg-gradient-warm">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />

        <div className="mx-auto max-w-6xl relative">
          <div className="text-center mb-14">
            <span className="text-xs uppercase tracking-[0.25em] text-primary/70">- Dashboard</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-foreground">
              Your day, <em className="not-italic text-primary/70">at a glance.</em>
            </h2>
          </div>

          <div className="relative rounded-[2rem] glass shadow-glow p-6 md:p-10 border border-cream/60">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-display">A</div>
                <div>
                  <div className="text-sm font-medium text-foreground">Good morning, Aarav</div>
                  <div className="text-xs text-muted-foreground">Monday - April 27</div>
                </div>
              </div>
              <div className="hidden sm:flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                <span className="h-2.5 w-2.5 rounded-full bg-primary/40" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="rounded-2xl bg-card p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Attendance</span>
                  <span className="text-xs text-accent-foreground bg-accent/40 rounded-full px-2 py-0.5">Good</span>
                </div>
                <div className="mt-4 font-display text-4xl text-foreground">
                  92<span className="text-muted-foreground text-2xl">%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "92%" }} />
                </div>
                <div className="mt-3 text-xs text-muted-foreground">156 / 170 lectures</div>
              </div>

              <div className="rounded-2xl bg-card p-6 shadow-card">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Canteen Wallet</span>
                <div className="mt-4 font-display text-4xl text-foreground">Rs 1,240</div>
                <div className="mt-3 text-xs text-muted-foreground">Last spent - Latte - Rs 90</div>
                <button className="mt-4 w-full rounded-full bg-primary text-primary-foreground py-2 text-xs font-medium hover:bg-primary/90 transition">
                  Top up
                </button>
              </div>

              <div className="rounded-2xl bg-card p-6 shadow-card">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Library</span>
                <div className="mt-4 font-display text-4xl text-foreground">3</div>
                <div className="mt-1 text-sm text-foreground">Books on loan</div>
                <div className="mt-3 text-xs text-muted-foreground">Next return - May 3</div>
                <div className="mt-4 flex -space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-7 w-5 rounded-sm bg-accent/70 border border-cream" />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-2xl bg-card p-6 shadow-card">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Today&apos;s Schedule</span>
                <ul className="mt-4 space-y-3">
                  {[
                    { t: "09:00", c: "Algorithms", r: "Room 204" },
                    { t: "11:00", c: "Physics Lab", r: "Lab B" },
                    { t: "14:00", c: "Design Studio", r: "Atelier 3" },
                  ].map((item) => (
                    <li key={item.t} className="flex items-center gap-4 text-sm">
                      <span className="font-mono text-xs text-muted-foreground w-12">{item.t}</span>
                      <span className="flex-1 text-foreground">{item.c}</span>
                      <span className="text-xs text-muted-foreground">{item.r}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-primary text-primary-foreground p-6 shadow-card flex flex-col justify-between">
                <span className="text-xs uppercase tracking-widest opacity-70">Performance</span>
                <div>
                  <div className="font-display text-5xl mt-3">
                    8.7<span className="text-2xl opacity-60">/10</span>
                  </div>
                  <div className="mt-2 text-sm opacity-80">Semester GPA - top 12% of class</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="attendance" className="py-28 px-6 bg-background">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-glow">
            <img src={attendanceBg} alt="Student studying" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-cocoa/70 via-cocoa/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 glass rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-cocoa/70">Overall</span>
                <span className="text-xs text-cocoa/70">This semester</span>
              </div>
              <div className="font-display text-5xl text-cocoa mt-2">92.4%</div>
              <div className="mt-3 h-1.5 rounded-full bg-cocoa/10 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "92.4%" }} />
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-accent-foreground/70">- Attendance</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-foreground">
              Stay on track,<br />
              <em className="not-italic text-primary/70">effortlessly.</em>
            </h2>
            <p className="mt-5 text-muted-foreground max-w-md">
              Real-time attendance synced to every classroom. See where you stand, get gentle nudges, and never miss
              a milestone.
            </p>

            <div className="mt-10 space-y-6">
              {subjects.map((subject) => (
                <div key={subject.name}>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-medium text-foreground">{subject.name}</span>
                    <span className="font-mono text-sm text-muted-foreground">{subject.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        subject.value >= 85 ? "bg-primary" : subject.value >= 75 ? "bg-accent" : "bg-destructive/70"
                      }`}
                      style={{ width: `${subject.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="canteen" className="py-28 px-6 bg-secondary/40">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-14">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-accent-foreground/70">- Canteen</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl text-foreground">
                Order ahead,<br />
                <em className="not-italic text-primary/70">skip the line.</em>
              </h2>
            </div>
            <a href="#" className="text-sm font-medium text-primary inline-flex items-center gap-1.5 hover:gap-3 transition-all">
              View full menu
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {foods.map((food) => (
              <article
                key={food.name}
                className="group bg-card rounded-3xl overflow-hidden shadow-card hover:shadow-glow transition-all duration-500 hover:-translate-y-1"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={food.img}
                    alt={food.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <span className="absolute top-3 left-3 rounded-full glass px-2.5 py-1 text-[10px] uppercase tracking-widest text-cocoa">
                    {food.tag}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg text-foreground">{food.name}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-mono text-foreground">Rs {food.price}</span>
                    <button className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center hover:bg-accent hover:text-accent-foreground transition-colors">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="library" className="py-28 px-6 bg-background">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-accent-foreground/70">- Library</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-foreground">
              A quiet world of <em className="not-italic text-primary/70">ideas.</em>
            </h2>
            <p className="mt-5 text-muted-foreground">
              Browse, borrow and reserve from over 80,000 titles - curated for curious minds.
            </p>

            <div className="mt-8 flex items-center gap-2 rounded-full bg-card border border-border p-1.5 shadow-soft max-w-md mx-auto">
              <div className="pl-4 text-muted-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search titles, authors, ISBN..."
                className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary/90 transition">
                Search
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {books.map((book) => (
              <article key={book.title} className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary shadow-card group-hover:shadow-glow transition-all duration-500">
                  <img
                    src={book.img}
                    alt={book.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="mt-5">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{book.cat}</span>
                  <h3 className="font-display text-2xl text-foreground mt-1">{book.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">by {book.author}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-28 px-6 bg-secondary/40">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-accent-foreground/70">- FAQ</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl text-foreground">
              Questions, <em className="not-italic text-primary/70">answered.</em>
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.q}
                value={`item-${i}`}
                className="rounded-2xl bg-card border border-border px-6 shadow-card"
              >
                <AccordionTrigger className="text-left font-display text-lg hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section id="contact" className="py-28 px-6 bg-background">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 items-stretch">
          <div className="relative rounded-3xl overflow-hidden min-h-[480px] shadow-glow">
            <img src={contactImg} alt="Student" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-cocoa/80 via-cocoa/20 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-cream">
              <span className="text-xs uppercase tracking-[0.25em] opacity-80">- Contact</span>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">Let&apos;s talk.</h2>
              <p className="mt-3 text-cream/80 max-w-sm">Questions, partnerships, or feedback - we&apos;d love to hear from you.</p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="rounded-3xl bg-card p-8 md:p-10 shadow-card border border-border flex flex-col"
          >
            <h3 className="font-display text-3xl text-foreground">Send a message</h3>
            <p className="text-sm text-muted-foreground mt-2">We reply within one working day.</p>

            <div className="mt-8 space-y-5 flex-1">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Name</label>
                <input
                  required
                  className="mt-2 w-full bg-transparent border-b border-border py-2 outline-none focus:border-primary transition"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
                <input
                  required
                  type="email"
                  className="mt-2 w-full bg-transparent border-b border-border py-2 outline-none focus:border-primary transition"
                  placeholder="you@university.edu"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">Message</label>
                <textarea
                  required
                  rows={4}
                  className="mt-2 w-full bg-transparent border-b border-border py-2 outline-none focus:border-primary transition resize-none"
                  placeholder="How can we help?"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-8 inline-flex justify-center items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all"
            >
              {sent ? "Message sent" : "Send message"}
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-primary text-primary-foreground px-6 pt-20 pb-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12 pb-14 border-b border-cream/10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <img src={siteLogo} alt="USTU Campus" className="h-14 w-auto rounded-md object-contain bg-white p-1 shadow-sm" />
              </div>
              <p className="mt-5 text-cream/70 max-w-sm leading-relaxed">
                Smart, simple, connected campus life - beautifully designed for the way students learn today.
              </p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-cream/50">Explore</div>
              <ul className="mt-5 space-y-2 text-sm text-cream/80">
                <li>
                  <a href="#facilities" className="hover:text-accent transition">
                    Facilities
                  </a>
                </li>
                <li>
                  <a href="#dashboard" className="hover:text-accent transition">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#canteen" className="hover:text-accent transition">
                    Canteen
                  </a>
                </li>
                <li>
                  <a href="#library" className="hover:text-accent transition">
                    Library
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-cream/50">Access</div>
              <ul className="mt-5 space-y-2 text-sm text-cream/80">
                <li>
                  <Link to="/sign-in" className="hover:text-accent transition">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link to="/sign-up" className="hover:text-accent transition">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-cream/50">
            <div>Copyright {new Date().getFullYear()} USTUCampus.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-cream transition">
                Privacy
              </a>
              <a href="#" className="hover:text-cream transition">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
