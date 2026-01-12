
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, SearchIcon, CloseIcon } from './icons';

interface Option {
    value: string;
    label: string;
    category?: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    required?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Selecione...",
    label,
    disabled = false,
    required = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Encontra a opção selecionada atualmente para exibir o label correto
    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Foca no input quando abre
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
        setSearchTerm('');
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setSearchTerm('');
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            {label && <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">{label}</label>}
            
            {/* Botão que simula o Select */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full form-input flex items-center justify-between cursor-pointer min-h-[38px] ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white hover:border-blue-400'}`}
            >
                <span className={`text-sm ${!selectedOption ? 'text-gray-400' : 'text-gray-900 dark:text-white font-bold'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <div className="flex items-center gap-1">
                    {selectedOption && !disabled && (
                        <button onClick={clearSelection} className="p-1 text-gray-400 hover:text-red-500 rounded-full">
                            <CloseIcon className="w-3 h-3" />
                        </button>
                    )}
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Dropdown Flutuante */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 flex flex-col animate-fade-in">
                    {/* Campo de Busca */}
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-lg">
                        <div className="relative">
                            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Digite para filtrar..."
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Lista de Opções */}
                    <div className="overflow-y-auto flex-1 custom-scrollbar p-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors flex flex-col ${
                                        value === opt.value
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <span>{opt.label}</span>
                                    {opt.category && <span className="text-[9px] text-gray-400 uppercase tracking-wider">{opt.category}</span>}
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-xs text-gray-400 italic">
                                Nenhuma opção encontrada para "{searchTerm}".
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
