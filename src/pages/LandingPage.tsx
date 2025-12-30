import React from 'react';
import { Link } from 'react-router-dom';
import landingImage from '../assets/landing-hero.png';

const LandingPage = () => {
  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Hero Image Section */}
      <div className="w-full max-w-xs md:max-w-sm mb-4 md:mb-6">
        <img
          src={landingImage}
          alt="Grocery shopping illustration"
          className="w-full h-auto"
        />
      </div>

      {/* Content Section */}
      <div className="w-full max-w-md text-center space-y-3 md:space-y-4">
        {/* Headline */}
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 leading-tight">
          Create a Shopping List Right from Your Phone
        </h1>

        {/* Subheadline */}
        <p className="text-sm md:text-base text-gray-600">
          Now You Can Use Your Voice to Create a Shopping List
        </p>

        {/* CTA Button */}
        <div className="pt-2 md:pt-3">
          <Link
            to="/app"
            className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-yellow-400 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Start shopping"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 md:h-8 md:w-8 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
