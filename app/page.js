'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bus, Plane, Train, Ship, Calendar, User, Search, Percent, Umbrella, Briefcase, Heart, Bookmark } from 'lucide-react'; // Import Lucide icons
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // Import Supabase client
import { useAuth } from '../context/AuthContext'; // Import useAuth
import './style.css'; // Import the new CSS file
import ReactDOM from 'react-dom'; // Import ReactDOM for dynamic rendering

export default function Home() { // Renamed to Home as per user's move
    const router = useRouter();
    const { session } = useAuth(); // Get session from useAuth
    const [currentHeaderBg, setCurrentHeaderBg] = useState(0);
    const [activeTab, setActiveTab] = useState('bus'); // Default active tab

    // State for form elements
    const [fromPlaceholder, setFromPlaceholder] = useState('De (Autocarro)');
    const [toPlaceholder, setToPlaceholder] = useState('Para (Autocarro)');
    const [searchBtnText, setSearchBtnText] = useState('Pesquisar Autocarros');
    const [FromIconComponent, setFromIconComponent] = useState(() => Bus);
    const [ToIconComponent, setToIconComponent] = useState(() => Bus);
    const [SearchButtonIconComponent, setSearchButtonIconComponent] = useState(() => Search);

    // New state for search functionality
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [fromSuggestions, setFromSuggestions] = useState([]);
    const [toSuggestions, setToSuggestions] = useState([]);
    const [allBusRoutes, setAllBusRoutes] = useState([]);
    const [selectedRouteType, setSelectedRouteType] = useState(null); // 'Urbano' or 'Interprovincial'
    const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
    const [departureDate, setDepartureDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [isRoundTrip, setIsRoundTrip] = useState(false);
    const [currentAdIndex, setCurrentAdIndex] = useState(0); // New state for ad slideshow

    const supabase = createClientComponentClient(); // Initialize Supabase client

    const headerBackgrounds = [
        '/bg/bg1.webp',
        '/bg/bg2.webp',
        '/bg/bg3.webp',
    ];

    const popularRouteImages = [
        '/img/img1.jpg',
        '/img/img2.jpg',
        '/img/img3.jpg',
    ];

    // Header background slideshow
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHeaderBg((prev) => (prev + 1) % headerBackgrounds.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [headerBackgrounds.length]);

    // Fetch bus routes from Supabase
    useEffect(() => {
        const fetchBusRoutes = async () => {
            setIsLoadingRoutes(true);
            const { data, error } = await supabase
                .from('bus_routes')
                .select('origin, destination, urbano'); // Select relevant fields

            if (error) {
                console.error('Error fetching bus routes:', error);
            } else {
                setAllBusRoutes(data);
            }
            setIsLoadingRoutes(false);
        };

        fetchBusRoutes();
    }, [supabase]);

    // Initialize selectedRouteType from localStorage and filter initial suggestions
    useEffect(() => {
        const userSelectedType = localStorage.getItem('userSelect');
        if (userSelectedType) {
            setSelectedRouteType(userSelectedType);
            // Initialize suggestions based on the selected type
            const filteredRoutes = allBusRoutes.filter(route => 
                userSelectedType === 'Urbano' ? route.urbano : !route.urbano
            );
            const origins = [...new Set(filteredRoutes.map(route => route.origin))];
            setFromSuggestions(origins);
            // Destinations will be filtered based on selected origin later
        }
    }, [allBusRoutes]); // Depend on allBusRoutes to ensure data is loaded

    // Ad slideshow effect
    const adImages = [
        '/img/img1.jpg',
        '/img/img2.jpg',
        '/img/img3.jpg',
    ];

    useEffect(() => {
        const adInterval = setInterval(() => {
            setCurrentAdIndex((prev) => (prev + 1) % adImages.length);
        }, 4000); // Change ad every 4 seconds
        return () => clearInterval(adInterval);
    }, [adImages.length]);

    const handleTabClick = (type) => {
        setActiveTab(type);
        // Reset search inputs and suggestions when tab changes
        setFromLocation('');
        setToLocation('');
        setFromSuggestions([]);
        setToSuggestions([]);
        setSelectedRouteType(null); // Reset route type until a bus type is selected
        setDepartureDate(''); // Reset date inputs
        setReturnDate('');
        setIsRoundTrip(false); // Reset trip type

        switch (type) {
            case 'bus':
                setFromPlaceholder('De (Autocarro)');
                setToPlaceholder('Para (Autocarro)');
                setSearchBtnText('Pesquisar Autocarros');
                setFromIconComponent(() => Bus);
                setToIconComponent(() => Bus);
                setSearchButtonIconComponent(() => Search);
                // Re-initialize suggestions for bus type
                const userSelectedType = localStorage.getItem('userSelect'); // Assuming this is set from previous page
                if (userSelectedType) {
                    setSelectedRouteType(userSelectedType);
                    const filteredRoutes = allBusRoutes.filter(route => 
                        userSelectedType === 'Urbano' ? route.urbano : !route.urbano
                    );
                    const origins = [...new Set(filteredRoutes.map(route => route.origin))];
                    setFromSuggestions(origins);
                }
                break;
            case 'airplane':
                setFromPlaceholder('Origem (Avião)');
                setToPlaceholder('Destino (Avião)');
                setSearchBtnText('Pesquisar Voos');
                setFromIconComponent(() => Plane);
                setToIconComponent(() => Plane);
                setSearchButtonIconComponent(() => Search);
                setSelectedRouteType(null); // Clear route type for non-bus searches
                break;
            case 'train':
                setFromPlaceholder('Estação de Partida (Comboio)');
                setToPlaceholder('Estação de Chegada (Comboio)');
                setSearchBtnText('Pesquisar Comboios');
                setFromIconComponent(() => Train);
                setToIconComponent(() => Train);
                setSearchButtonIconComponent(() => Search);
                setSelectedRouteType(null); // Clear route type for non-bus searches
                break;
            case 'boat':
                setFromPlaceholder('Porto de Partida (Barco)');
                setToPlaceholder('Porto de Chegada (Barco)');
                setSearchBtnText('Pesquisar Barcos');
                setFromIconComponent(() => Ship);
                setToIconComponent(() => Ship);
                setSearchButtonIconComponent(() => Search);
                setSelectedRouteType(null); // Clear route type for non-bus searches
                break;
            default:
                break;
        }
    };

    const handleFromChange = (e) => {
        const value = e.target.value;
        setFromLocation(value);
        if (selectedRouteType && allBusRoutes.length > 0) {
            const filteredRoutes = allBusRoutes.filter(route => 
                (selectedRouteType === 'Urbano' ? route.urbano : !route.urbano) &&
                route.origin.toLowerCase().includes(value.toLowerCase())
            );
            const origins = [...new Set(filteredRoutes.map(route => route.origin))];
            setFromSuggestions(origins);
        }
    };

    const handleToChange = (e) => {
        const value = e.target.value;
        setToLocation(value);
        if (selectedRouteType && fromLocation && allBusRoutes.length > 0) {
            const validDestinations = allBusRoutes.filter(route =>
                (selectedRouteType === 'Urbano' ? route.urbano : !route.urbano) &&
                route.origin === fromLocation &&
                route.destination.toLowerCase().includes(value.toLowerCase())
            ).map(route => route.destination);
            setToSuggestions([...new Set(validDestinations)]);
        }
    };

    const handleSelectSuggestion = (field, value) => {
        if (field === 'from') {
            setFromLocation(value);
            setFromSuggestions([]); // Clear suggestions
            // When origin is selected, filter destinations
            if (selectedRouteType && allBusRoutes.length > 0) {
                const validDestinations = allBusRoutes.filter(route =>
                    (selectedRouteType === 'Urbano' ? route.urbano : !route.urbano) &&
                    route.origin === value
                ).map(route => route.destination);
                setToSuggestions([...new Set(validDestinations)]);
            }
        } else {
            setToLocation(value);
            setToSuggestions([]); // Clear suggestions
        }
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        if (activeTab === 'bus' && fromLocation && toLocation) {
            console.log(`Searching for bus from ${fromLocation} to ${toLocation} (${selectedRouteType})`);
            // Pass selected locations to localStorage for bilhetes/page.js
            localStorage.setItem('searchFrom', fromLocation);
            localStorage.setItem('searchTo', toLocation);
            localStorage.setItem('searchDate', departureDate); // Pass departure date
            localStorage.setItem('isRoundTrip', isRoundTrip.toString()); // Pass round trip status
            if (isRoundTrip) {
                localStorage.setItem('returnDate', returnDate); // Pass return date if round trip
            } else {
                localStorage.removeItem('returnDate'); // Clear return date if not round trip
            }
            localStorage.setItem('userSelect', selectedRouteType); // Ensure route type is passed
            router.push('/bilhetes');
        } else {
            console.log(`Searching for ${activeTab} (no specific functionality yet)`);
            // For other types, simulate existing logic
            localStorage.setItem('userSelect', activeTab === 'bus' ? 'Interprovincial' : 'Nacional'); // Example value
            router.push('/pesquisar'); // This will likely need to be adjusted based on actual search route
        }
    };

    return (
        <>
            <header className="header">
                {/* Background images that will fade */}
                {headerBackgrounds.map((img, index) => (
                    <div
                        key={img}
                        className={`header-bg ${index === currentHeaderBg ? 'active' : ''}`}
                        style={{ backgroundImage: `url(${img})` }}
                    ></div>
                ))}
                <div className="header-overlay"></div> {/* Dark overlay */}
                
                <div className="header-content">
                    <div className="header-top">
                        {/* Main Logo */}
                        <Image
                            src="/logo/logoff.webp"
                            alt="Logo"
                            width={150} // Larger width
                            height={90} // Larger height
                            className="logo" // Use the .logo class for styling
                        />
                        {/* Angola 50 Anos Logo - Centered */}
                        <div className="angola-logo-center">
                            <Image
                                src="/logo/ANGOLA-50-ANOS.png"
                                alt="Angola 50 Anos Logo"
                                width={160} // Adjust size as needed
                                height={160} // Adjust size as needed
                                className="object-contain"
                            />
                        </div>
                        <div
                            className="avatar"
                            onClick={() => !session && router.push('/login')} // Navigate to login if not authenticated
                            style={{ cursor: session ? 'default' : 'pointer' }} // Change cursor for unauthenticated state
                        >
                            {session ? (
                                session.user?.user_metadata?.full_name ? session.user.user_metadata.full_name.charAt(0).toUpperCase() : 'JS'
                            ) : (
                                <User size={24} /> // Lucide User icon when not authenticated
                            )}
                        </div>
                    </div>
                </div>
            </header>
            
            <div className="search-card">
                <div className="search-tabs">
                    <div className={`tab ${activeTab === 'bus' ? 'active' : ''}`} onClick={() => handleTabClick('bus')} data-type="bus"><Bus size={20} /></div>
                    <div className={`tab ${activeTab === 'airplane' ? 'active' : ''}`} onClick={() => handleTabClick('airplane')} data-type="airplane"><Plane size={20} /></div>
                    <div className={`tab ${activeTab === 'train' ? 'active' : ''}`} onClick={() => handleTabClick('train')} data-type="train"><Train size={20} /></div>
                    <div className={`tab ${activeTab === 'boat' ? 'active' : ''}`} onClick={() => handleTabClick('boat')} data-type="boat"><Ship size={20} /></div>
                </div>
                
                <form className="search-form" onSubmit={handleSearchSubmit}>
                    <div className="form-group">
                        <div className="icon-wrapper">
                            {FromIconComponent && <FromIconComponent size={20} />}
                        </div>
                        <input
                            type="text"
                            className="form-control"
                            placeholder={fromPlaceholder}
                            value={fromLocation}
                            onChange={handleFromChange}
                        />
                        {fromSuggestions.length > 0 && fromLocation && (
                            <ul className="suggestions-list">
                                {fromSuggestions.map((suggestion) => (
                                    <li key={suggestion} onClick={() => handleSelectSuggestion('from', suggestion)}>
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <div className="icon-wrapper">
                            {ToIconComponent && <ToIconComponent size={20} />}
                        </div>
                        <input
                            type="text"
                            className="form-control"
                            placeholder={toPlaceholder}
                            value={toLocation}
                            onChange={handleToChange}
                        />
                        {toSuggestions.length > 0 && toLocation && (
                            <ul className="suggestions-list">
                                {toSuggestions.map((suggestion) => (
                                    <li key={suggestion} onClick={() => handleSelectSuggestion('to', suggestion)}>
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <div className="icon-wrapper">
                            <Calendar size={20} />
                        </div>
                        <input
                            type="date"
                            className="form-control"
                            placeholder="Partida"
                            value={departureDate}
                            onChange={(e) => setDepartureDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div className="trip-type-buttons">
                        <button
                            type="button"
                            className={`trip-type-btn ${!isRoundTrip ? 'active' : 'dull'}`}
                            onClick={() => setIsRoundTrip(false)}
                        >
                            Ida
                        </button>
                        <button
                            type="button"
                            className={`trip-type-btn ${isRoundTrip ? 'active' : 'dull'}`}
                            onClick={() => setIsRoundTrip(true)}
                        >
                            Ida e Volta
                        </button>
                    </div>
                    
                    {isRoundTrip && (
                        <div className="form-group">
                            <div className="icon-wrapper">
                                <Calendar size={20} />
                            </div>
                            <input
                                type="date"
                                className="form-control"
                                placeholder="Regresso"
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                min={departureDate || new Date().toISOString().split('T')[0]}
                                required={isRoundTrip} // Required only if round trip
                            />
                        </div>
                    )}
                    
                    <div className="form-group">
                        <div className="icon-wrapper">
                            <User size={20} />
                        </div>
                        <input type="text" className="form-control" placeholder="1 Adulto, Economia" />
                    </div>

                    <button type="submit" className="search-btn">
                        {SearchButtonIconComponent && <SearchButtonIconComponent size={20} />} {searchBtnText}
                    </button>
                </form>
            </div>
            
            <div className="container">
                {/* Quick Actions */}
                <div className="section-title">
                    Ações Rápidas
                    <a href="#" className="see-all">Ver tudo</a>
                </div>
                
                <div className="quick-actions">
                <div className="action-card">
                    <div className="action-icon">
                        <Search size={20} />
                    </div>
                    <div className="action-title">Última Hora</div>
                </div>
                
                <div className="action-card">
                    <div className="action-icon">
                        <Percent size={20} />
                    </div>
                    <div className="action-title">Promoções</div>
                </div>
                
                <div className="action-card">
                    <div className="action-icon">
                        <Umbrella size={20} />
                    </div>
                    <div className="action-title">Férias</div>
                </div>
                
                <div className="action-card">
                    <div className="action-icon">
                        <Briefcase size={20} />
                    </div>
                    <div className="action-title">Negócios</div>
                </div>
                
                <div className="action-card">
                    <div className="action-icon">
                        <Heart size={20} />
                    </div>
                    <div className="action-title">Guardados</div>
                </div>
                </div>

                {/* Ads Section */}
                <div className="section-title">
                    Publicidade
                </div>
                <div className="ads-carousel">
                    {adImages.map((img, index) => (
                        <div
                            key={img}
                            className={`ad-slide ${index === currentAdIndex ? 'active' : ''}`}
                            style={{ backgroundImage: `url(${img})` }}
                        ></div>
                    ))}
                </div>
                
                {/* Popular Routes */}
                <div className="section-title">
                    Rotas Populares
                    <a href="#" className="see-all">Ver tudo</a>
                </div>
                
                <div className="popular-routes">
                    <div className="route-card">
                        <div className="route-image" style={{ backgroundImage: `url(${popularRouteImages[0]})` }}></div>
                        <div className="route-info">
                            <div>
                                <div className="route-cities">Luanda → Benguela</div>
                                <div className="route-details">Voo Direto · 1h 30m</div>
                            </div>
                            <div className="route-price">2000 kz <span>ida e volta</span></div>
                        </div>
                        <div className="bookmark">
                            <Bookmark size={12} />
                        </div>
                    </div>
                    
                    <div className="route-card">
                        <div className="route-image" style={{ backgroundImage: `url(${popularRouteImages[1]})` }}></div>
                        <div className="route-info">
                            <div>
                                <div className="route-cities">Huambo → Lobito</div>
                                <div className="route-details">Autocarro · 4h 15m</div>
                            </div>
                            <div className="route-price">5000 kz <span>só ida</span></div>
                        </div>
                        <div className="bookmark">
                            <Bookmark size={12} />
                        </div>
                    </div>
                    
                    <div className="route-card">
                        <div className="route-image" style={{ backgroundImage: `url(${popularRouteImages[2]})` }}></div>
                        <div className="route-info">
                            <div>
                                <div className="route-cities">Cabinda → Soyo</div>
                                <div className="route-details">1 Paragem · 3h 50m</div>
                            </div>
                            <div className="route-price">7000 kz <span>ida e volta</span></div>
                        </div>
                        <div className="bookmark">
                            <Bookmark size={12} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
