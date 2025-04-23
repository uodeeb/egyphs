import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import KnowledgeHubPage from './pages/KnowledgeHubPage';
import DiscoverDesignsPage from './pages/DiscoverDesignsPage';
import ShopPage from './pages/ShopPage';
import CustomCreationsPage from './pages/CustomCreationsPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactPage from './pages/ContactPage';
import ArticlePage from './pages/ArticlePage';
import ProductPage from './pages/ProductPage';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/knowledge-hub" element={<KnowledgeHubPage />} />
          <Route path="/knowledge-hub/:slug" element={<ArticlePage />} />
          <Route path="/discover-designs" element={<DiscoverDesignsPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:id" element={<ProductPage />} />
          <Route path="/custom-creations" element={<CustomCreationsPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;