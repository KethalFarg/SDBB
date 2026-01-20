
import { useState, useEffect } from 'react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-lg transition-all duration-300">
      <div className="max-w-6xl mx-auto px-8 py-4">
        <div className="flex items-center justify-center">
          {!isScrolled ? (
            <h1 className="text-2xl font-bold text-[#2991ab] transition-all duration-300">
              Your Pain Profile
            </h1>
          ) : (
            <div className="transition-all duration-300">
              {/* Desktop logo */}
              <img 
                src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/524b7454-9d10-42b6-5581-8c3056809000/public"
                alt="Better Joint Logo"
                className="h-12 hidden md:block"
              />
              {/* Mobile logo */}
              <img 
                src="https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/c8cb1f6c-850e-4e7f-d538-7c85435d7200/public"
                alt="Better Joint Mobile Logo"
                className="h-12 md:hidden"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
