import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const closeMenu = () => {
    setIsOpen(false);
  };
  
  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'nav-scrolled shadow-lg' : 'nav-transparent'
      }`}
    >
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center space-x-2"
            onClick={closeMenu}
          >
            <div className={`transition-all duration-300 ${
              scrolled ? 'w-48 h-16' : 'w-56 h-20'
            }`}>
              <img 
                src="/egyphs-logo.png" 
                alt="Egyphs Logo" 
                className="w-full h-full object-contain brightness-0 invert"
              />
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link text-egyptian-sand-50 hover:text-egyptian-gold-400"
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/knowledge-hub" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link text-egyptian-sand-50 hover:text-egyptian-gold-400"
              }
            >
              Knowledge Hub
            </NavLink>
            <NavLink 
              to="/discover-designs" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link text-egyptian-sand-50 hover:text-egyptian-gold-400"
              }
            >
              Discover Designs
            </NavLink>
            <NavLink 
              to="/shop" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link text-egyptian-sand-50 hover:text-egyptian-gold-400"
              }
            >
              Shop
            </NavLink>
            <NavLink 
              to="/custom-creations" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link text-egyptian-sand-50 hover:text-egyptian-gold-400"
              }
            >
              Custom Creations
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link text-egyptian-sand-50 hover:text-egyptian-gold-400"
              }
            >
              About
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link text-egyptian-sand-50 hover:text-egyptian-gold-400"
              }
            >
              Contact
            </NavLink>
          </div>
          
          {/* Mobile Navigation Toggle */}
          <button 
            className="md:hidden p-2 rounded-md focus:outline-none"
            onClick={toggleMenu}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-egyptian-sand-50" />
            ) : (
              <Menu className="w-6 h-6 text-egyptian-sand-50" />
            )}
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pt-4 pb-4">
            <div className="backdrop-blur-md bg-egyptian-blue-900/95 rounded-lg p-4 shadow-xl">
              <div className="flex flex-col space-y-4">
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    isActive ? "navbar-link navbar-link-active" : "navbar-link text-egyptian-sand-50 hover:text-egyptian-gold-400"
                  }
                  onClick={closeMenu}
                >
                  Home
                </NavLink>
                <NavLink 
                  to="/knowledge-hub" 
                  className={({ isActive }) => 
                    isActive ? "navbar-link navbar-link-active" : "navbar-link text-egyptian-sand-50 hover:text-egyptian-gold-400"
                  }
                  onClick={closeMenu}
                >
                  Knowledge Hub
                </NavLink>
                <NavLink 
                  to="/discover-designs" 
                  className={({ isActive }) => 
                    isActive ? "navbar-link navbar-link-active" : "navbar-link text-egyptian-sand-50 hover:text-egyptian-gold-400"
                  }
                  onClick={closeMenu}
                >
                  Discover Designs
                </NavLink>
                <NavLink 
                  to="/shop" 
                  className={({ isActive }) => 
                    isActive ? "navbar-link navbar-link-active" : "navbar-link text-egyptian-sand-50 hover:text-egyptian-gold-400"
                  }
                  onClick={closeMenu}
                >
                  Shop
                </NavLink>
                <NavLink 
                  to="/custom-creations" 
                  className={({ isActive }) => 
                    isActive ? "navbar-link navbar-link-active" : "navbar-link text-egyptian-sand-50 hover:text-egyptian-gold-400"
                  }
                  onClick={closeMenu}
                >
                  Custom Creations
                </NavLink>
                <NavLink 
                  to="/about" 
                  className={({ isActive }) => 
                    isActive ? "navbar-link navbar-link-active" : "navbar-link text-egyptian-sand-50 hover:text-egyptian-gold-400"
                  }
                  onClick={closeMenu}
                >
                  About
                </NavLink>
                <NavLink 
                  to="/contact" 
                  className={({ isActive }) => 
                    isActive ? "navbar-link navbar-link-active" : "navbar-link text-egyptian-sand-50 hover:text-egyptian-gold-400"
                  }
                  onClick={closeMenu}
                >
                  Contact
                </NavLink>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;