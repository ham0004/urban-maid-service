import React from 'react';

const MaidCard = ({ maid, onBook, isFavorite = false, onToggleFavorite }) => {
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
                    <div className="flex items-center space-x-2">
                        {maid.distance !== undefined && maid.distance !== null && (
                            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                {maid.distance.toFixed(1)} km away
                            </div>
                        )}
                        {onToggleFavorite && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite(maid.id);
                                }}
                                className="text-red-500 hover:text-red-700 transition"
                                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill={isFavorite ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    {/* Years of Experience */}
                    {maid.experience !== undefined && maid.experience > 0 && (
                        <div className="flex items-center text-gray-600">
                            <span className="font-medium mr-2">💼 Experience:</span>
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-sm font-medium">
                                {maid.experience} year{maid.experience !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}

                    {/* Services */}
                    <div>
                        <span className="block font-medium text-gray-600 mb-1">Services:</span>
                        <div className="flex flex-wrap gap-2">
                            {maid.serviceTypes && maid.serviceTypes.length > 0 ? (
                                maid.serviceTypes.map((service, index) => (
                                    <span
                                        key={index}
                                        className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-md font-medium"
                                    >
                                        {service}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400 text-sm">No services listed</span>
                            )}
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
