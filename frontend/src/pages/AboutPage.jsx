import React from 'react';
import Header from '../components/Header';
import { motion } from 'framer-motion';
import SimpleFooter from '../components/SimpleFooter';

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Lý Nguyên Thùy Linh',
      role: 'Full Stack Developer',
      avatar: '/imgs/3-min.jpg',
      bio: 'A dedicated Full Stack Developer and AI Engineer with a strong passion for integrating Artificial Intelligence into modern web applications. Committed to delivering innovative, efficient, and scalable solutions across the tech stack.'
    },
    {
      name: 'Lê Nguyễn Tấn Phát',
      role: 'Backend Developer',
      avatar: '/imgs/phat.jpg',
      bio: 'A highly motivated Backend Developer with a passion for designing and building robust, scalable, and high-performance backend systems. Eager to tackle complex challenges and contribute to impactful technology solutions.'
    },
    {
      name: 'Trần Như Anh Kiệt',
      role: 'Data Engineer',
      avatar: '/imgs/kiet.jpg',
      bio: 'A passionate Data Engineer skilled in designing and implementing scalable, efficient data pipelines. Driven by a desire to transform raw data into valuable insights that support data-driven decision-making.'
    }
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const pulseAnimation = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    }
  };

  const hoverEffect = {
    scale: 1.05,
    boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
    transition: { duration: 0.3 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light to-[#C8E6D0]">
      <Header />
      
      <motion.main 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Phần giới thiệu */}
        <motion.section 
          className="mb-16"
          variants={fadeInUp}
        >
          <motion.h1 
            className="text-3xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            About Us
          </motion.h1>
          <motion.div 
            className="bg-white rounded-xl shadow-md p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            whileHover={{ 
              boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
              transition: { duration: 0.3 }
            }}
          >
            <motion.h2 
              className="text-2xl font-semibold text-gray-800 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Our Mission
            </motion.h2>
            <motion.p 
              className="text-gray-600 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
                SHOOP is a platform that helps you find the best routes to get all the products you want.
                We provide you with the shortest, fastest and most economical routes to get all the products you want.
                We also provide you with the information about the stores and products in that store.
                We hope you will have a good experience with our website.
            </motion.p>
            <motion.p 
              className="text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              With SHOOP, finding and accessing convenient stores has become easier, faster and more efficient. 
              We promise to bring the best experience for users.
            </motion.p>
          </motion.div>
        </motion.section>
        
        {/* Phần giới thiệu team */}
        <motion.section 
          className="mb-16"
          variants={fadeInUp}
        >
          <motion.h2 
            className="text-2xl font-bold text-gray-900 mb-6"
            variants={fadeInUp}
          >
            Our Team
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
          >
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index} 
                className="bg-white rounded-xl shadow-md overflow-hidden"
                variants={pulseAnimation}
                whileHover={hoverEffect}
              >
                <motion.img 
                  src={member.avatar} 
                  alt={member.name} 
                  className="w-full h-80 object-cover"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                />
                <motion.div 
                  className="p-5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <motion.h3 
                    className="text-xl font-semibold text-gray-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    {member.name}
                  </motion.h3>
                  <motion.p 
                    className="text-[#00B14F] font-medium mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  >
                    {member.role}
                  </motion.p>
                  <motion.p 
                    className="text-gray-600 mt-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  >
                    {member.bio}
                  </motion.p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </motion.main>
      <SimpleFooter />
    </div>
  );
};

export default AboutPage; 