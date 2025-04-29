import * as React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock, User } from 'lucide-react';
import { articleData } from '../data/articleData';
import type { Article, ArticleCategory } from '../types/article';

interface CategoryInfo {
  id: ArticleCategory;
  name: string;
  description: string;
  articles: Article[];
}

const categories: Array<Omit<CategoryInfo, 'articles'>> = [
  {
    id: 'gods-myths-afterlife',
    name: 'Gods, Myths & Afterlife',
    description: 'Explore the rich pantheon of Egyptian deities and their fascinating myths about creation, life, and the afterlife.'
  },
  {
    id: 'pharaohs',
    name: 'Pharaohs',
    description: 'Discover the rulers of ancient Egypt, from the builders of pyramids to the last of the ptolemaic dynasty.'
  },
  {
    id: 'everyday-life',
    name: 'Everyday Life',
    description: 'Step into the daily lives of ancient Egyptians, from common workers to skilled artisans and scribes.'
  },
  {
    id: 'engineering-marvels',
    name: 'Engineering Marvels',
    description: 'Uncover the architectural and engineering achievements that still amaze us thousands of years later.'
  },
  {
    id: 'hieroglyphs-art-innovation',
    name: 'Hieroglyphs, Art & Innovation',
    description: 'Learn about the artistic and technological innovations that shaped ancient Egyptian civilization.'
  }
];

export default function ArticleCategoriesPage(): React.ReactElement {
  const articlesByCategory: CategoryInfo[] = categories.map(category => ({
    ...category,
    articles: articleData.filter(article => article.category === category.id)
  }));

  return (
    <div className="pt-20">
      {/* Header Banner */}
      <div className="relative bg-egyptian-blue-900 text-white">
        <div 
          className="absolute inset-0 bg-center bg-cover opacity-20"
          style={{ 
            backgroundImage: "url('/images/banners/hieroglyphs-wall.png')" 
          }}
        />
        <div className="relative z-10 container-custom py-20 text-center">
          <h1 className="mb-4">Article Categories</h1>
          <p className="text-egyptian-sand-200 text-lg max-w-2xl mx-auto">
            Browse our comprehensive collection of articles about ancient Egyptian history, culture, and achievements.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="bg-egyptian-sand-50 py-16">
        <div className="container-custom">
          {articlesByCategory.map(category => (
            <div key={category.id} className="mb-16 last:mb-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-egyptian-blue-900 mb-2">
                    {category.name}
                  </h2>
                  <p className="text-egyptian-blue-700 max-w-2xl">
                    {category.description}
                  </p>
                </div>
                <Link 
                  to={`/knowledge-hub?category=${category.id}`}
                  className="inline-flex items-center text-egyptian-blue-800 hover:text-egyptian-blue-600 mt-4 md:mt-0"
                >
                  View All Articles
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.articles.slice(0, 3).map(article => (
                  <Link 
                    key={article.id}
                    to={`/knowledge-hub/${article.slug}`}
                    className="group"
                  >
                    <article className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={article.mainImage.url}
                          alt={article.mainImage.alt}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-egyptian-blue-900 mb-3 group-hover:text-egyptian-blue-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-egyptian-blue-700 mb-4 flex-1">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-egyptian-blue-500 text-sm">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{article.readTime} min read</span>
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            <span>{article.author.name}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}