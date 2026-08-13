import { useState, useEffect } from 'react';

const SecurityCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "Zero Guesswork. Zero Liability.",
      subtitle: "The Sovereign Vetting Stand",
      description: "FRSC license verification, NIN biometric validation, and triple-layer guarantor sign-offs ensure every driver is thoroughly vetted before they ever get behind the wheel.",
      icon: "🛡️"
    },
    {
      title: "Your Private Fleet, On-Demand.",
      subtitle: "Flexible Elite Deployment",
      description: "Personal driving, corporate fleets, armed/unarmed security escorts, daily contracts, or hourly runs - deploy exactly what you need, when you need it.",
      icon: "🚗"
    },
    {
      title: "You Propose the Budget. They Accept.",
      subtitle: "Price Direct Sovereignty",
      description: "Employers dictate pricing terms directly to drivers with no third-party matching markups. Transparent, fair, and entirely under your control.",
      icon: "💰"
    },
    {
      title: "Real-Time Tracking. Zero Blindspots.",
      subtitle: "Absolute Telematics Security",
      description: "Live location streaming with GPS blackout watchdogs ensures complete visibility of your assets and employees from dispatch to drop-off.",
      icon: "📍"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-8 max-w-4xl mx-auto">
              <div className="text-8xl mb-6 animate-pulse">{slide.icon}</div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                {slide.title}
              </h1>
              <h2 className="text-2xl md:text-3xl text-green-400 font-semibold mb-6">
                {slide.subtitle}
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {slide.description}
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg">
                Get Started Securely
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-green-500 w-8' : 'bg-gray-500'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => goToSlide((currentSlide - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => goToSlide((currentSlide + 1) % slides.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default SecurityCarousel;
