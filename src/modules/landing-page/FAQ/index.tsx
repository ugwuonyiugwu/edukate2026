"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { Footer } from '../ui/components/footer';
import { SiWhatsapp } from 'react-icons/si';

const faqs = [
  {
    question: "What is EduKate and what is its main goal?",
    answer: "EduKate aims to bridge the educational gap between the upper class and lower class by providing equal access to world-class learning tools, unlimited resources, and financial opportunities."
  },
  {
    question: "How does the Library work?",
    answer: "The library offers access to unlimited copyright-free textbooks where you can easily search for particular topics you want to read. Each topic includes assigned questions so you can test your understanding and assess your performance after studying."
  },
  {
    question: "What is Quizathon and how do I win?",
    answer: "Quizathon is a competitive feature where users can register for quizzes and win huge cash prizes. Questions comprise items from various selected subjects, and when you choose your subjects, questions are set accordingly based on those selections."
  },
  {
    question: "Can I compete with friends?",
    answer: "Yes! You can create custom quizzes and invite friends to friendly competitions. This mode also serves as a great tool to practice and prepare for Computer-Based Tests (CBT)."
  },
  {
    question: "How do scholarships work on EduKate?",
    answer: "Our platform fetches and aggregates different available external scholarships to make it easy for users to access and apply. Additionally, we directly award our own scholarships to support dedicated students."
  }
];

export const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white h-[70vh] px-6 flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0 h-full w-full">
          <Image
            src="/backgroud-images/contactimage.png"
            alt="EduKate FAQ background"
            fill
            priority={true}
            className="object-cover object-top"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 z-10 bg-blue-900/85" />

        <div className="relative z-20 max-w-xl mx-auto space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">Got Questions?</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white">Frequently Asked Questions</h1>
          <p className="text-blue-50 text-base">
            Everything you need to know about the library, quizathons, competitions, and scholarships on EduKate.
          </p>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <main className="max-w-3xl mx-auto py-16 px-6">
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left font-bold text-gray-900 flex justify-between items-center gap-4 hover:bg-gray-50/50"
                  aria-expanded={isOpen}
                >
                  <span className="text-lg">{faq.question}</span>
                  <ChevronDown 
                    className={`text-blue-600 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
                    size={20} 
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Callout */}
        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Still have more questions?</h3>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            We are always happy to help you navigate your learning journey. Reach out to us directly!
          </p>
          <a
            href="https://wa.me/2348129156454"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm shadow-sm"
          >
            <SiWhatsapp size={18} />
            Chat on WhatsApp
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
};