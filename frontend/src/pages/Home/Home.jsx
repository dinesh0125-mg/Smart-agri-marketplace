import React from 'react';
import Hero from '../../components/Hero/Hero';
import Categories from '../../components/Categories/Categories';
import FeaturedProducts from '../../components/Products/FeaturedProducts';
import WhyChooseUs from '../../components/WhyChooseUs/WhyChooseUs';
import Dashboard from '../../components/Dashboard/Dashboard';
import MarketPrices from '../../components/MarketPrices/MarketPrices';
import SuccessStories from '../../components/SuccessStories/SuccessStories';
import './Home.css';

export default function Home() {
  return (
    <main className="home-page">
      <Hero />
      <Categories />
      <FeaturedProducts />
      <WhyChooseUs />
      <Dashboard />
      <MarketPrices />
      <SuccessStories />
    </main>
  );
}
