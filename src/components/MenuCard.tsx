import React from 'react';
import { MenuItem } from '../types';

interface MenuCardProps {
  item: MenuItem;
  onClick: () => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({ item, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md"
    >
      <div className="aspect-square relative overflow-hidden">
        <img
          src={item.photo || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {!item.available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Unavailable</span>
          </div>
        )}
        {item.preparation_time > 0 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            {item.preparation_time}min
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
          {item.name}
        </h3>
        <p className="text-gray-600 text-xs mb-2 line-clamp-2">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-green-600 text-lg">
            ${item.price.toFixed(2)}
          </span>
          {item.popularity_score > 0 && (
            <div className="flex items-center text-yellow-500 text-xs">
              <span>⭐</span>
              <span className="ml-1">{item.popularity_score}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};