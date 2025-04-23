import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Heart } from 'lucide-react';
import { productData } from '../data/productData';

const ShopPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'apparel', name: 'Apparel' },
    { id: 'homeDecor', name: 'Home Decor' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'wallArt', name: 'Wall Art' },
  ];
  
  const filteredProducts = productData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="pt-20">
      {/* Header Banner */}
      <div className="bg-egyptian-blue-800 text-white">
        <div className="container-custom py-16 text-center">
          <h1 className="mb-4">Shop Our Egyptian-Inspired Products</h1>
          <p className="text-egyptian-sand-200 text-lg max-w-2xl mx-auto">
            Discover our unique collection of products featuring designs inspired by ancient Egyptian art and culture.
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
                placeholder="Search products..."
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
      
      {/* Products Grid */}
      <div className="bg-egyptian-sand-50 py-16">
        <div className="container-custom">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl text-egyptian-blue-800 mb-2">No products found</h3>
              <p className="text-egyptian-blue-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl group"
                >
                  <Link to={`/shop/${product.id}`} className="block relative overflow-hidden h-64">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {product.onSale && (
                      <div className="absolute top-0 left-0 bg-egyptian-terracotta-500 text-white text-xs font-medium px-3 py-1">
                        Sale
                      </div>
                    )}
                  </Link>
                  <div className="p-4">
                    <div className="text-sm text-egyptian-blue-600 mb-1">
                      {categories.find(cat => cat.id === product.category)?.name}
                    </div>
                    <Link to={`/shop/${product.id}`}>
                      <h3 className="font-bold text-egyptian-blue-900 hover:text-egyptian-blue-700 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="mt-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg text-egyptian-blue-800">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-egyptian-blue-400 line-through text-sm">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-egyptian-blue-800 text-white py-2 rounded-md hover:bg-egyptian-blue-700 transition-colors flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add to Cart
                      </button>
                      <button className="p-2 bg-egyptian-sand-100 text-egyptian-blue-800 rounded-md hover:bg-egyptian-sand-200 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
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

export default ShopPage;