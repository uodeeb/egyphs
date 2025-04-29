import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, PaintBucket, History, Palette } from 'lucide-react';

interface BentoItemProps {
  title: string;
  description: string;
  image: string;
  link: string;
  linkText: string;
  size?: 'large' | 'normal';
  icon?: React.ReactNode;
  color?: string;
}

const BentoItem: React.FC<BentoItemProps> = ({ 
  title, 
  description, 
  image, 
  link, 
  linkText, 
  size = 'normal',
  icon,
  color = 'bg-egyptian-blue-800'
}) => {
  return (
    <div className={`bento-item group ${size === 'large' ? 'bento-item-large' : ''} ${color}`}>
      <div className="relative overflow-hidden h-full">
        <img 
          src={image} 
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40"
        />
        <div className="bento-item-content relative z-10 h-full flex flex-col justify-between text-white">
          <div>
            {icon && <div className="mb-4 text-egyptian-gold-500">{icon}</div>}
            <h3 className="text-xl md:text-2xl font-bold mb-3">{title}</h3>
            <p className="mb-6 opacity-80">{description}</p>
          </div>
          <Link 
            to={link} 
            className="inline-flex items-center font-medium text-egyptian-gold-400 hover:text-egyptian-gold-300 transition-colors"
          >
            {linkText}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

const BentoGridSection: React.FC = () => {
  return (
    <section className="py-20 bg-egyptian-sand-50">
      <div className="container-custom">
        <h2 className="section-heading text-egyptian-blue-900">
          Explore Our Featured Content
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {/* Large Feature Item */}
          <div className="md:col-span-4">
            <BentoItem
              title="The Legacy of King Tutankhamun"
              description="Discover the fascinating story of the boy king, his mysterious death, and the extraordinary treasures found in his tomb."
              image="/images/articles00/tutankhamun-treasures.png"
              link="/knowledge-hub/tutankhamun-legacy"
              linkText="Read Article"
              size="large"
              icon={<History className="w-8 h-8" />}
              color="bg-egyptian-blue-900"
            />
          </div>
          
          {/* Regular Items */}
          <div className="md:col-span-2">
            <BentoItem
              title="Egyptian Gods & Goddesses"
              description="Explore the pantheon of ancient Egyptian deities."
              image="/images/articles00/egyptian-pantheon.png"
              link="/knowledge-hub/egyptian-gods"
              linkText="Explore"
              icon={<BookOpen className="w-7 h-7" />}
              color="bg-egyptian-terracotta-600"
            />
          </div>
          
          <div className="md:col-span-3">
            <BentoItem
              title="Hieroglyphic Writing System"
              description="Learn about the ancient Egyptian writing system and its decipherment."
              image="/images/banners/hieroglyphs-wall.png"
              link="/knowledge-hub/hieroglyphics"
              linkText="Discover"
              icon={<Palette className="w-7 h-7" />}
              color="bg-egyptian-blue-800"
            />
          </div>
          
          <div className="md:col-span-3">
            <BentoItem
              title="Pharaonic Art Collection"
              description="Beautiful designs inspired by ancient Egyptian art and symbolism."
              image="/images/custom/Design02.png"
              link="/discover-designs/pharaonic-art"
              linkText="View Collection"
              icon={<PaintBucket className="w-7 h-7" />}
              color="bg-egyptian-blue-700"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoGridSection;