import React from 'react';
import { Link } from 'react-router-dom';
import { Link as Ankh, Instagram, Facebook, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-egyptian-blue-900 text-egyptian-sand-50 pt-12 pb-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Ankh className="w-8 h-8 text-egyptian-gold-500" />
              <span className="text-xl font-serif font-bold text-egyptian-sand-50">
                Pyramid Perspective
              </span>
            </Link>
            <p className="text-egyptian-sand-200 mb-4">
              Explore the wonders of ancient Egypt through education and beautifully crafted designs inspired by a rich cultural heritage.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-egyptian-sand-200 hover:text-egyptian-gold-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-egyptian-sand-200 hover:text-egyptian-gold-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-egyptian-sand-200 hover:text-egyptian-gold-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-egyptian-sand-200 hover:text-egyptian-gold-500 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-serif font-bold mb-4 text-egyptian-sand-50">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-egyptian-sand-200 hover:text-egyptian-gold-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/knowledge-hub" className="text-egyptian-sand-200 hover:text-egyptian-gold-500 transition-colors">
                  Knowledge Hub
                </Link>
              </li>
              <li>
                <Link to="/discover-designs" className="text-egyptian-sand-200 hover:text-egyptian-gold-500 transition-colors">
                  Discover Designs
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-egyptian-sand-200 hover:text-egyptian-gold-500 transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-egyptian-sand-200 hover:text-egyptian-gold-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-egyptian-sand-200 hover:text-egyptian-gold-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-serif font-bold mb-4 text-egyptian-sand-50">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/knowledge-hub?category=mythology" className="text-egyptian-sand-200 hover:text-egyptian-gold-500 transition-colors">
                  Egyptian Mythology
                </Link>
              </li>
              <li>
                <Link to="/knowledge-hub?category=architecture" className="text-egyptian-sand-200 hover:text-egyptian-gold-500 transition-colors">
                  Architecture & Monuments
                </Link>
              </li>
              <li>
                <Link to="/knowledge-hub?category=art" className="text-egyptian-sand-200 hover:text-egyptian-gold-500 transition-colors">
                  Art & Symbolism
                </Link>
              </li>
              <li>
                <Link to="/knowledge-hub?category=daily-life" className="text-egyptian-sand-200 hover:text-egyptian-gold-500 transition-colors">
                  Daily Life
                </Link>
              </li>
              <li>
                <Link to="/knowledge-hub?category=pharaohs" className="text-egyptian-sand-200 hover:text-egyptian-gold-500 transition-colors">
                  Pharaohs & Rulers
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-serif font-bold mb-4 text-egyptian-sand-50">Subscribe</h3>
            <p className="text-egyptian-sand-200 mb-4">
              Stay updated with our latest articles and designs.
            </p>
            <form className="space-y-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full px-4 py-2 rounded-md bg-egyptian-blue-800 border border-egyptian-blue-700 text-egyptian-sand-50 placeholder-egyptian-sand-300 focus:outline-none focus:ring-2 focus:ring-egyptian-gold-500"
              />
              <button 
                type="submit" 
                className="w-full px-4 py-2 bg-egyptian-gold-500 text-egyptian-blue-900 rounded-md hover:bg-egyptian-gold-400 transition-colors font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="pt-8 border-t border-egyptian-blue-800 text-center">
          <p className="text-egyptian-sand-300 text-sm">
            &copy; {new Date().getFullYear()} Pyramid Perspective. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;