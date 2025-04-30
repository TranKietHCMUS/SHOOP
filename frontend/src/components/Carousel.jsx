import React, { useState, useEffect } from 'react';

// Danh sách ảnh mẫu (có thể thay bằng props)
const images = [
  'imgs/carousel1.jpg',
  'imgs/carousel2.jpg',
  'imgs/carousel3.jpg'
];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto h-[450px] overflow-hidden rounded-lg shadow-lg bg-gradient-to-br from-[#FFF] via-[#FFF] to-[#00B14F] border border-[#00B14F]/20">
      {/* Tech overlays */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwIDAgTDIwMCAxMDAgTDEwMCAyMDAgTDAgMTAwIiBzdHJva2U9InJnYmEoMCwgMTc3LCA3OSwgMC4wOCkiIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-50"></div>
      
      <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#00B14F] opacity-40"></div>
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#00B14F] opacity-40"></div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00B14F]/20 blur-3xl rounded-full -ml-32 -mb-32"></div>

      <div
        className="flex transition-transform duration-700 ease-in-out relative z-10"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="min-w-full h-[450px] flex items-center justify-center">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00B14F] to-[#fff] rounded-lg blur opacity-60 group-hover:opacity-80 transition duration-300"></div>
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="relative w-[250px] h-[400px] object-cover rounded-lg shadow-xl transform transition-all duration-500 group-hover:scale-[1.02]"
              />
              
              {/* Tech overlay on images */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 rounded-lg"></div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMCBMNDAgNDAgTTQwIDAgTDAgNDAiIHN0cm9rZT0icmdiYSgwLCAxNzcsIDc5LCAwLjA3KSIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-40 rounded-lg"></div>
              
              {/* Tech corners */}
              <div className="absolute top-2 left-2 w-5 h-5 border-t border-l border-[#00B14F]/60"></div>
              <div className="absolute top-2 right-2 w-5 h-5 border-t border-r border-blue-400/60"></div>
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b border-r border-[#00B14F]/60"></div>
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b border-l border-blue-400/60"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#00B14F]/20 backdrop-blur-md p-2 rounded-full hover:bg-[#00B14F]/40 transition-all z-20 border border-[#00B14F]/30"
      >
        <svg className="w-5 h-5 text-[#00884c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#00B14F]/20 backdrop-blur-md p-2 rounded-full hover:bg-[#00B14F]/40 transition-all z-20 border border-[#00B14F]/30"
      >
        <svg className="w-5 h-5 text-[#00884c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-8 rounded-sm transition-all ${
              currentIndex === index 
                ? 'bg-gradient-to-t from-[#00B14F] to-[#3694ff] scale-y-100' 
                : 'bg-black/20 scale-y-50'
            }`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-4 right-4 bg-white/60 backdrop-blur-md text-gray-800 px-3 py-1 rounded-md text-xs font-mono border border-[#00B14F]/20 z-20">
        <span className="text-[#00B14F] font-bold">{currentIndex + 1}</span>
        <span className="text-gray-600"> / {images.length}</span>
      </div>
      
      {/* Tech label */}
      <div className="absolute top-4 left-4 bg-white/60 backdrop-blur-md text-xs font-mono border border-[#00B14F]/20 rounded-md px-2 py-1 z-20">
        <span className="text-[#00B14F] font-bold">SHOOP</span>
        <span className="text-gray-600">.connect()</span>
      </div>
    </div>
  );
};

export default Carousel;