import React from 'react';
import HeroSection from '../components/home/HeroSection';
import BentoGridSection from '../components/home/BentoGridSection';
import FeaturedCategories from '../components/home/FeaturedCategories';
import NewsletterSection from '../components/home/NewsletterSection';

const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <BentoGridSection />
      <FeaturedCategories />
      <NewsletterSection />
    </>
  );
};

export default HomePage;