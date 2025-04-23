import React, { useState } from 'react';
import { Palette, Upload, Settings, Check } from 'lucide-react';

const CustomCreationsPage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState('tshirt');
  const [color, setColor] = useState('#ffffff');
  const [step, setStep] = useState(1);
  
  const products = [
    { id: 'tshirt', name: 'T-Shirt', image: '/images/custom/tshirt-blank.jpg' },
    { id: 'mug', name: 'Mug', image: '/images/custom/mug-blank.jpg' },
    { id: 'poster', name: 'Poster', image: '/images/custom/poster-blank.jpg' },
    { id: 'tote', name: 'Tote Bag', image: '/images/custom/tote-blank.jpg' },
  ];
  
  const colors = [
    { id: 'white', value: '#ffffff', name: 'White' },
    { id: 'black', value: '#000000', name: 'Black' },
    { id: 'blue', value: '#1A2E4C', name: 'Egyptian Blue' },
    { id: 'gold', value: '#D4AF37', name: 'Egyptian Gold' },
    { id: 'terracotta', value: '#C2703D', name: 'Terracotta' },
  ];
  
  const getStepIcon = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return <Palette className="w-6 h-6" />;
      case 2:
        return <Upload className="w-6 h-6" />;
      case 3:
        return <Settings className="w-6 h-6" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="pt-20">
      {/* Header Banner */}
      <div className="relative bg-egyptian-blue-900 text-white">
        <div 
          className="absolute inset-0 bg-center bg-cover opacity-20"
          style={{ 
            backgroundImage: "url('/images/banners/custom-creation-bg.png')" 
          }}
        ></div>
        <div className="relative z-10 container-custom py-20 text-center">
          <h1 className="mb-4">Create Your Custom Egyptian-Inspired Design</h1>
          <p className="text-egyptian-sand-200 text-lg max-w-2xl mx-auto">
            Design your own unique products featuring personalized Egyptian-inspired elements.
          </p>
        </div>
      </div>
      
      {/* Steps */}
      <div className="bg-egyptian-sand-100 py-10 border-b border-egyptian-sand-200">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-center items-center md:space-x-6">
            {[1, 2, 3].map((stepNumber) => (
              <div 
                key={stepNumber}
                className={`flex items-center mb-4 md:mb-0 ${
                  stepNumber < 3 ? 'w-full' : ''
                }`}
              >
                <div className="flex items-center">
                  <div 
                    className={`rounded-full w-12 h-12 flex items-center justify-center ${
                      step >= stepNumber 
                        ? 'bg-egyptian-blue-800 text-white' 
                        : 'bg-egyptian-sand-200 text-egyptian-blue-600'
                    }`}
                  >
                    {getStepIcon(stepNumber)}
                  </div>
                  <span className="ml-3 text-egyptian-blue-800 font-medium">
                    {stepNumber === 1 && 'Select Product'}
                    {stepNumber === 2 && 'Customize Design'}
                    {stepNumber === 3 && 'Review & Order'}
                  </span>
                </div>
                
                {stepNumber < 3 && (
                  <div className="hidden md:block flex-1 h-0.5 mx-6 bg-egyptian-sand-200 relative">
                    {step > stepNumber && (
                      <div className="absolute inset-0 bg-egyptian-blue-800"></div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Custom Creation Content */}
      <div className="bg-egyptian-sand-50 py-16">
        <div className="container-custom">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {step === 1 && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-egyptian-blue-900 mb-6">Select Your Product</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map(product => (
                    <div 
                      key={product.id}
                      onClick={() => setSelectedProduct(product.id)}
                      className={`border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedProduct === product.id 
                          ? 'border-egyptian-gold-500 shadow-md' 
                          : 'border-egyptian-sand-200 hover:border-egyptian-blue-300'
                      }`}
                    >
                      <div className="aspect-square">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <span className="font-medium text-egyptian-blue-800">{product.name}</span>
                        {selectedProduct === product.id && (
                          <Check className="w-5 h-5 text-egyptian-gold-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Color Selection */}
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-egyptian-blue-900 mb-4">Select Color</h3>
                  
                  <div className="flex flex-wrap gap-4">
                    {colors.map(colorOption => (
                      <div 
                        key={colorOption.id}
                        onClick={() => setColor(colorOption.value)}
                        className={`relative w-12 h-12 rounded-full cursor-pointer border-2 ${
                          color === colorOption.value 
                            ? 'border-egyptian-gold-500' 
                            : 'border-transparent hover:border-egyptian-blue-300'
                        }`}
                        style={{ backgroundColor: colorOption.value }}
                      >
                        {color === colorOption.value && (
                          <Check className={`absolute inset-0 m-auto w-6 h-6 ${
                            ['white', 'gold'].includes(colorOption.id) 
                              ? 'text-egyptian-blue-900' 
                              : 'text-white'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-10 text-right">
                  <button 
                    onClick={() => setStep(2)}
                    className="btn-primary"
                  >
                    Continue to Design
                  </button>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-egyptian-blue-900 mb-6">Customize Your Design</h2>
                
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/2">
                    <div 
                      className="rounded-lg overflow-hidden aspect-square flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      <div className="text-center p-8">
                        <p className={`text-lg ${
                          ['#ffffff', '#D4AF37'].includes(color) 
                            ? 'text-egyptian-blue-900' 
                            : 'text-white'
                        }`}>
                          Your design will appear here
                        </p>
                        
                        <button className={`mt-4 px-4 py-2 rounded-md border ${
                          ['#ffffff', '#D4AF37'].includes(color) 
                            ? 'border-egyptian-blue-900 text-egyptian-blue-900 hover:bg-egyptian-blue-900/10' 
                            : 'border-white text-white hover:bg-white/10'
                        } transition-colors`}>
                          <Upload className="w-5 h-5 mr-2 inline-block" />
                          Upload Design
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:w-1/2">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-egyptian-blue-900 mb-3">Upload Your Design</h3>
                        <p className="text-egyptian-blue-700 mb-4">
                          Upload your own Egyptian-inspired design or choose from our templates below.
                        </p>
                        
                        <div className="border-2 border-dashed border-egyptian-sand-300 rounded-lg p-8 text-center">
                          <Upload className="w-10 h-10 text-egyptian-blue-400 mx-auto mb-4" />
                          <p className="text-egyptian-blue-700 mb-2">Drag and drop your file here, or</p>
                          <button className="px-4 py-2 bg-egyptian-blue-800 text-white rounded-md hover:bg-egyptian-blue-700 transition-colors">
                            Browse Files
                          </button>
                          <p className="text-sm text-egyptian-blue-500 mt-2">
                            Supports: PNG, JPG, SVG (max 10MB)
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-bold text-egyptian-blue-900 mb-3">Or Choose a Template</h3>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="border border-egyptian-sand-300 rounded-md overflow-hidden cursor-pointer hover:border-egyptian-gold-500 transition-colors">
                            <img 
                              src="/images/templates/ankh-template.jpg" 
                              alt="Ankh symbol template"
                              className="w-full aspect-square object-cover"
                            />
                          </div>
                          <div className="border border-egyptian-sand-300 rounded-md overflow-hidden cursor-pointer hover:border-egyptian-gold-500 transition-colors">
                            <img 
                              src="/images/templates/hieroglyphs-template.jpg" 
                              alt="Hieroglyphics template"
                              className="w-full aspect-square object-cover"
                            />
                          </div>
                          <div className="border border-egyptian-sand-300 rounded-md overflow-hidden cursor-pointer hover:border-egyptian-gold-500 transition-colors">
                            <img 
                              src="/images/templates/horus-template.jpg" 
                              alt="Eye of Horus template"
                              className="w-full aspect-square object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 flex justify-between">
                  <button 
                    onClick={() => setStep(1)}
                    className="btn-outline"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => setStep(3)}
                    className="btn-primary"
                  >
                    Continue to Review
                  </button>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-egyptian-blue-900 mb-6">Review & Order</h2>
                
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/2">
                    <div 
                      className="rounded-lg overflow-hidden aspect-square flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      <div className="text-center p-8">
                        <p className={`text-lg ${
                          ['#ffffff', '#D4AF37'].includes(color) 
                            ? 'text-egyptian-blue-900' 
                            : 'text-white'
                        }`}>
                          Preview of your design
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:w-1/2">
                    <div className="bg-egyptian-sand-50 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-bold text-egyptian-blue-900 mb-4">Order Summary</h3>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-egyptian-blue-700">Product:</span>
                          <span className="font-medium text-egyptian-blue-900">
                            {products.find(p => p.id === selectedProduct)?.name}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-egyptian-blue-700">Color:</span>
                          <span className="font-medium text-egyptian-blue-900">
                            {colors.find(c => c.value === color)?.name}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-egyptian-blue-700">Quantity:</span>
                          <span className="font-medium text-egyptian-blue-900">1</span>
                        </div>
                        
                        <div className="border-t border-egyptian-sand-300 pt-4 flex justify-between">
                          <span className="font-bold text-egyptian-blue-900">Estimated Total:</span>
                          <span className="font-bold text-egyptian-blue-900">$29.99</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-egyptian-blue-900 mb-3">Special Instructions</h3>
                      <textarea 
                        placeholder="Add any special instructions for your order here..."
                        className="w-full px-4 py-3 rounded-md border border-egyptian-sand-300 focus:outline-none focus:ring-2 focus:ring-egyptian-blue-500 text-egyptian-blue-800 placeholder-egyptian-blue-400"
                        rows={4}
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 flex justify-between">
                  <button 
                    onClick={() => setStep(2)}
                    className="btn-outline"
                  >
                    Back
                  </button>
                  <button 
                    className="btn-primary bg-egyptian-gold-500 hover:bg-egyptian-gold-400 focus:ring-egyptian-gold-300"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomCreationsPage;