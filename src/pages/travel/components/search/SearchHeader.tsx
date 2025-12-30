import { useState } from 'react';

interface SearchHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onSearch: () => void;
}

export const SearchHeader = ({ searchQuery, setSearchQuery, onSearch }: SearchHeaderProps) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchFocus, setSearchFocus] = useState(false);

    const searchSuggestions = [
        'Restaurantes em São Paulo',
        'Hotéis no Rio de Janeiro',
        'Praias em Florianópolis',
        'Museus em Salvador',
        'Parques em Curitiba'
    ];

    const handleSearch = () => {
        onSearch();
        setShowSuggestions(false);
    };

    return (
        <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
                        Para onde você quer ir?
                    </h1>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600">
                        Encontre passagens, hospedagens e experiências incríveis
                    </p>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border-2 border-gray-200 p-3 sm:p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <div className="relative">
                                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowSuggestions(e.target.value.length > 0);
                                    }}
                                    onFocus={() => setSearchFocus(true)}
                                    onBlur={() => setTimeout(() => setSearchFocus(false), 200)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearch();
                                        }
                                    }}
                                    placeholder="Buscar destinos, hotéis, atividades..."
                                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-700"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setShowSuggestions(false);
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <i className="ri-close-line text-lg"></i>
                                    </button>
                                )}
                            </div>

                            {showSuggestions && searchFocus && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-10 overflow-hidden">
                                    {searchSuggestions
                                        .filter(suggestion =>
                                            suggestion.toLowerCase().includes(searchQuery.toLowerCase())
                                        )
                                        .map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setSearchQuery(suggestion);
                                                    setShowSuggestions(false);
                                                    setTimeout(() => onSearch(), 0); // Ensure state updates before search
                                                }}
                                                className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0"
                                            >
                                                <i className="ri-map-pin-line text-orange-500"></i>
                                                <span className="text-gray-700">{suggestion}</span>
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSearch}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all whitespace-nowrap"
                        >
                            <i className="ri-search-line mr-2"></i>
                            Buscar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
