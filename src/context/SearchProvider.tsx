'use client';

import React, {createContext, useContext, useState, ReactNode} from 'react';

interface SearchContextType {
    setSearchHandler: (handler: (query: string) => void) => void;
    clearSearchHandler: () => void;
    searchHandler: ((query: string) => void) | null;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({children}: { children: ReactNode }) => {
    const [searchHandler, setSearchHandler] = useState<((query: string) => void) | null>(null);

    const setSearchHandlerWrapper = (handler: (query: string) => void) => {
        setSearchHandler(() => handler);
    };

    const clearSearchHandler = () => {
        setSearchHandler(() => null);
    };

    return (
        <SearchContext.Provider value={{setSearchHandler: setSearchHandlerWrapper, clearSearchHandler, searchHandler}}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) throw new Error("useSearch must be used within a SearchProvider");
    return context;
};

export const useSearchHandler = () => {
    const context = useContext(SearchContext);
    return context?.searchHandler;
};