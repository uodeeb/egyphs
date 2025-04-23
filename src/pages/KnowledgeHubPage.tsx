import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Clock } from 'lucide-react';
import { articleData } from '../data/articleData';

const KnowledgeHubPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(categoryParam || 'all');
  
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);
  
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'mythology', name: 'Mythology' },
    { id: 'architecture', name: 'Architecture' },
    { id: 'art', name: 'Art & Symbols' },
    { id: 'daily-life', name: 'Daily Life' },
    { id: 'pharaohs', name: 'Pharaohs' },
  ];
  
  const filteredArticles = articleData.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="pt-20">
      {/* Header Banner */}
      <div className="relative bg-egyptian-blue-900 text-white">
        <div 
          className="absolute inset-0 bg-center bg-cover opacity-20"
          style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&crop=entropy')" 
          }}
        ></div>
        <div className="relative z-10 container-custom py-20 text-center">
          <h1 className="mb-4">Knowledge Hub</h1>
          <p className="text-egyptian-sand-200 text-lg max-w-2xl mx-auto">
            Explore our collection of articles about ancient Egyptian history, mythology, art, and culture.
          </p>
        </div>
      </div>
      
      {/* Search and Filter Section */}
      <div className="bg-egyptian-sand-100 py-8 border-b border-egyptian-sand-200">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-egyptian-blue-400" />
              </div>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-md border border-egyptian-sand-300 focus:outline-none focus:ring-2 focus:ring-egyptian-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <Filter className="w-5 h-5 text-egyptian-blue-800 mr-1" />
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                    activeCategory === category.id 
                      ? 'bg-egyptian-blue-800 text-white' 
                      : 'bg-white text-egyptian-blue-800 hover:bg-egyptian-sand-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Articles Grid */}
      <div className="bg-egyptian-sand-50 py-16">
        <div className="container-custom">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl text-egyptian-blue-800 mb-2">No articles found</h3>
              <p className="text-egyptian-blue-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map(article => (
                <Link 
                  key={article.id} 
                  to={`/knowledge-hub/${article.slug}`}
                  className="group"
                >
                  <article className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-0 right-0 bg-egyptian-blue-800 text-white text-xs font-medium px-3 py-1">
                        {categories.find(cat => cat.id === article.category)?.name}
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h2 className="text-xl font-bold text-egyptian-blue-900 mb-3 group-hover:text-egyptian-blue-600 transition-colors">
                        {article.title}
                      </h2>
                      <p className="text-egyptian-blue-700 mb-4 flex-1">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center text-egyptian-blue-500 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{article.readTime} min read</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeHubPage;