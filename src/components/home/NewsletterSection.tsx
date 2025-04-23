import React from 'react';

const NewsletterSection: React.FC = () => {
  return (
    <section className="py-20 bg-egyptian-blue-800 text-white">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-egyptian-sand-200 mb-8 text-lg">
            Stay updated with our latest articles, design releases, and exclusive offers. Join our community of ancient Egypt enthusiasts.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 px-4 py-3 rounded-md bg-egyptian-blue-700 border border-egyptian-blue-600 text-white placeholder-egyptian-sand-300 focus:outline-none focus:ring-2 focus:ring-egyptian-gold-500"
              required
            />
            <button 
              type="submit" 
              className="px-6 py-3 bg-egyptian-gold-500 text-egyptian-blue-900 rounded-md hover:bg-egyptian-gold-400 transition-colors font-medium whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
          
          <p className="text-egyptian-sand-300 text-sm mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;