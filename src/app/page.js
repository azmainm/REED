"use client";

import Image from "next/image";
import { ArrowRight, BookOpen, Sparkles, Book, Users } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import landingImage from "../assets/landing.png";
import landingDarkImage from "../assets/landing-dark.png";

export default function Home() {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const counterRef = useRef(null);
  
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && count === 0) {
        setIsAnimating(true);
      }
    }, options);
    
    if (counterRef.current) {
      observer.observe(counterRef.current);
    }
    
    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, [count]);
  
  useEffect(() => {
    if (isAnimating && count < 102) {
      const timer = setTimeout(() => {
        setCount(prevCount => {
          // Accelerate counter as it goes higher
          const increment = Math.max(1, Math.floor(prevCount / 20));
          return Math.min(102, prevCount + increment);
        });
      }, 40);
      
      return () => clearTimeout(timer);
    }
  }, [count, isAnimating]);
  
  return (
    <div className="flex flex-col items-center overflow-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 -z-10 grid-background"></div>
      
      {/* Hero Section */}
      <section className="container max-w-6xl px-4 sm:px-6 py-12 md:py-24 lg:py-32 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          Learn From Stories, <span className="gradient-text">Not Summaries</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mb-10">
        REED is an AI-powered platform that transforms book chapters and articles into interactive micro-stories — making learning feel like storytelling.
        </p>
      
        {/* Mockup Image */}
        <div className="mt-16 w-full max-w-4xl overflow-hidden rounded-xl border border-border shadow-xl">
          <Image
            src={landingImage}
            alt="Reed platform screenshot"
            width={1200}
            height={700}
            className="w-full block dark:hidden"
            priority
          />
          <Image
            src={landingDarkImage}
            alt="Reed platform screenshot"
            width={1200}
            height={700}
            className="w-full hidden dark:block"
            priority
          />
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="container max-w-6xl px-4 sm:px-6 py-12 md:py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">🧠 What is REED?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            REED is a platform where creators turn pages of real books, journals, and articles into interactive, 
            lesson-driven story experiences — powered by AI, designed for curious minds, and interactive to keep you learning.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* For Readers Section */}
          <div className="card-hover rounded-lg border border-border bg-gradient-to-t from-zinc-200/50 to-zinc-100/70 dark:from-zinc-800 dark:to-zinc-800/50 p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-4">🎭 For Readers</h3>
            <p className="text-muted-foreground mb-6">
              Explore a world of &quot;Reeds&quot; — bite-sized, interactive stories that teach you real ideas from fiction, 
              finance, biographies, productivity, and more.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Save them.</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Complete them.</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Level up.</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Learn by engaging, not scrolling or turning pages.</span>
              </li>
            </ul>
          </div>
          
          {/* For Creators Section */}
          <div className="card-hover rounded-lg border border-border bg-gradient-to-t from-zinc-200/50 to-zinc-100/70 dark:from-zinc-800 dark:to-zinc-800/50 p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-4">✍️ For Creators</h3>
            <p className="text-muted-foreground mb-6">
              Got a chapter or idea to share? Upload or scan a PDF, article, or book section — REED uses AI to turn it 
              into a meaningful, narrative-based experience automatically.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <span className="text-primary mr-2 flex-shrink-0">⚡</span>
                <span>Add your own touch or publish it as is.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2 flex-shrink-0">🛡</span>
                <span>Choose to keep it private or publish to the world.</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2 flex-shrink-0">📈</span>
                <span>Earn XP, credibility — and eventually, cash.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section ref={counterRef} className="container max-w-6xl px-4 sm:px-6 py-8 md:py-12 my-6">
        <div className="rounded-xl border border-border bg-gradient-to-t from-zinc-200/50 to-zinc-100/70 dark:from-zinc-800 dark:to-zinc-800/50 shadow-lg px-8 py-10">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex flex-col items-center mb-8">
              <Book className="h-16 w-16 text-primary mb-6" />
              <h2 className="text-6xl md:text-7xl font-bold mb-3">
                <span className={`inline-block tabular-nums transition-transform ${count === 102 ? '' : 'scale-110'}`}>
                  {count}
                </span>
                <span className="ml-4">Books</span>
              </h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Our growing library of interactive stories helps you learn faster and retain knowledge better than traditional reading.
            </p>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="container max-w-6xl px-4 sm:px-6 py-8 md:py-16 mb-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start your journey with REED today.
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-700 p-8 md:p-12 w-full max-w-xl shadow-lg bg-gradient-to-t from-zinc-200/50 to-zinc-100/70 dark:from-zinc-800 dark:to-zinc-800/50 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <div className="text-5xl md:text-6xl font-bold mb-2 gradient-text">FREE</div>
                <div className="text-lg text-muted-foreground">Full access to all features (for now)</div>
              </div>
              
              <div className="text-6xl md:text-7xl font-bold">$0</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full border-t border-border py-6 bg-background">
        <div className="container max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Reed. Developed by Crater Co. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
