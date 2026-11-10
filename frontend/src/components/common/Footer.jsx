import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, Heart, MapPin, Mail, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
                <Sprout className="w-5 h-5 text-slate-950" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">FARM<span className="text-emerald-400">link</span> AI</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering farmers across India with direct market access, AI-guided pricing transparency, and verified logistics partners.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Version 1.0.0 Production Foundation</span>
            </div>
          </div>

          {/* User Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">User Roles</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/register?role=farmer" className="hover:text-emerald-400 transition-colors">
                  Farmer Portal Registration
                </Link>
              </li>
              <li>
                <Link to="/register?role=buyer" className="hover:text-emerald-400 transition-colors">
                  Wholesale Buyer Access
                </Link>
              </li>
              <li>
                <Link to="/register?role=transporter" className="hover:text-emerald-400 transition-colors">
                  Transporter & Logistics Fleet
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Unified Account Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">
                  About FARMlink AI
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-emerald-400 transition-colors">
                  Architecture & Feature Roadmap
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  AI Price Forecasting (V2)
                </span>
              </li>
              <li>
                <span className="text-slate-500 cursor-not-allowed">
                  Smart Buyer Matchmaker (V3)
                </span>
              </li>
            </ul>
          </div>

          {/* Direct Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Support & Contact</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>support@farmlink.ai</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>+91 1800-FARM-LINK (Toll Free)</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>AgroTech Center, Bengaluru Urban, Karnataka, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FARMlink AI. Built with precision for sustainable Indian agriculture.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Farmers & Agri Innovators</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
