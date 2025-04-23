import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Heart, Star, Truck, ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import { productData } from '../data/productData';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = productData.find(product => product.id === id);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  if (!product) {
    return (
      <div className="pt-20 min-h-screen bg-egyptian-sand-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-egyptian-blue-800 mb-4">Product Not Found</h2>
          <p className="mb-6 text-egyptian-blue-600">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/shop" className="btn-primary">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  // Create additional images from the main image for this demo
  const images = [product.image];
  
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const handleImageChange = (index: number) => {
    setSelectedImage(index);
  };
  
  const nextImage = () => {
    setSelectedImage(prev => (prev + 1) % images.length);
  };
  
  const prevImage = () => {
    setSelectedImage(prev => (prev - 1 + images.length) % images.length);
  };
  
  // Related products (just show some random products for demo)
  const relatedProducts = productData
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  
  return (
    <div className="pt-20 bg-egyptian-sand-50">
      <div className="container-custom py-16">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-egyptian-blue-600">
            <li>
              <Link to="/" className="hover:text-egyptian-blue-800 transition-colors">Home</Link>
            </li>
            <li className="flex items-center space-x-2">
              <span>/</span>
              <Link to="/shop" className="hover:text-egyptian-blue-800 transition-colors">Shop</Link>
            </li>
            <li className="flex items-center space-x-2">
              <span>/</span>
              <span className="text-egyptian-blue-800 font-medium">{product.name}</span>
            </li>
          </ol>
        </nav>
        
        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Product Images */}
            <div className="md:w-1/2 p-6">
              <div className="relative">
                <div className="rounded-lg overflow-hidden aspect-square">
                  <img 
                    src={images[selectedImage]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 text-egyptian-blue-800 p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 text-egyptian-blue-800 p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              
              {images.length > 1 && (
                <div className="mt-4 flex space-x-2">
                  {images.map((img, index) => (
                    <button 
                      key={index}
                      onClick={() => handleImageChange(index)}
                      className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                        selectedImage === index 
                          ? 'border-egyptian-gold-500' 
                          : 'border-transparent'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} - view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="md:w-1/2 p-6 md:border-l border-egyptian-sand-200">
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < product.rating 
                            ? 'text-egyptian-gold-500 fill-egyptian-gold-500' 
                            : 'text-egyptian-sand-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-egyptian-blue-600">
                    {product.reviews} reviews
                  </span>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-egyptian-blue-900 mb-2">
                  {product.name}
                </h1>
                
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl font-bold text-egyptian-blue-800">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-egyptian-blue-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  {product.onSale && (
                    <span className="bg-egyptian-terracotta-500 text-white text-xs font-medium px-2 py-1 rounded">
                      Sale
                    </span>
                  )}
                </div>
                
                <p className="text-egyptian-blue-700 mb-6">
                  {product.description}
                </p>
              </div>
              
              <div className="space-y-6">
                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-medium text-egyptian-blue-800 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center">
                    <button 
                      onClick={decrementQuantity}
                      className="p-2 border border-egyptian-sand-300 rounded-l-md bg-egyptian-sand-100 text-egyptian-blue-800 hover:bg-egyptian-sand-200 transition-colors"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      value={quantity} 
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                      className="w-16 text-center p-2 border-t border-b border-egyptian-sand-300 text-egyptian-blue-800"
                      min="1"
                    />
                    <button 
                      onClick={incrementQuantity}
                      className="p-2 border border-egyptian-sand-300 rounded-r-md bg-egyptian-sand-100 text-egyptian-blue-800 hover:bg-egyptian-sand-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Add to Cart Button */}
                <div className="flex space-x-3">
                  <button className="flex-1 bg-egyptian-blue-800 text-white py-3 rounded-md hover:bg-egyptian-blue-700 transition-colors flex items-center justify-center font-medium">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </button>
                  <button className="p-3 bg-egyptian-sand-100 text-egyptian-blue-800 rounded-md hover:bg-egyptian-sand-200 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Shipping Info */}
                <div className="border-t border-egyptian-sand-200 pt-6 space-y-3">
                  <div className="flex items-start space-x-3">
                    <Truck className="w-5 h-5 text-egyptian-blue-800 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-egyptian-blue-900">Free Shipping</h4>
                      <p className="text-sm text-egyptian-blue-600">On all orders over $50</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <ShieldCheck className="w-5 h-5 text-egyptian-blue-800 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-egyptian-blue-900">Satisfaction Guaranteed</h4>
                      <p className="text-sm text-egyptian-blue-600">30-day money back guarantee</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-egyptian-blue-900 mb-8">You Might Also Like</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relProduct => (
              <div 
                key={relProduct.id} 
                className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl group"
              >
                <Link to={`/shop/${relProduct.id}`} className="block relative overflow-hidden h-48">
                  <img 
                    src={relProduct.image} 
                    alt={relProduct.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>
                <div className="p-4">
                  <Link to={`/shop/${relProduct.id}`}>
                    <h3 className="font-bold text-egyptian-blue-900 hover:text-egyptian-blue-700 transition-colors">
                      {relProduct.name}
                    </h3>
                  </Link>
                  <div className="mt-2">
                    <span className="font-bold text-egyptian-blue-800">
                      ${relProduct.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;