export const categories = [
  { id: 1, name: 'Fresh Vegetables', count: '1200+', color: '#E8F5E9', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&q=80' },
  { id: 2, name: 'Fresh Fruits', count: '950+', color: '#FFF3E0', img: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&q=80' },
  { id: 3, name: 'Organic Products', count: '800+', color: '#F1F8E9', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80' },
  { id: 4, name: 'Seeds', count: '650+', color: '#E0F2F1', img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&q=80' },
  { id: 5, name: 'Fertilizers', count: '400+', color: '#FBE9E7', img: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=300&q=80' },
  { id: 6, name: 'Farming Equipment', count: '750+', color: '#E3F2FD', img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&q=80' },
  { id: 7, name: 'Dairy Products', count: '600+', color: '#F3E5F5', img: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&q=80' },
  { id: 8, name: 'Poultry Products', count: '350+', color: '#FFF8E1', img: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=300&q=80' },
];

export const products = [
  { id: 1, name: 'Organic Tomatoes', farmer: 'Ramesh Kumar', location: 'Coimbatore, TN', rating: 4.8, reviews: 120, price: 40, unit: 'kg', stock: true, organic: true, category: 'Fresh Vegetables', img: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80', discount: 10 },
  { id: 2, name: 'Fresh Mangoes', farmer: 'Suresh Patil', location: 'Ratnagiri, MH', rating: 4.7, reviews: 98, price: 80, unit: 'kg', stock: true, organic: true, category: 'Fresh Fruits', img: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400&q=80', discount: 0 },
  { id: 3, name: 'Basmati Rice', farmer: 'Amit Singh', location: 'Amritsar, PB', rating: 4.9, reviews: 230, price: 120, unit: 'kg', stock: true, organic: true, category: 'Organic Products', img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80', discount: 5 },
  { id: 4, name: 'Fresh Coconut', farmer: 'Pradeep Nair', location: 'Kollam, KL', rating: 4.8, reviews: 80, price: 35, unit: 'piece', stock: true, organic: true, category: 'Fresh Fruits', img: 'https://images.unsplash.com/photo-1580984969071-a8da5656c2fb?w=400&q=80', discount: 0 },
  { id: 5, name: 'Green Chilli', farmer: 'Vikram Yadav', location: 'Guntur, AP', rating: 4.7, reviews: 85, price: 60, unit: 'kg', stock: true, organic: false, category: 'Fresh Vegetables', img: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400&q=80', discount: 0 },
  { id: 6, name: 'Golden Wheat', farmer: 'Manoj Singh', location: 'Kanpur, UP', rating: 4.8, reviews: 110, price: 28, unit: 'kg', stock: true, organic: false, category: 'Seeds', img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80', discount: 8 },
  { id: 7, name: 'Sunflower Seeds', farmer: 'Kavita Reddy', location: 'Hyderabad, TS', rating: 4.6, reviews: 64, price: 95, unit: 'kg', stock: true, organic: true, category: 'Seeds', img: 'https://images.unsplash.com/photo-1617369120004-4fc70312c5e6?w=400&q=80', discount: 0 },
  { id: 8, name: 'Organic Fertilizer', farmer: 'Deepak Joshi', location: 'Pune, MH', rating: 4.5, reviews: 52, price: 150, unit: 'kg', stock: false, organic: true, category: 'Fertilizers', img: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&q=80', discount: 15 },
  { id: 9, name: 'Fresh Spinach', farmer: 'Anita Sharma', location: 'Jaipur, RJ', rating: 4.7, reviews: 73, price: 25, unit: 'kg', stock: true, organic: true, category: 'Fresh Vegetables', img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', discount: 0 },
  { id: 10, name: 'Alphonso Mango', farmer: 'Rajesh Desai', location: 'Devgad, MH', rating: 5.0, reviews: 320, price: 200, unit: 'kg', stock: true, organic: true, category: 'Fresh Fruits', img: 'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=400&q=80', discount: 0 },
  { id: 11, name: 'Red Onions', farmer: 'Sanjay Patil', location: 'Nashik, MH', rating: 4.4, reviews: 145, price: 30, unit: 'kg', stock: true, organic: false, category: 'Fresh Vegetables', img: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&q=80', discount: 0 },
  { id: 12, name: 'Farm Potatoes', farmer: 'Ritu Singh', location: 'Agra, UP', rating: 4.3, reviews: 99, price: 20, unit: 'kg', stock: true, organic: false, category: 'Fresh Vegetables', img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80', discount: 0 },
];

export const marketPrices = [
  { id: 1, name: 'Rice', price: 45, change: +2.5, unit: 'kg', trend: [40, 42, 41, 43, 44, 45] },
  { id: 2, name: 'Wheat', price: 28, change: -1.2, unit: 'kg', trend: [30, 29, 29, 28, 28, 28] },
  { id: 3, name: 'Tomato', price: 40, change: +5.3, unit: 'kg', trend: [30, 33, 36, 38, 39, 40] },
  { id: 4, name: 'Onion', price: 25, change: -0.8, unit: 'kg', trend: [28, 27, 26, 26, 25, 25] },
  { id: 5, name: 'Potato', price: 20, change: +1.5, unit: 'kg', trend: [18, 18, 19, 19, 20, 20] },
  { id: 6, name: 'Mango', price: 80, change: +3.2, unit: 'kg', trend: [70, 73, 75, 77, 79, 80] },
];

export const successStories = [
  { id: 1, name: 'Ramesh Kumar', location: 'Coimbatore, Tamil Nadu', growth: '185%', story: 'I used to sell my tomatoes at a local mandi for Rs.15/kg. After joining Smart Agriculture Marketplace, I now get Rs.40/kg directly from buyers. My annual income grew from Rs.2L to Rs.5.7L.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', product: 'Organic Tomatoes' },
  { id: 2, name: 'Sunita Devi', location: 'Ratnagiri, Maharashtra', growth: '240%', story: 'This platform connected me with premium buyers across India. My alphonso mangoes now sell at premium prices. My family\'s life has completely changed thanks to direct market access.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', product: 'Alphonso Mangoes' },
  { id: 3, name: 'Vikram Yadav', location: 'Guntur, Andhra Pradesh', growth: '160%', story: 'Selling chillies directly to food companies through this marketplace doubled my earnings. The AI crop recommendation helped me increase yield by 30% this season.', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80', product: 'Green Chilli' },
  { id: 4, name: 'Kavitha Reddy', location: 'Warangal, Telangana', growth: '310%', story: 'I started with just 2 acres of organic farming. The marketplace gave me access to health-conscious urban buyers willing to pay premium. Now I cultivate 8 acres and employ 5 people.', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', product: 'Organic Vegetables' },
];

export const whyChooseUs = [
  { id: 1, title: 'Direct Farmer Connection', desc: 'Buy directly from trusted farmers without middlemen. 100% transparent supply chain.', color: '#E8F5E9' },
  { id: 2, title: 'Fresh Products', desc: '100% farm-fresh produce delivered within 24-48 hours of harvest.', color: '#F1F8E9' },
  { id: 3, title: 'Secure Payments', desc: 'Safe and secure payment options with buyer protection guarantee.', color: '#E3F2FD' },
  { id: 4, title: 'Fast Delivery', desc: 'Quick delivery across 100+ cities in India with real-time tracking.', color: '#FFF3E0' },
  { id: 5, title: 'Quality Assurance', desc: 'Every product quality-checked. Certified organic products available.', color: '#F3E5F5' },
  { id: 6, title: '24/7 Support', desc: 'Round-the-clock customer support in 10+ regional languages.', color: '#FBE9E7' },
];

export const dashboardCards = [
  { id: 1, title: 'Weather Forecast', value: '28 C', desc: 'Partly Cloudy - Good for harvest', trend: '+', color: '#E3F2FD', bg: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)' },
  { id: 2, title: 'Market Index', value: 'Rs.2,847', desc: 'Avg price index today', trend: '+2.3%', color: '#E8F5E9', bg: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)' },
  { id: 3, title: 'Crop Analytics', value: '94%', desc: 'Yield efficiency this season', trend: '+5%', color: '#F1F8E9', bg: 'linear-gradient(135deg, #F1F8E9, #DCEDC8)' },
  { id: 4, title: 'Soil Health', value: 'Good', desc: 'pH 6.8 - Nitrogen adequate', trend: 'Stable', color: '#FBE9E7', bg: 'linear-gradient(135deg, #FBE9E7, #FFCCBC)' },
  { id: 5, title: 'Drone Coverage', value: '847 ha', desc: 'Monitored area today', trend: '+12 ha', color: '#EDE7F6', bg: 'linear-gradient(135deg, #EDE7F6, #D1C4E9)' },
  { id: 6, title: 'Smart Irrigation', value: '62%', desc: 'Water efficiency rate', trend: '+8%', color: '#E0F7FA', bg: 'linear-gradient(135deg, #E0F7FA, #B2EBF2)' },
];

export const farmers = [
  { id: 1, name: 'Ramesh Kumar', location: 'Coimbatore, Tamil Nadu', experience: '12 years', products: 24, rating: 4.9, verified: true, img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80', specialty: 'Organic Vegetables' },
  { id: 2, name: 'Suresh Patil', location: 'Ratnagiri, Maharashtra', experience: '18 years', products: 15, rating: 4.8, verified: true, img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80', specialty: 'Tropical Fruits' },
  { id: 3, name: 'Kavitha Reddy', location: 'Warangal, Telangana', experience: '8 years', products: 32, rating: 4.7, verified: true, img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80', specialty: 'Organic Farming' },
];
