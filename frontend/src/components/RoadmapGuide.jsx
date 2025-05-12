import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RoadmapGuide = () => {
  const [hoveredImage, setHoveredImage] = useState(null);
  const [touchedImage, setTouchedImage] = useState(null);

  const steps = [
    {
      title: 'Register & Login',
      description: 'Create a new account or login to use the full features of the website.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 sm:size-6">
        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
        </svg>
      ),
      color: '#FF6B6B', // Red color
      hoverImage: '/imgs/guide-login.png' // Replace with actual image path
    },
    {
      title: 'Manage Profile',
      description: 'Update your personal information and view your search history in the "Profile" page.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 sm:size-6">
        <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
        </svg>

      ),
      color: '#4ECDC4', // Blue color
      hoverImage: '/imgs/guide-profile.png' // Replace with actual image path
    },
    {
      title: 'Start Searching',
      description: 'Enter the necessary information and search for stores near you.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 sm:size-6">
        <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
        </svg>

      ),
      color: '#FF8C42', // Orange color
      hoverImage: '/imgs/guide-search.jpg' // Replace with actual image path
    },
    {
      title: 'View Store Information',
      description: 'Click on the store marker on the map to view detailed information, location, and products available satisfied with your needs.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 sm:size-6">
        <path d="M5.223 2.25c-.497 0-.974.198-1.325.55l-1.3 1.298A3.75 3.75 0 0 0 7.5 9.75c.627.47 1.406.75 2.25.75.844 0 1.624-.28 2.25-.75.626.47 1.406.75 2.25.75.844 0 1.623-.28 2.25-.75a3.75 3.75 0 0 0 4.902-5.652l-1.3-1.299a1.875 1.875 0 0 0-1.325-.549H5.223Z" />
        <path fillRule="evenodd" d="M3 20.25v-8.755c1.42.674 3.08.673 4.5 0A5.234 5.234 0 0 0 9.75 12c.804 0 1.568-.182 2.25-.506a5.234 5.234 0 0 0 2.25.506c.804 0 1.567-.182 2.25-.506 1.42.674 3.08.675 4.5.001v8.755h.75a.75.75 0 0 1 0 1.5H2.25a.75.75 0 0 1 0-1.5H3Zm3-6a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75v-3Zm8.25-.75a.75.75 0 0 0-.75.75v5.25c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-5.25a.75.75 0 0 0-.75-.75h-3Z" clipRule="evenodd" />
        </svg>

      ),
      color: '#FFD166', // Yellow color
      hoverImage: '/imgs/guide-store.jpg' // Replace with actual image path
    },
    {
      title: 'Route Recommendations',
      description: 'Click on the next button to receive recommended routes based on your preferences.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 sm:size-6">
        <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
        </svg>
      
      ),
      color: '#9932CC', // Purple color
      hoverImage: '/imgs/guide-routes.jpg' // Replace with actual image path
    },
    {
      title: 'Route Details',
      description: 'Click on a route to see detailed information. There are 3 types of routes: shortest, fastest, and most economical, all ensuring you get the products you want.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 sm:size-6">
  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
</svg>

      ),
      color: '#00B14F', // Green color
      hoverImage: '/imgs/guide-details.jpg' // Replace with actual image path
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 50
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  // Handle touch for mobile devices
  const handleTouch = (image) => {
    if (touchedImage === image) {
      setTouchedImage(null);
    } else {
      setTouchedImage(image);
    }
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 relative">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How To Use</h2>
          <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-2">
            A simple process to help you find products and stores efficiently
          </p>
        </motion.div>

        {/* Hover/Touch Image Display */}
        <AnimatePresence>
          {(hoveredImage || touchedImage) && (
            <motion.div 
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
              variants={imageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="bg-white p-2 rounded-lg shadow-xl">
                <img 
                  src={hoveredImage || touchedImage} 
                  alt="Guide illustration" 
                  className="w-full max-w-[80vw] md:max-w-md h-auto rounded"
                  style={{ maxHeight: "350px", objectFit: "contain" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Curved Arrow Pointing to First Icon - Only visible on desktop */}
        <div className="absolute z-10 hidden md:block animate-pulse">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
            >
                <div className='text-primary'>Hover into icons</div>
          </motion.div>
        </div>

        {/* Mobile instruction - Only visible on mobile */}
        <div className="text-center mb-4 md:hidden">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-primary text-sm animate-pulse"
          >
            Tap on icons to see examples
          </motion.p>
        </div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative mt-10 sm:mt-20"
        >
          {/* Road Path - Only visible on tablet and larger screens */}
          <div className="absolute left-0 right-0 h-4 top-24 md:top-28 bg-gray-800 rounded-full hidden md:block" style={{ zIndex: 0 }}>
            <div className="w-full h-full relative overflow-hidden rounded-full">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 left-0 h-full bg-gray-800"
              >
                <div className="absolute top-1/2 left-3 right-4 h-1 bg-white opacity-50 transform -translate-y-1/2" 
                  style={{ 
                    backgroundImage: "linear-gradient(90deg, transparent, transparent 50%, white 50%, white)",
                    backgroundSize: "20px 100%"
                  }}
                ></div>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-6 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex flex-col items-center"
              >
                {/* Icon on the road */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => setHoveredImage(step.hoverImage)}
                  onHoverEnd={() => setHoveredImage(null)}
                  onClick={() => handleTouch(step.hoverImage)}
                  className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-white text-3xl mb-3 sm:mb-4 shadow-lg cursor-pointer"
                  style={{ backgroundColor: step.color }}
                >
                  <span>{step.icon}</span>
                </motion.div>
                
                {/* Connecting curve (mobile only) */}
                {index < steps.length - 1 && (
                  <div className="h-10 sm:h-16 w-1 bg-gray-800 my-1 sm:my-2 md:hidden flex items-center justify-center">
                    <div className="w-full h-full relative">
                      <div className="absolute left-0 w-full h-full flex items-center">
                        <div className="w-1 h-full bg-white opacity-50" 
                          style={{ 
                            backgroundImage: "linear-gradient(0deg, transparent, transparent 50%, white 50%, white)",
                            backgroundSize: "100% 10px"
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Content */}
                <motion.div 
                  className={`bg-white p-2 sm:p-3 md:p-4 rounded-lg shadow-md w-full text-center ${index % 2 === 0 ? 'md:mt-16' : 'md:mb-16'}`}
                  whileHover={{ 
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    y: -5
                  }}
                >
                  <h3 className="font-bold text-sm sm:text-base md:text-md mb-1 md:mb-2" style={{ color: step.color }}>{step.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">{step.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RoadmapGuide; 