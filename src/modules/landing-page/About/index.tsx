"use client";

import Image from 'next/image';
import { BookOpen, Award, Users, GraduationCap, Target, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '../ui/components/footer';
import Link from 'next/link';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white h-[80vh] px-6 flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0 h-full w-full">
          <Image
            src="/backgroud-images/contactimage.png"
            alt="EduKate background"
            fill
            priority={true}
            className="object-cover object-top"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 z-10 bg-blue-900/85" />

        <div className="relative z-20 max-w-3xl mx-auto space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">About EduKate</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            Bridging the Educational Gap
          </h1>
          <p className="text-lg md:text-xl text-blue-50 leading-relaxed max-w-2xl mx-auto">
            Our main aim is to bridge the educational gap between the upper class and lower class by providing equal access to world-class learning tools, competitive challenges, and financial opportunities.
          </p>
        </div>
      </section>

      {/* Mission / Vision Statement */}
      <section className="max-w-5xl mx-auto py-16 px-6">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
              <Target size={24} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Empowering Every Student</h2>
            <p className="text-gray-600 leading-relaxed">
              Education shouldn't be a privilege reserved for a select few. We built EduKate to democratize learning—ensuring that geographical location or socioeconomic background never stands in the way of academic and financial success.
            </p>
            <ul className="space-y-3 text-sm text-gray-700 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-[#00C7B1]" size={18} /> Unlimited copyright-free textbooks
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-[#00C7B1]" size={18} /> Performance-assessing tests and exams
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="text-[#00C7B1]" size={18} /> Transparent scholarship opportunities
              </li>
            </ul>
          </div>
          <div className="relative h-87.5 rounded-2xl overflow-hidden shadow-md">
            <Image
              src="/backgroud-images/contactimage.png"
              alt="Mission and vision"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-6xl mx-auto py-12 px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900">What We Offer</h2>
          <p className="text-gray-500 text-sm">
            Explore our comprehensive ecosystem designed to enhance knowledge, test mastery, and reward brilliance.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1: The Library */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <BookOpen size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">The Library</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Access unlimited copyright-free textbooks. Search seamlessly for specific topics you want to read, and follow up your study with assigned questions to evaluate your understanding.
            </p>
          </div>

          {/* Feature 2: Quizathon */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-[#F59E0B]">
              <Award size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Quizathon</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Register for high-stakes quizathons and win huge cash prizes! Questions span across various selected subjects, testing your breadth of knowledge in competitive arenas.
            </p>
          </div>

          {/* Feature 3: Friendly Competitions */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-[#00C7B1]">
              <Users size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Friendly Duels & CBT Prep</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Create custom quizzes, invite friends to compete head-to-head, and sharpen your speed and accuracy for computer-based tests (CBT).
            </p>
          </div>
        </div>

        {/* Feature 4: Scholarships (Full width banner/card) */}
        <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-200">
              <GraduationCap size={24} />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold">Scholarships Gateway & Direct Funding</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              We aggregate and fetch diverse external scholarships so you can access and apply for financial backing effortlessly. Plus, we directly fund and award our own internal scholarships to deserving minds.
            </p>
          </div>
          <Link href="http://localhost:3000/scholarship">
            <Button className="bg-white text-blue-900 hover:bg-blue-50 font-semibold gap-2 whitespace-nowrap">
            Explore Opportunities <ArrowRight size={16} />
          </Button>
          </Link>
          
        </div>
      </section>

      <Footer />
    </div>
  );
};