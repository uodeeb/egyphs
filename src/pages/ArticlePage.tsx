import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, Tag, Share } from 'lucide-react';
import { articleData } from '../data/articleData';

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const article = articleData.find(article => article.slug === slug);
  
  if (!article) {
    return (
      <div className="pt-20 min-h-screen bg-egyptian-sand-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-egyptian-blue-800 mb-4">Article Not Found</h2>
          <p className="mb-6 text-egyptian-blue-600">The article you're looking for doesn't exist or has been moved.</p>
          <Link to="/knowledge-hub" className="btn-primary">
            Return to Knowledge Hub
          </Link>
        </div>
      </div>
    );
  }
  
  const relatedArticles = articleData
    .filter(a => a.category === article.category && a.id !== article.id)
    .slice(0, 3);
  
  return (
    <div className="pt-20 bg-egyptian-sand-50">
      {/* Article Header */}
      <div className="relative bg-egyptian-blue-900 text-white">
        <div 
          className="absolute inset-0 bg-center bg-cover opacity-30"
          style={{ backgroundImage: `url(${article.image})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-egyptian-blue-900 to-transparent"></div>
        <div className="relative z-10 container-custom py-20">
          <Link 
            to="/knowledge-hub" 
            className="inline-flex items-center text-egyptian-sand-200 hover:text-egyptian-gold-400 mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Knowledge Hub
          </Link>
          
          <h1 className="mb-4 max-w-4xl">{article.title}</h1>
          
          <div className="flex flex-wrap items-center text-egyptian-sand-200 gap-x-6 gap-y-2 mb-6">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{article.readTime} min read</span>
            </div>
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              <span>{article.category.charAt(0).toUpperCase() + article.category.slice(1)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Article Content */}
      <div className="container-custom py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3">
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-egyptian-blue-800 mb-6 font-medium leading-relaxed">
                {article.excerpt}
              </p>
              
              <p>
                Ancient Egyptian civilization was one of the most remarkable and enduring cultures in human history. Spanning over three thousand years, from approximately 3100 BCE to 30 BCE, it flourished along the banks of the Nile River, creating a legacy that continues to captivate our imagination today.
              </p>
              
              <h2>The Historical Context</h2>
              
              <p>
                Egypt's ancient history is traditionally divided into several periods: the Pre-Dynastic Period, the Early Dynastic Period, the Old Kingdom, the First Intermediate Period, the Middle Kingdom, the Second Intermediate Period, the New Kingdom, the Third Intermediate Period, the Late Period, and finally the Ptolemaic Period, which ended with the Roman conquest.
              </p>
              
              <p>
                Each of these eras had its own distinct characteristics, achievements, and challenges, but throughout them all, certain fundamental aspects of Egyptian culture remained remarkably consistent.
              </p>
              
              <figure>
                <img 
                  src="https://images.pexels.com/photos/6469879/pexels-photo-6469879.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&crop=entropy" 
                  alt="Ancient Egyptian Hieroglyphics"
                  className="rounded-lg w-full"
                />
                <figcaption className="text-center text-sm text-egyptian-blue-600 mt-2">
                  Hieroglyphic inscriptions from an ancient Egyptian temple
                </figcaption>
              </figure>
              
              <h2>Cultural Significance</h2>
              
              <p>
                The ancient Egyptians made significant contributions to art, architecture, religion, governance, and science. Their monumental structures, such as the pyramids and temples, stand as testaments to their engineering prowess and spiritual devotion.
              </p>
              
              <p>
                Egyptian art is instantly recognizable for its distinctive style, characterized by a unique perspective that combined profile and frontal views. The Egyptians developed a sophisticated writing system, hieroglyphics, which remained in use for nearly 3,500 years.
              </p>
              
              <h2>Religious Beliefs</h2>
              
              <p>
                Religion permeated every aspect of Egyptian life. The Egyptians worshipped a multitude of gods and goddesses, each representing different aspects of the natural world and human experience. Among the most important deities were:
              </p>
              
              <ul>
                <li>Ra - The sun god and creator of the world</li>
                <li>Osiris - God of the afterlife and resurrection</li>
                <li>Isis - Goddess of healing and protection</li>
                <li>Horus - God of kingship and the sky</li>
                <li>Anubis - God of mummification and the afterlife</li>
              </ul>
              
              <p>
                The concept of life after death was central to Egyptian religious thought. They believed that proper burial and preservation of the body were essential for the deceased to enjoy the afterlife, leading to the practice of mummification and the construction of elaborate tombs.
              </p>
              
              <blockquote>
                "The Egyptians believed that the afterlife was a perfect version of Egypt, where they would continue their earthly activities for eternity. This belief shaped their mortuary practices and much of their monumental architecture."
              </blockquote>
              
              <h2>Legacy and Influence</h2>
              
              <p>
                The influence of ancient Egypt extends far beyond its geographical and temporal boundaries. Egyptian motifs and symbols have appeared in art and architecture throughout history, from ancient Greece and Rome to modern design. The discovery of Tutankhamun's tomb in 1922 sparked a renewed interest in Egyptian aesthetics, leading to the Art Deco movement's incorporation of Egyptian elements.
              </p>
              
              <p>
                The Egyptian understanding of mathematics, astronomy, and medicine laid foundations for later scientific developments, while their religious concepts influenced early Christianity and other belief systems.
              </p>
              
              <p>
                Today, we continue to study and admire the achievements of this remarkable civilization, finding in its art, architecture, and writings reflections of both the universality of human concerns and the distinctive features of a unique cultural tradition.
              </p>
            </div>
            
            {/* Share Buttons */}
            <div className="mt-12 pt-8 border-t border-egyptian-sand-200">
              <div className="flex items-center">
                <span className="text-egyptian-blue-800 font-medium mr-4">Share this article:</span>
                <div className="flex space-x-3">
                  <button className="w-10 h-10 rounded-full bg-egyptian-blue-800 text-white flex items-center justify-center hover:bg-egyptian-blue-700 transition-colors">
                    <Share className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 sticky top-24">
              <h3 className="text-xl font-bold text-egyptian-blue-900 mb-4">Related Articles</h3>
              
              <div className="space-y-6">
                {relatedArticles.map(relatedArticle => (
                  <div key={relatedArticle.id} className="flex space-x-4">
                    <img 
                      src={relatedArticle.image} 
                      alt={relatedArticle.title}
                      className="w-20 h-20 rounded-md object-cover flex-shrink-0"
                    />
                    <div>
                      <Link 
                        to={`/knowledge-hub/${relatedArticle.slug}`}
                        className="font-medium text-egyptian-blue-800 hover:text-egyptian-blue-600 transition-colors"
                      >
                        {relatedArticle.title}
                      </Link>
                      <p className="text-sm text-egyptian-blue-600 mt-1">
                        {relatedArticle.readTime} min read
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-egyptian-blue-900 text-white rounded-xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Subscribe to Our Newsletter</h3>
                <p className="text-egyptian-sand-200 mb-4">
                  Get notified when we publish new articles on Egyptian history and culture.
                </p>
                
                <form className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="w-full px-4 py-2 rounded-md bg-egyptian-blue-800 border border-egyptian-blue-700 text-white placeholder-egyptian-sand-300 focus:outline-none focus:ring-2 focus:ring-egyptian-gold-500"
                    required
                  />
                  <button 
                    type="submit" 
                    className="w-full px-4 py-2 bg-egyptian-gold-500 text-egyptian-blue-900 rounded-md hover:bg-egyptian-gold-400 transition-colors font-medium"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;