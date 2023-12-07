
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ScrollLogger = () => {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const calculatedScrollPercentage = (scrollPosition / (documentHeight - windowHeight)) * 100;

    setScrollPercentage(calculatedScrollPercentage.toFixed(2));

    // Envoyer une requête au backend lorsque vous atteignez le bas de la page (par exemple, à 90%)
    if (calculatedScrollPercentage >= 90) {
      sendTestRequest();
    }
  };

  const sendTestRequest = async () => {
    try {
      // Vous pouvez personnaliser votre requête ici
      const response = await axios.get(`http://localhost:8080/api/contribuables?page=${currentPage}`);
      console.log(`Test request response for page ${currentPage}:`, response.data);

      // Incrémenter le numéro de page
      setCurrentPage(currentPage + 1);
    } catch (error) {
      console.error('Error sending test request:', error.message);
    }
  };

  useEffect(() => {
    // Attach the scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentPage]);

  return (
    <div ref={scrollRef} style={{ height: '200vh' }}>
      <p>Scroll Percentage: {scrollPercentage}%</p>
    </div>
  );
};

export default ScrollLogger;
