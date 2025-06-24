import React from 'react';
import { Bus, Plane, Train, Ship } from 'lucide-react';

const TransportationLoader = ({ type }) => {
  switch (type) {
    case 'bus':
      return <Bus  className="text-orange-500" 
                  size={64} 
                  strokeWidth={1.5}  />;
    case 'plane':
      return <Plane  className="text-orange-500" 
            size={64} 
            strokeWidth={1.5}  />;
    case 'train':
      return <Train  className="text-orange-500" 
            size={64} 
            strokeWidth={1.5}  />;
    case 'boat':
      return <Ship  className="text-orange-500" 
            size={64} 
            strokeWidth={1.5}  />;
    default:
      return <Bus  className="text-orange-500" 
            size={64} 
            strokeWidth={1.5}  />; // Default to bus if type is not recognized
  }
};

export default TransportationLoader;
