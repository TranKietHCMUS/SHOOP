import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import ProcessingRequest from '../components/ProcessingRequest';

const Result = () => {
  const [results, setResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const searchData = location.state?.searchData;

  useEffect(() => {
    
    if (!searchData) {
        navigate('/error', {
            state: {
                statusCode: 400,
                message: 'Loss of data'
            }
        });
    }

    const fetchResults = async () => {
      try {
        // Giả lập API call
        const mockApiCall = () => new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: [
                {
                  name: "Cửa hàng A",
                  description: "Cửa hàng tạp hóa",
                  address: "123 Đường ABC",
                  distance: 2.5
                },
                {
                  name: "Cửa hàng B",
                  description: "Siêu thị mini",
                  address: "456 Đường XYZ",
                  distance: 3.1
                }
              ]
            });
          }, 15000);
        });

        const response = await mockApiCall();
        // const response = await axios.post('http://127.0.0.1:5000/user/search', searchData);

          toast.success('Results found!', {
            duration: 2000,
            position: 'top-center',
            style: {
              background: '#00B14F',
              color: '#fff',
            },
          });

        setResults(response.data);
        setIsProcessing(false);
      } catch (error) {
          toast.error('Error occurred while searching. Please try again later.', {
            duration: 2000,
            position: 'top-center',
            style: {
              background: 'red',
              color: '#fff',
            },
            icon: '🚫',
          });
        navigate('/');
      }
    };

    fetchResults();
  }, [searchData, navigate]);

  return (
    <>
      <Toaster />
      {isProcessing ? (
        <ProcessingRequest message="The system is searching for stores that match your request" />
      ) : (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Result</h1>
              
              {results && results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-lg mb-2">{result.name}</h3>
                      <p className="text-gray-600 mb-2">{result.description}</p>
                      <div className="text-sm text-gray-500">
                        <p>Address: {result.address}</p>
                        <p>Distance: {result.distance}km</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-600">
                  <p>No results found.</p>
                </div>
              )}

              <div className="mt-8 text-center">
                <button
                  onClick={() => navigate('/')}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Search again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Result; 