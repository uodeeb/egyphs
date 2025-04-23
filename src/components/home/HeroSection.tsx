import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-egyptian-blue-900 overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-center bg-cover opacity-20"
        style={{ 
          backgroundImage: "url('https://images.pexels.com/photos/3879071/pexels-photo-3879071.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&crop=entropy')" 
        }}
      ></div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-egyptian-blue-900 via-egyptian-blue-900/90 to-egyptian-blue-900/80"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-egyptian-gold-500 via-egyptian-terracotta-500 to-egyptian-gold-500"></div>
      
      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-12 lg:mb-0">
            <h1 className="text-egyptian-sand-50 mb-6 leading-tight">
              Discover the <span className="text-egyptian-gold-500">Wonders</span> of Ancient Egypt
            </h1>
            <p className="text-egyptian-sand-200 text-lg mb-8 max-w-xl">
              Explore the rich heritage of Egyptian civilization through immersive education and beautifully crafted designs inspired by pharaohs, pyramids, and ancient gods.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/knowledge-hub" className="btn-primary">
                Explore Knowledge Hub
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/discover-designs" className="btn-outline border-egyptian-gold-500 text-egyptian-gold-500 hover:bg-egyptian-gold-500/10">
                Browse Designs
              </Link>
            </div>
          </div>
          
          <div className="lg:w-1/2 flex justify-center">
            <img 
              src="https://images.pexels.com/photos/6469845/pexels-photo-6469845.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&crop=entropy"
              alt="Ancient Egyptian Hieroglyphics" 
              className="rounded-lg shadow-2xl max-w-full h-auto border-4 border-egyptian-gold-500/30"
              style={{ maxHeight: '70vh' }}
            />
          </div>
        </div>
      </div>
      
      {/* Bottom Decorative Wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M0 0L60 10C120 20 240 40 360 35C480 30 600 0 720 0C840 0 960 30 1080 40C1200 50 1320 40 1380 35L1440 30V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" 
            fill="#FCF9F5"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;