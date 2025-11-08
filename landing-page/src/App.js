import React from 'react';
import './App.css';
import './mobile-enhancements.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import MembershipApplication from './components/MembershipApplication';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Header />
      <main id="main-content">
        <Hero />
        <Services />
        <MembershipApplication />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
