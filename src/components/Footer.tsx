"use client";
import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Dribbble,
  Globe,
} from "lucide-react";
import { FooterBackgroundGradient } from "@/components/ui/hover-footer";
import { TextHoverEffect } from "@/components/ui/hover-footer";

function Footer() {
  // Footer link data
  const footerLinks = [
    {
      title: "About Us",
      links: [
        { label: "Company History", href: "#" },
        { label: "Meet the Team", href: "#" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "#" },
      ],
    },
    {
      title: "Helpful Links",
      links: [
        { label: "FAQs", href: "/#faq" },
        { label: "Support", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy-policy" },
        { label: "Terms & Conditions", href: "/terms" },
        { label: "Data Deletion", href: "/data-deletion" },
      ],
    },
  ];

  // Contact info data
  const contactInfo = [
    {
      icon: <Mail size={18} className="text-[#14b8a6]" />,
      text: "connect@khanect.com",
      href: "mailto:connect@khanect.com",
    },
    {
      icon: <Phone size={18} className="text-[#14b8a6]" />,
      text: "+91 628 194 4674",
      href: "tel:+916281944674",
    },
    {
      icon: <MapPin size={18} className="text-[#14b8a6]" />,
      text: "Attapur, Hyderabad, India",
    },
  ];

  // Social media icons
  const socialLinks = [
    { icon: <Instagram size={20} />, label: "Instagram", href: "https://www.instagram.com/khanect.ai/" },
    { icon: <Facebook size={20} />, label: "Facebook", href: "https://www.facebook.com/connect.khanect" },
    { icon: <Twitter size={20} />, label: "Twitter", href: "https://x.com/2099Mmk" },
  ];

  return (
    <footer className="bg-[#0F0F11]/10 relative h-fit rounded-3xl overflow-hidden m-8">
      <div className="max-w-7xl mx-auto p-14 z-50 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 md:gap-8 lg:gap-16 pb-12">
          {/* Brand section */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <div
                className="h-28 w-[30rem] bg-[#14b8a6]"
                style={{
                  maskImage: 'url("/logo-full.png")',
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                  maskPosition: "left",
                  WebkitMaskImage: 'url("/logo-full.png")',
                  WebkitMaskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "left",
                }}
              />
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              Empowering businesses with automated AI content engines and intelligent client portals.
            </p>
          </div>

          {/* Footer link sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-white text-lg font-semibold mb-6">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label} className="relative">
                    <a
                      href={link.href}
                      className="text-gray-500 hover:text-[#14b8a6] transition-colors"
                    >
                      {link.label}
                    </a>
                    {/* Pulse logic removed as it's no longer used */}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact section */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-6">
              Contact Us
            </h4>
            <ul className="space-y-4">
              {contactInfo.map((item, i) => (
                <li key={i} className="flex items-center space-x-3">
                  {item.icon}
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-gray-500 hover:text-[#14b8a6] transition-colors"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-gray-500 hover:text-[#14b8a6] transition-colors">
                      {item.text}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0">
          {/* Social icons */}
          <div className="flex space-x-6 text-gray-400">
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#14b8a6] transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-center md:text-left text-gray-500">
            &copy; {new Date().getFullYear()} Khanect Ai. All rights reserved.
          </p>
        </div>

        <hr className="border-t border-gray-700 my-8" />
      </div>

      {/* Text hover effect */}
      <div className="flex lg:h-[30rem] h-48 lg:-mt-40 -mt-32 lg:-mb-36 -mb-10">
        <TextHoverEffect text="KHANECT" className="z-10" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}

export default Footer;
