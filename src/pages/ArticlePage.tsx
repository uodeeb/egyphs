import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, Tag, User, BookOpen, Link as LinkIcon, Facebook, Twitter, Linkedin, ArrowUp, ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import { articleData, getRelatedArticles, getArticleNavigation } from '../data/articleData';
import type { Article, ArticleSection, ArticleImage, ArticleReference } from '../types/article';

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeSection, setActiveSection] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const article = articleData.find((article: Article) => article.slug === slug);
  
  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);
      
      // Show/hide back to top button
      setShowBackToTop(winScroll > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
  
  const relatedArticles = getRelatedArticles(article.id);
  const { prev, next } = getArticleNavigation(article.slug);

  const handleSectionClick = (sectionTitle: string) => {
    setActiveSection(sectionTitle);
    const element = document.getElementById(sectionTitle.toLowerCase().replace(/\s+/g, '-'));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shareUrl = window.location.href;
  const shareTitle = article.title;

  const handleShare = (platform: 'facebook' | 'twitter' | 'linkedin') => {
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    };
    
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="pt-20 bg-egyptian-sand-50">
      {/* Scroll Progress Bar */}
      <div 
        className="fixed top-0 left-0 w-full h-1 bg-egyptian-sand-200 z-50"
        style={{ marginTop: '5rem' }}
      >
        <div 
          className="h-full bg-egyptian-gold-500 transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-egyptian-blue-800 text-white p-3 rounded-full shadow-lg hover:bg-egyptian-blue-700 transition-colors z-40"
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      {/* Article Header */}
      <div className="relative bg-egyptian-blue-900 text-white">
        <div 
          className="absolute inset-0 bg-center bg-cover opacity-30"
          style={{ backgroundImage: `url(${article.mainImage.url})` }}
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
              <User className="w-4 h-4 mr-2" />
              <span>{article.author.name}</span>
            </div>
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
              <span>{article.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Article Content */}
      <div className="container-custom py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3">
            <div className="prose prose-lg max-w-none">
              {/* Main Image */}
              <figure className="mb-8">
                <img 
                  src={article.mainImage.url}
                  alt={article.mainImage.alt}
                  className="rounded-lg w-full"
                />
                {article.mainImage.caption && (
                  <figcaption className="text-center text-sm text-egyptian-blue-600 mt-2">
                    {article.mainImage.caption}
                  </figcaption>
                )}
              </figure>

              <p className="text-xl text-egyptian-blue-800 mb-6 font-medium leading-relaxed">
                {article.excerpt}
              </p>
              
              {/* Article Sections */}
              {article.sections.map((section: ArticleSection, index: number) => (
                <div 
                  key={index}
                  id={section.title.toLowerCase().replace(/\s+/g, '-')}
                  className="scroll-mt-24"
                >
                  <h2>{section.title}</h2>
                  <div className="space-y-4">
                    {section.content.split('\n\n').map((paragraph: string, pIndex: number) => (
                      <p key={pIndex}>{paragraph}</p>
                    ))}
                  </div>
                  
                  {section.images && section.images.map((image: ArticleImage, imgIndex: number) => (
                    <figure key={imgIndex} className="my-8">
                      <img 
                        src={image.url}
                        alt={image.alt}
                        className="rounded-lg w-full"
                      />
                      {image.caption && (
                        <figcaption className="text-center text-sm text-egyptian-blue-600 mt-2">
                          {image.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              ))}
              
              {/* References Section */}
              {article.references && article.references.length > 0 && (
                <div className="mt-12 pt-8 border-t border-egyptian-sand-200">
                  <h2 className="text-2xl font-bold text-egyptian-blue-900 mb-4">References</h2>
                  <ul className="space-y-3">
                    {article.references.map((reference: ArticleReference, index: number) => (
                      <li key={index} className="flex items-start">
                        <BookOpen className="w-5 h-5 text-egyptian-blue-600 mt-1 mr-2 flex-shrink-0" />
                        <span>
                          {reference.author && `${reference.author}. `}
                          <span className="font-medium">{reference.title}</span>
                          {reference.publicationYear && ` (${reference.publicationYear})`}
                          {reference.url && (
                            <a 
                              href={reference.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-egyptian-blue-600 hover:text-egyptian-blue-500 inline-flex items-center"
                            >
                              <LinkIcon className="w-4 h-4 mr-1" />
                              View Source
                            </a>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Article Navigation */}
              <div className="mt-12 pt-8 border-t border-egyptian-sand-200">
                <div className="flex items-stretch justify-between">
                  {prev && (
                    <Link 
                      to={`/knowledge-hub/${prev.slug}`}
                      className="flex-1 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow mr-4 group"
                    >
                      <div className="flex items-center text-egyptian-blue-600 mb-2 group-hover:text-egyptian-blue-800">
                        <ArrowLeftCircle className="w-5 h-5 mr-2" />
                        <span className="text-sm">Previous Article</span>
                      </div>
                      <h4 className="font-bold text-egyptian-blue-900 group-hover:text-egyptian-blue-700">
                        {prev.title}
                      </h4>
                    </Link>
                  )}
                  
                  {next && (
                    <Link 
                      to={`/knowledge-hub/${next.slug}`}
                      className="flex-1 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow ml-4 text-right group"
                    >
                      <div className="flex items-center justify-end text-egyptian-blue-600 mb-2 group-hover:text-egyptian-blue-800">
                        <span className="text-sm">Next Article</span>
                        <ArrowRightCircle className="w-5 h-5 ml-2" />
                      </div>
                      <h4 className="font-bold text-egyptian-blue-900 group-hover:text-egyptian-blue-700">
                        {next.title}
                      </h4>
                    </Link>
                  )}
                </div>
              </div>

              {/* Share Buttons */}
              <div className="mt-12 pt-8 border-t border-egyptian-sand-200">
                <div className="flex items-center">
                  <span className="text-egyptian-blue-800 font-medium mr-4">Share this article:</span>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleShare('facebook')}
                      className="w-10 h-10 rounded-full bg-egyptian-blue-800 text-white flex items-center justify-center hover:bg-egyptian-blue-700 transition-colors"
                      aria-label="Share on Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleShare('twitter')}
                      className="w-10 h-10 rounded-full bg-egyptian-blue-800 text-white flex items-center justify-center hover:bg-egyptian-blue-700 transition-colors"
                      aria-label="Share on Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleShare('linkedin')}
                      className="w-10 h-10 rounded-full bg-egyptian-blue-800 text-white flex items-center justify-center hover:bg-egyptian-blue-700 transition-colors"
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/3">
            {/* Author Bio */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex items-center space-x-4 mb-4">
                {article.author.image && (
                  <img 
                    src={article.author.image}
                    alt={article.author.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="font-bold text-egyptian-blue-900">{article.author.name}</h3>
                  <p className="text-egyptian-blue-600 text-sm">{article.author.title}</p>
                </div>
              </div>
              <p className="text-egyptian-blue-700 text-sm">
                {article.author.bio}
              </p>
            </div>

            {/* Table of Contents */}
            {article.tableOfContents && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-8 sticky top-24">
                <h3 className="text-xl font-bold text-egyptian-blue-900 mb-4">Contents</h3>
                <nav>
                  <ul className="space-y-2">
                    {article.tableOfContents.map((title: string, index: number) => (
                      <li key={index}>
                        <button
                          onClick={() => handleSectionClick(title)}
                          className={`text-left w-full px-2 py-1 rounded transition-colors ${
                            activeSection === title
                              ? 'bg-egyptian-blue-100 text-egyptian-blue-800'
                              : 'text-egyptian-blue-600 hover:text-egyptian-blue-800'
                          }`}
                        >
                          {title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}

            {/* Related Articles */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 sticky top-24">
              <h3 className="text-xl font-bold text-egyptian-blue-900 mb-4">Related Articles</h3>
              
              <div className="space-y-6">
                {relatedArticles.map((relatedArticle: Article) => (
                  <div key={relatedArticle.id} className="flex space-x-4">
                    <img 
                      src={relatedArticle.mainImage.url} 
                      alt={relatedArticle.mainImage.alt}
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
            
            {/* Newsletter */}
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