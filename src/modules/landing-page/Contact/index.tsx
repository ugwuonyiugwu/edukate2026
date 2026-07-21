"use client";

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, ContactIcon, PhoneIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Footer } from '../ui/components/footer';
import { SiWhatsapp } from 'react-icons/si';

export const ContactPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneNumber = "2348129156454"; 
    const text = `Hello, my name is ${formData.firstName} ${formData.lastName}.\nEmail: ${formData.email}\nPhone: ${formData.phone}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white h-[90vh] px-6 flex items-center justify-center text-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 h-full w-full">
          <Image
            src="/backgroud-images/contactimage.png"
            alt="background image"
            fill
            priority={true}
            className="object-cover object-top"
            sizes="100vw"
          />
        </div>
        
        {/* The Blue Overlay */}
        <div className="absolute inset-0 z-10 bg-blue-900/80" />

        {/* Content */}
        <div className="relative z-20 max-w-xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2 text-blue-200">Contact Us</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Get in Touch</h1>
          <p className="text-lg text-blue-50">
            Ready to transform your career? Our expert advisors are standing by to help you design the perfect learning solution.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto py-12 px-6 grid md:grid-cols-2 gap-12">
        
        {/* Form Section */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border">
          <h2 className="text-2xl font-bold mb-2">Send us a Message</h2>
          <p className="text-gray-500 mb-6 text-sm">Fill out the form below to chat with us directly on WhatsApp</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              placeholder="First Name *" 
              required
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            />
            <Input 
              placeholder="Last Name *" 
              required
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            />
            <Input 
              type="email" 
              placeholder="Email Address *" 
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <Input 
              type="tel" 
              placeholder="Phone Number" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            
            {isMounted && (
              <Select 
                value={formData.subject} 
                onValueChange={(value) => setFormData({...formData, subject: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                  <SelectItem value="Career Advice">Career Advice</SelectItem>
                  <SelectItem value="Technical Support">Technical Support</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Textarea 
              placeholder="Tell us how we can help you..." 
              className="h-32" 
              required
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            />
            
            <Button type="submit" className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white">
              <SiWhatsapp size={18} />
              Send via WhatsApp
            </Button>
          </form>
        </section>

        {/* Contact Details Section */}
        <section className="space-y-8">
          <p className="text-gray-700 leading-relaxed">
            Reach out to us through any of the following channels.
          </p>
          
          <div className="space-y-6">
            <ContactItem icon={<Mail className="text-blue-600" />} title="Email" desc="edukate2026@gmail.com" />
            <ContactItem icon={<SiWhatsapp className="text-blue-600" size={25} />} title="WhatsApp" desc="08129156454" />
            <ContactItem icon={<PhoneIcon className="text-blue-600" />} title="Phone Number" desc="08129156454" />
            <ContactItem icon={<Clock className="text-blue-600" />} title="Active Hours" desc="Sun - Mon: 08:00 AM - 10:00 PM" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

function ContactItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="bg-gray-100 p-2 rounded-lg w-10 h-10 flex items-center justify-center">{icon}</div>
      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="text-gray-600 text-sm">{desc}</p>
      </div>
    </div>
  );
}