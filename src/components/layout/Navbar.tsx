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
        scrolled ? 'bg-egyptian-sand-50 shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container-custom">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center space-x-2"
            onClick={closeMenu}
          >
            <div className={`transition-all duration-300 ${
              scrolled ? 'w-32 h-12' : 'w-40 h-14'
            }`}>
              <img 
                src="/egyphs-logo.jpg" 
                alt="Egyphs Logo" 
                className="w-full h-full object-contain filter contrast-125"
              />
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link"
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/knowledge-hub" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link"
              }
            >
              Knowledge Hub
            </NavLink>
            <NavLink 
              to="/discover-designs" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link"
              }
            >
              Discover Designs
            </NavLink>
            <NavLink 
              to="/shop" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link"
              }
            >
              Shop
            </NavLink>
            <NavLink 
              to="/custom-creations" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link"
              }
            >
              Custom Creations
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link"
              }
            >
              About
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link"
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
              <X className="w-6 h-6 text-egyptian-blue-800" />
            ) : (
              <Menu className="w-6 h-6 text-egyptian-blue-800" />
            )}
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pt-4 pb-4 border-t border-egyptian-blue-100">
            <div className="flex flex-col space-y-4">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  isActive ? "navbar-link navbar-link-active" : "navbar-link"
                }
                onClick={closeMenu}
              >
                Home
              </NavLink>
              <NavLink 
                to="/knowledge-hub" 
                className={({ isActive }) => 
                  isActive ? "navbar-link navbar-link-active" : "navbar-link"
                }
                onClick={closeMenu}
              >
                Knowledge Hub
              </NavLink>
              <NavLink 
                to="/discover-designs" 
                className={({ isActive }) => 
                  isActive ? "navbar-link navbar-link-active" : "navbar-link"
                }
                onClick={closeMenu}
              >
                Discover Designs
              </NavLink>
              <NavLink 
                to="/shop" 
                className={({ isActive }) => 
                  isActive ? "navbar-link navbar-link-active" : "navbar-link"
                }
                onClick={closeMenu}
              >
                Shop
              </NavLink>
              <NavLink 
                to="/custom-creations" 
                className={({ isActive }) => 
                  isActive ? "navbar-link navbar-link-active" : "navbar-link"
                }
                onClick={closeMenu}
              >
                Custom Creations
              </NavLink>
              <NavLink 
                to="/about" 
                className={({ isActive }) => 
                  isActive ? "navbar-link navbar-link-active" : "navbar-link"
                }
                onClick={closeMenu}
              >
                About
              </NavLink>
              <NavLink 
                to="/contact" 
                className={({ isActive }) => 
                  isActive ? "navbar-link navbar-link-active" : "navbar-link"
                }
                onClick={closeMenu}
              >
                Contact
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;