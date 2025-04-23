import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Grid, List, ExternalLink } from 'lucide-react';
import { designData } from '../data/designData';

const DiscoverDesignsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const categories = [
    { id: 'all', name: 'All Designs' },
    { id: 'apparel', name: 'Apparel' },
    { id: 'homeDecor', name: 'Home Decor' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'wallArt', name: 'Wall Art' },
  ];
  
  const filteredDesigns = designData.filter(design => {
    const matchesSearch = design.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           design.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || design.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="pt-20">
      {/* Header Banner */}
      <div className="relative bg-egyptian-blue-900 text-white">
        <div 
          className="absolute inset-0 bg-center bg-cover opacity-20"
          style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/6469851/pexels-photo-6469851.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&crop=entropy')" 
          }}
        ></div>
        <div className="relative z-10 container-custom py-20 text-center">
          <h1 className="mb-4">Discover Egyptian-Inspired Designs</h1>
          <p className="text-egyptian-sand-200 text-lg max-w-2xl mx-auto">
            Browse our collection of designs inspired by ancient Egyptian art, symbols, and mythology.
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
                placeholder="Search designs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-md border border-egyptian-sand-300 focus:outline-none focus:ring-2 focus:ring-egyptian-blue-500"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
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
              
              <div className="flex border border-egyptian-blue-200 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid' 
                      ? 'bg-egyptian-blue-800 text-white' 
                      : 'bg-white text-egyptian-blue-800'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list' 
                      ? 'bg-egyptian-blue-800 text-white' 
                      : 'bg-white text-egyptian-blue-800'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Designs Grid/List */}
      <div className="bg-egyptian-sand-50 py-16">
        <div className="container-custom">
          {filteredDesigns.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl text-egyptian-blue-800 mb-2">No designs found</h3>
              <p className="text-egyptian-blue-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDesigns.map(design => (
                <div 
                  key={design.id} 
                  className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl group"
                >
                  <div className="relative overflow-hidden h-64">
                    <img 
                      src={design.image} 
                      alt={design.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-egyptian-blue-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <div className="flex space-x-2">
                        <Link 
                          to={`/shop/${design.id}`} 
                          className="bg-egyptian-gold-500 text-egyptian-blue-900 p-2 rounded-full hover:bg-egyptian-gold-400 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-egyptian-blue-600 mb-1">
                      {categories.find(cat => cat.id === design.category)?.name}
                    </div>
                    <h3 className="font-bold text-egyptian-blue-900">
                      {design.title}
                    </h3>
                    <p className="text-sm text-egyptian-blue-700 mt-2 line-clamp-2">
                      {design.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-6">
              {filteredDesigns.map(design => (
                <div 
                  key={design.id} 
                  className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                      <img 
                        src={design.image} 
                        alt={design.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="text-sm text-egyptian-blue-600 mb-1">
                        {categories.find(cat => cat.id === design.category)?.name}
                      </div>
                      <h3 className="text-xl font-bold text-egyptian-blue-900 mb-2">
                        {design.title}
                      </h3>
                      <p className="text-egyptian-blue-700 mb-4">
                        {design.description}
                      </p>
                      <div className="flex space-x-3">
                        <Link 
                          to={`/shop/${design.id}`}
                          className="btn-primary"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscoverDesignsPage;