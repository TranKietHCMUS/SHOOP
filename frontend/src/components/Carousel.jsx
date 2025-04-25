import React, { useState, useEffect } from 'react';

const Carousel = () => {
    const images = [
        '/logo/logobhx.jpg',
        '/logo/logofamilymart.jpg',
        '/logo/logowinmart.jpg',
      ];

  const [currentImage, setCurrentImage] = useState(0);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-3/4" style={{ paddingTop: '56.25%' /* 16:9 aspect ratio */ }}>
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Carousel ${index + 1}`}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
            index === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ objectFit: 'cover' }}
        />
      ))}
      {/* Carousel Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-4 h-4 rounded-full ${
              index === currentImage ? 'bg-white' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;