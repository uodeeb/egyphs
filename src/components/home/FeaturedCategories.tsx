import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  title: string;
  image: string;
  link: string;
  count: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, image, link, count }) => {
  return (
    <Link 
      to={link} 
      className="group relative overflow-hidden rounded-xl aspect-square block"
    >
      <img 
        src={image} 
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-egyptian-blue-900/90 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-6 w-full">
        <h3 className="text-xl text-white font-bold mb-1">{title}</h3>
        <span className="text-egyptian-sand-200 text-sm">{count} Articles</span>
      </div>
    </Link>
  );
};

const FeaturedCategories: React.FC = () => {
  return (
    <section className="py-20 bg-egyptian-sand-100">
      <div className="container-custom">
        <h2 className="section-heading text-egyptian-blue-900">
          Explore Knowledge Categories
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          <CategoryCard 
            title="Mythology"
            image="https://images.pexels.com/photos/8045968/pexels-photo-8045968.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&crop=entropy"
            link="/knowledge-hub?category=mythology"
            count={12}
          />
          
          <CategoryCard 
            title="Architecture"
            image="https://images.pexels.com/photos/3254729/pexels-photo-3254729.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&crop=entropy"
            link="/knowledge-hub?category=architecture"
            count={8}
          />
          
          <CategoryCard 
            title="Art & Symbols"
            image="https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&crop=entropy"
            link="/knowledge-hub?category=art"
            count={15}
          />
          
          <CategoryCard 
            title="Daily Life"
            image="https://images.pexels.com/photos/9482114/pexels-photo-9482114.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&crop=entropy"
            link="/knowledge-hub?category=daily-life"
            count={7}
          />
          
          <CategoryCard 
            title="Pharaohs"
            image="https://images.pexels.com/photos/9482119/pexels-photo-9482119.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&crop=entropy"
            link="/knowledge-hub?category=pharaohs"
            count={9}
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;