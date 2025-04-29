import React from 'react';
import { Link } from 'react-router-dom';
import type { ArticleCategory } from '../../types/article';

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
  const categories: Array<{
    id: ArticleCategory;
    title: string;
    image: string;
    count: number;
  }> = [
    {
      id: 'gods-myths-afterlife',
      title: 'Gods, Myths & Afterlife',
      image: '/images/articles00/egyptian-pantheon.png',
      count: 12
    },
    {
      id: 'pharaohs',
      title: 'Pharaohs',
      image: '/images/articles00/tutankhamun-treasures.png',
      count: 8
    },
    {
      id: 'everyday-life',
      title: 'Everyday Life',
      image: '/images/articles00/mummification.jpg',
      count: 7
    },
    {
      id: 'engineering-marvels',
      title: 'Engineering Marvels',
      image: '/images/articles00/pyramids-giza.jpg',
      count: 9
    },
    {
      id: 'hieroglyphs-art-innovation',
      title: 'Hieroglyphs & Art',
      image: '/images/articles00/rosetta-stone.jpg',
      count: 10
    }
  ];

  return (
    <section className="py-20 bg-egyptian-sand-100">
      <div className="container-custom">
        <h2 className="section-heading text-egyptian-blue-900">
          Explore Knowledge Categories
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categories.map(category => (
            <CategoryCard 
              key={category.id}
              title={category.title}
              image={category.image}
              link={`/knowledge-hub?category=${category.id}`}
              count={category.count}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;