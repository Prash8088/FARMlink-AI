import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Target, Shield, HeartHandshake, Award, Users, ChevronRight } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
          <span>Our Agricultural Mission</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Transforming India's Agricultural Supply Chain Through Technology
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          FARMlink AI was conceived to solve a critical structural imbalance in agriculture: while farmers take on all production risks, an opaque network of intermediaries captures up to 40% of the final retail consumer price.
        </p>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Our Core Mission</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            To provide every farmer with direct, unmediated market access to certified commercial buyers and registered logistics providers, backed by AI-powered pricing intelligence and end-to-end transparent settlement.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Our Architectural Vision</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            To build India's premier digital agricultural operating system where crop discovery, buyer contracting, multimodal transport dispatch, and farmer profit optimization happen seamlessly through intelligent software.
          </p>
        </div>
      </div>

      {/* Four Core Values */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Our Guiding Values</h2>
          <p className="text-xs text-slate-500 mt-1">Foundational principles that guide every feature we ship.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <HeartHandshake className="w-8 h-8 text-emerald-600 mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">Farmer-First Alignment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every tool, calculation, and UI layout is created to enhance the farmer's net profit margin and dignity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <Award className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">Absolute Transparency</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No hidden broker fees or fake transaction telemetry. We display real database figures and genuine market data.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <Users className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">Ecosystem Synergy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A marketplace succeeds only when farmers get fair value, buyers secure quality, and transporters earn reliable freight.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-emerald-600 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to Join the Agricultural Revolution?</h2>
        <p className="text-emerald-100 text-sm max-w-xl mx-auto">
          Start today by creating your free account as a Farmer, Buyer, or Transporter on FARMlink AI.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3 bg-white text-emerald-800 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors shadow-md"
          >
            Create Your Account
          </Link>
          <Link
            to="/features"
            className="px-6 py-3 bg-emerald-700 text-white rounded-xl font-bold text-sm hover:bg-emerald-800 transition-colors border border-emerald-500"
          >
            Explore Feature Roadmap
          </Link>
        </div>
      </div>
    </div>
  );
};
