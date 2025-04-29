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
              scrolled ? 'w-30 h-12' : 'w-40 h-16'
            }`}>
              <img 
                src="/new-egyphs-logo01.png" 
                alt="Egyphs Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link text-[#f5951c] hover:text-[#f5951c]/80"
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/knowledge-hub" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link text-[#f5951c] hover:text-[#f5951c]/80"
              }
            >
              Knowledge Hub
            </NavLink>
            <NavLink 
              to="/discover-designs" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link text-[#f5951c] hover:text-[#f5951c]/80"
              }
            >
              Discover Designs
            </NavLink>
            <NavLink 
              to="/shop" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link text-[#f5951c] hover:text-[#f5951c]/80"
              }
            >
              Shop
            </NavLink>
            <NavLink 
              to="/custom-creations" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link text-[#f5951c] hover:text-[#f5951c]/80"
              }
            >
              Custom Creations
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link text-[#f5951c] hover:text-[#f5951c]/80"
              }
            >
              About
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => 
                isActive ? "navbar-link navbar-link-active" : "navbar-link text-[#f5951c] hover:text-[#f5951c]/80"
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
              <X className="w-6 h-6 text-[#f5951c]" />
            ) : (
              <Menu className="w-6 h-6 text-[#f5951c]" />
            )}
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pt-4 pb-4">
            <div className="backdrop-blur-md bg-[#1a1a1a]/95 rounded-lg p-4 shadow-xl">
              <div className="flex flex-col space-y-4">
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    isActive ? "navbar-link navbar-link-active" : "navbar-link text-[#f5951c] hover:text-[#f5951c]/80"
                  }
                  onClick={closeMenu}
                >
                  Home
                </NavLink>
                <NavLink 
                  to="/knowledge-hub" 
                  className={({ isActive }) => 
                    isActive ? "navbar-link navbar-link-active" : "navbar-link text-[#f5951c] hover:text-[#f5951c]/80"
                  }
                  onClick={closeMenu}
                >
                  Knowledge Hub
                </NavLink>
                <NavLink 
                  to="/discover-designs" 
                  className={({ isActive }) => 
                    isActive ? "navbar-link navbar-link-active" : "navbar-link text-[#f5951c] hover:text-[#f5951c]/80"
                  }
                  onClick={closeMenu}
                >
                  Discover Designs
                </NavLink>
                <NavLink 
                  to="/shop" 
                  className={({ isActive }) => 
                    isActive ? "navbar-link navbar-link-active" : "navbar-link text-[#f5951c] hover:text-[#f5951c]/80"
                  }
                  onClick={closeMenu}
                >
                  Shop
                </NavLink>
                <NavLink 
                  to="/custom-creations" 
                  className={({ isActive }) => 
                    isActive ? "navbar-link navbar-link-active" : "navbar-link text-[#f5951c] hover:text-[#f5951c]/80"
                  }
                  onClick={closeMenu}
                >
                  Custom Creations
                </NavLink>
                <NavLink 
                  to="/about" 
                  className={({ isActive }) => 
                    isActive ? "navbar-link navbar-link-active" : "navbar-link text-[#f5951c] hover:text-[#f5951c]/80"
                  }
                  onClick={closeMenu}
                >
                  About
                </NavLink>
                <NavLink 
                  to="/contact" 
                  className={({ isActive }) => 
                    isActive ? "navbar-link navbar-link-active" : "navbar-link text-[#f5951c] hover:text-[#f5951c]/80"
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