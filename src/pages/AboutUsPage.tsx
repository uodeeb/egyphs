import React from 'react';
import { BookOpen, Users, Award, Heart } from 'lucide-react';

const AboutUsPage: React.FC = () => {
  return (
    <div className="pt-20">
      {/* Header Banner */}
      <div className="relative bg-egyptian-blue-900 text-white">
        <div 
          className="absolute inset-0 bg-center bg-cover opacity-20"
          style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/3254729/pexels-photo-3254729.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&crop=entropy')" 
          }}
        ></div>
        <div className="relative z-10 container-custom py-20 text-center">
          <h1 className="mb-4">About Pyramid Perspective</h1>
          <p className="text-egyptian-sand-200 text-lg max-w-2xl mx-auto">
            Learn about our mission to celebrate and share the rich cultural heritage of ancient Egypt.
          </p>
        </div>
      </div>
      
      {/* Our Story Section */}
      <div className="bg-egyptian-sand-50 py-20">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-egyptian-blue-900 mb-6">Our Story</h2>
              <p className="text-egyptian-blue-700 mb-4">
                Pyramid Perspective was founded in 2022 by a team of historians, artists, and educators who share a passion for ancient Egyptian history and culture. Our journey began with a simple mission: to make the fascinating world of ancient Egypt accessible and engaging for everyone.
              </p>
              <p className="text-egyptian-blue-700 mb-4">
                We believe that learning about history should be an immersive and enjoyable experience. That's why we've created a platform that combines educational content with beautifully crafted designs inspired by the rich artistic traditions of ancient Egypt.
              </p>
              <p className="text-egyptian-blue-700">
                From the iconic pyramids to the intricate hieroglyphics, the art and architecture of ancient Egypt continue to captivate and inspire people around the world. Through our platform, we aim to preserve and celebrate this rich cultural heritage while making it relevant to contemporary audiences.
              </p>
            </div>
            
            <div className="lg:w-1/2">
              <img 
                src="https://images.pexels.com/photos/3631430/pexels-photo-3631430.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&crop=entropy" 
                alt="Our team exploring Egyptian artifacts"
                className="rounded-xl shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Our Values Section */}
      <div className="bg-egyptian-sand-100 py-20">
        <div className="container-custom">
          <h2 className="section-heading text-egyptian-blue-900">
            Our Values
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-14 h-14 rounded-full bg-egyptian-blue-100 flex items-center justify-center mb-4">
                <BookOpen className="w-7 h-7 text-egyptian-blue-800" />
              </div>
              <h3 className="text-xl font-bold text-egyptian-blue-900 mb-3">Education</h3>
              <p className="text-egyptian-blue-700">
                We are committed to providing accurate, well-researched information about ancient Egyptian history, art, and culture.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-14 h-14 rounded-full bg-egyptian-terracotta-100 flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-egyptian-terracotta-600" />
              </div>
              <h3 className="text-xl font-bold text-egyptian-blue-900 mb-3">Accessibility</h3>
              <p className="text-egyptian-blue-700">
                We believe that knowledge should be accessible to all, regardless of background or prior knowledge of ancient history.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-14 h-14 rounded-full bg-egyptian-gold-100 flex items-center justify-center mb-4">
                <Award className="w-7 h-7 text-egyptian-gold-500" />
              </div>
              <h3 className="text-xl font-bold text-egyptian-blue-900 mb-3">Quality</h3>
              <p className="text-egyptian-blue-700">
                We strive for excellence in both our educational content and the design of our products, ensuring that everything we create is of the highest quality.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-14 h-14 rounded-full bg-egyptian-blue-100 flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-egyptian-blue-800" />
              </div>
              <h3 className="text-xl font-bold text-egyptian-blue-900 mb-3">Respect</h3>
              <p className="text-egyptian-blue-700">
                We approach the study of ancient Egyptian culture with deep respect and appreciation for its complexity and significance.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Meet Our Team Section */}
      <div className="bg-egyptian-sand-50 py-20">
        <div className="container-custom">
          <h2 className="section-heading text-egyptian-blue-900">
            Meet Our Team
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <img 
                src="https://images.pexels.com/photos/5082976/pexels-photo-5082976.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&crop=entropy" 
                alt="Sarah Johnson"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-egyptian-blue-900 mb-1">Sarah Johnson</h3>
                <p className="text-egyptian-blue-600 mb-3">Founder & Historian</p>
                <p className="text-egyptian-blue-700">
                  With a PhD in Ancient History, Sarah leads our research and content development efforts, ensuring accuracy and depth in all our educational materials.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <img 
                src="https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&crop=entropy" 
                alt="David Chen"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-egyptian-blue-900 mb-1">David Chen</h3>
                <p className="text-egyptian-blue-600 mb-3">Creative Director</p>
                <p className="text-egyptian-blue-700">
                  David brings ancient Egyptian aesthetics to life through modern design, overseeing all visual aspects of our platform and product collections.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <img 
                src="https://images.pexels.com/photos/3793648/pexels-photo-3793648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&crop=entropy" 
                alt="Maya Patel"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-egyptian-blue-900 mb-1">Maya Patel</h3>
                <p className="text-egyptian-blue-600 mb-3">Education Specialist</p>
                <p className="text-egyptian-blue-700">
                  With a background in museum education, Maya develops engaging learning resources and ensures our content is accessible to diverse audiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;