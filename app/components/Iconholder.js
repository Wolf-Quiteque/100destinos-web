import React from 'react';
import { Bus, Plane, Train, Ship } from 'lucide-react';

const Iconholder = ({ type }) => {
  switch (type) {
    case 'bus':
      return <Bus  className="text-orange-500 mb-2" 
                    />;
    case 'plane':
      return <Plane  className="text-orange-500 mb-2" 
              />;
    case 'train':
      return <Train  className="text-orange-500 mb-2" 
              />;
    case 'boat':
      return <Ship  className="text-orange-500 mb-2" 
              />;
    default:
      return <Bus  className="text-orange-500 mb-2" 
              />;
               // Default to bus if type is not recognized
  }
};

export default Iconholder;
