import React from 'react';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <div className="pt-20">
      {/* Header Banner */}
      <div className="bg-egyptian-blue-800 text-white">
        <div className="container-custom py-16 text-center">
          <h1 className="mb-4">Contact Us</h1>
          <p className="text-egyptian-sand-200 text-lg max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you. Reach out to our team using the contact information below.
          </p>
        </div>
      </div>
      
      {/* Contact Information and Form */}
      <div className="bg-egyptian-sand-50 py-16">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/3">
              <h2 className="text-2xl font-bold text-egyptian-blue-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-egyptian-blue-100 p-3 rounded-full text-egyptian-blue-800">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-egyptian-blue-900 mb-1">Email Us</h3>
                    <p className="text-egyptian-blue-700">
                      <a 
                        href="mailto:info@egyphs.com" 
                        className="hover:text-egyptian-blue-600 transition-colors"
                      >
                        info@egyphs.com
                      </a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-egyptian-blue-100 p-3 rounded-full text-egyptian-blue-800">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-egyptian-blue-900 mb-1">Call Us</h3>
                    <p className="text-egyptian-blue-700">
                      <a 
                        href="tel:+1-555-123-4567" 
                        className="hover:text-egyptian-blue-600 transition-colors"
                      >
                        +1 (555) 123-4567
                      </a>
                    </p>
                    <p className="text-sm text-egyptian-blue-600 mt-1">
                      Monday-Friday, 9am-5pm EST
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-egyptian-blue-100 p-3 rounded-full text-egyptian-blue-800">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-egyptian-blue-900 mb-1">Visit Us</h3>
                    <p className="text-egyptian-blue-700">
                      123 History Lane<br />
                      Alexandria, VA 22314<br />
                      United States
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-egyptian-blue-100 p-3 rounded-full text-egyptian-blue-800">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-egyptian-blue-900 mb-1">Social Media</h3>
                    <div className="flex space-x-3 mt-2">
                      <a 
                        href="#" 
                        className="bg-egyptian-blue-800 text-white p-2 rounded-full hover:bg-egyptian-blue-700 transition-colors"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="w-5 h-5" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                        </svg>
                      </a>
                      <a 
                        href="#" 
                        className="bg-egyptian-blue-800 text-white p-2 rounded-full hover:bg-egyptian-blue-700 transition-colors"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="w-5 h-5" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                      <a 
                        href="#" 
                        className="bg-egyptian-blue-800 text-white p-2 rounded-full hover:bg-egyptian-blue-700 transition-colors"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="w-5 h-5" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-2/3">
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-egyptian-blue-900 mb-6">Send Us a Message</h2>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label 
                        htmlFor="name" 
                        className="block text-sm font-medium text-egyptian-blue-800 mb-2"
                      >
                        Your Name
                      </label>
                      <input 
                        type="text" 
                        id="name" 
                        className="w-full px-4 py-3 rounded-md border border-egyptian-sand-300 focus:outline-none focus:ring-2 focus:ring-egyptian-blue-500 text-egyptian-blue-800 placeholder-egyptian-blue-400"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div>
                      <label 
                        htmlFor="email" 
                        className="block text-sm font-medium text-egyptian-blue-800 mb-2"
                      >
                        Your Email
                      </label>
                      <input 
                        type="email" 
                        id="email" 
                        className="w-full px-4 py-3 rounded-md border border-egyptian-sand-300 focus:outline-none focus:ring-2 focus:ring-egyptian-blue-500 text-egyptian-blue-800 placeholder-egyptian-blue-400"
                        placeholder="john.doe@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="subject" 
                      className="block text-sm font-medium text-egyptian-blue-800 mb-2"
                    >
                      Subject
                    </label>
                    <input 
                      type="text" 
                      id="subject" 
                      className="w-full px-4 py-3 rounded-md border border-egyptian-sand-300 focus:outline-none focus:ring-2 focus:ring-egyptian-blue-500 text-egyptian-blue-800 placeholder-egyptian-blue-400"
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                  
                  <div>
                    <label 
                      htmlFor="message" 
                      className="block text-sm font-medium text-egyptian-blue-800 mb-2"
                    >
                      Your Message
                    </label>
                    <textarea 
                      id="message" 
                      rows={6} 
                      className="w-full px-4 py-3 rounded-md border border-egyptian-sand-300 focus:outline-none focus:ring-2 focus:ring-egyptian-blue-500 text-egyptian-blue-800 placeholder-egyptian-blue-400"
                      placeholder="Please provide details about your inquiry..."
                      required
                    ></textarea>
                  </div>
                  
                  <div>
                    <button 
                      type="submit" 
                      className="btn-primary"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="bg-egyptian-sand-100 py-16">
        <div className="container-custom">
          <h2 className="section-heading text-egyptian-blue-900">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-egyptian-blue-900 mb-3">What is your shipping policy?</h3>
              <p className="text-egyptian-blue-700">
                We offer free shipping on all orders over $50 within the United States. International shipping rates vary by country. Most orders ship within 2-3 business days.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-egyptian-blue-900 mb-3">Do you offer returns?</h3>
              <p className="text-egyptian-blue-700">
                Yes, we offer a 30-day return policy for most items. Products must be returned in their original condition and packaging. Custom items are not eligible for returns.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-egyptian-blue-900 mb-3">How can I track my order?</h3>
              <p className="text-egyptian-blue-700">
                Once your order ships, you'll receive a confirmation email with tracking information. You can also view your order status in your account dashboard.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold text-egyptian-blue-900 mb-3">Can I customize my product?</h3>
              <p className="text-egyptian-blue-700">
                Yes, many of our products can be customized. Visit our Custom Creations page to explore personalization options for apparel, decor, and accessories.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;