import React from 'react';

const MaidCard = ({ maid, onBook }) => {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{maid.name}</h3>
                        <div className="flex items-center mt-1">
                            <span className="text-yellow-500 mr-1">★</span>
                            <span className="font-medium text-gray-700">{maid.rating.toFixed(1)}</span>
                            <span className="text-gray-500 text-sm ml-1">({maid.totalReviews} reviews)</span>
                        </div>
                    </div>
                    {maid.distance !== undefined && maid.distance !== null && (
                        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                            {maid.distance.toFixed(1)} km away
                        </div>
                    )}
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                        <span className="font-medium mr-2">Rate:</span>
                        <span>${maid.hourlyRate}/hr</span>
                    </div>
                    
                    <div>
                        <span className="block font-medium text-gray-600 mb-1">Services:</span>
                        <div className="flex flex-wrap gap-2">
                            {maid.serviceTypes.map((service, index) => (
                                <span 
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                                >
                                    {service}
                                </span>
                            ))}
                        </div>
                    </div>

                    {maid.isAvailableToday ? (
                         <div className="flex items-center text-green-600 text-sm font-medium">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Available Today
                        </div>
                    ) : (
                        <div className="flex items-center text-gray-500 text-sm">
                             <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                            Not Available Today
                        </div>
                    )}
                </div>

                <button
                    onClick={() => onBook(maid.id)}
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 font-medium"
                >
                    View & Book
                </button>
            </div>
        </div>
    );
};

export default MaidCard;
