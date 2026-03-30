import React from 'react';

const Alert = ({ type = 'info', title, message, onClose, className = '' }) => {
  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  return (
    <div className={`border-l-4 p-4 mb-4 ${typeClasses[type]} ${className}`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <span className="text-xl mr-3">{icons[type]}</span>
          <div>
            {title && <h4 className="font-semibold mb-1">{title}</h4>}
            <p className="text-sm">{message}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 ml-4"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;