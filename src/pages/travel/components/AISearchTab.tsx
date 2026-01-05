import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function AISearchTab() {
    const [query, setQuery] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [displayedResponse, setDisplayedResponse] = useState('');
    const responseRef = useRef<HTMLDivElement>(null);

    const suggestions = [
        { icon: 'ri-map-pin-line', text: 'Parques públicos perto de mim para um piquenique tranquilo' },
        { icon: 'ri-table-line', text: 'Faça uma tabela comparando diferentes métodos de preparo de café' },
        { icon: 'ri-run-line', text: 'Percursos de corrida com um circuito de 5 km' },
    ];

    const handleSearch = async (text: string = query) => {
        if (!text.trim()) return;

        setQuery(text);
        setIsAiLoading(true);
        setAiResponse(null);
        setDisplayedResponse('');

        try {
            // NOTE: Replace with your actual Gemini API Key handling mechanism
            // Ideally handled via a backend proxy or env var in Vite: import.meta.env.VITE_GOOGLE_API_KEY
            const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || 'YOUR_GOOGLE_API_KEY_HERE';

            // Fallback if no key (Simulated response for development/demo if key missing)
            if (!apiKey || apiKey === 'YOUR_GOOGLE_API_KEY_HERE') {
                console.warn("No Google API Key found. Using simulated response.");
                await new Promise(resolve => setTimeout(resolve, 2000));
                const simResponse = `## Resposta Simulada (Modo Demo - Gemini)\n\nComo não foi encontrada uma chave de API válida...`;
                setAiResponse(simResponse);
                setIsAiLoading(false);
                return;
            }

            console.log("Initializing Gemini...");

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const prompt = `Você é um especialista em viagens e turismo. Responda à seguinte pergunta de forma detalhada, útil e formatada em Markdown (use negrito, listas, tabelas se necessário): ${text}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const textResponse = response.text();

            setAiResponse(textResponse);
        } catch (error: any) {
            console.error("AI Error Detailed:", error);
            let userMsg = `**Erro na IA:** ${error.message || JSON.stringify(error)}`;

            if (error.message?.includes('404')) {
                userMsg += "\n\n**Dica:** O modelo 'gemini-2.0-flash' não foi encontrado. Verifique se sua API Key suporta este modelo.";
            }

            setAiResponse(userMsg);
        } finally {
            setIsAiLoading(false);
        }
    };

    // Typing effect for the response
    useEffect(() => {
        if (aiResponse) {
            setIsTyping(true);
            let i = 0;
            const interval = setInterval(() => {
                setDisplayedResponse(prev => aiResponse.slice(0, i + 1));
                i++;
                if (i >= aiResponse.length) {
                    clearInterval(interval);
                    setIsTyping(false);
                }
            }, 10); // Adjust speed here (ms per char)
            return () => clearInterval(interval);
        }
    }, [aiResponse]);

    // Markdown-like simple renderer (Basic bold/header support for demo)
    // For production, suggest using 'react-markdown'
    const renderMarkdown = (text: string) => {
        // Very basic parser for demo purposes to avoid adding dependencies if unnecessary
        // Retains original text structure but styled
        return <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {text.split('\n').map((line, idx) => {
                if (line.startsWith('## ')) return <h3 key={idx} className="text-xl font-bold mt-4 mb-2 text-gray-900">{line.replace('## ', '')}</h3>
                if (line.startsWith('### ')) return <h4 key={idx} className="text-lg font-bold mt-3 mb-1 text-gray-800">{line.replace('### ', '')}</h4>
                if (line.startsWith('* ')) return <li key={idx} className="ml-4 list-disc">{line.replace('* ', '')}</li>
                if (line.startsWith('1. ')) return <li key={idx} className="ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>
                return <p key={idx} className="mb-2">{line.replace(/\*\*(.*?)\*\*/g, (_, p1) => p1)}</p> // Simple bold strip/render could be improved
            })}
        </div>
    };

    // Improved markdown renderer using DangerouslySetInnerHTML with purified content is better, 
    // or just plain text with CSS if we don't install react-markdown. 
    // Let's stick to simple text display for now but cleaner.

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">

                {/* Header / Hero */}
                {!aiResponse && !isAiLoading && (
                    <div className="text-center mb-12 animate-fadeIn">
                        <div className="inline-flex items-center gap-2 mb-4">
                            <span className="font-bold text-gray-900">Modo IA</span>
                            <span className="text-gray-500 text-sm">Experimente</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-normal text-gray-900 mb-4 tracking-tight">
                            Conheça o Modo IA
                        </h1>
                        <p className="text-xl text-gray-500 font-light">
                            Faça perguntas detalhadas e receba respostas melhores
                        </p>
                    </div>
                )}

                {/* Input Area */}
                <div className={`transition-all duration-500 ${aiResponse || isAiLoading ? 'mb-8' : 'mb-12'}`}>
                    <div className="relative group">
                        <div className={`absolute -inset-1 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200`}></div>
                        <div className="relative relative flex items-start bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-2xl transition-all shadow-sm hover:shadow-md">
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSearch();
                                    }
                                }}
                                placeholder="Pergunte o que quiser"
                                className="w-full bg-transparent border-none focus:ring-0 p-4 min-h-[60px] md:min-h-[80px] text-lg resize-none text-gray-800 placeholder-gray-400"
                                style={{ borderRadius: '1rem' }}
                            />
                            <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                {/* Add Attachment Button (Stub) */}
                                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                                    <i className="ri-add-line text-xl"></i>
                                </button>
                                {/* Mic Button (Stub) */}
                                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                                    <i className="ri-mic-line text-xl"></i>
                                </button>
                                {/* Send Button */}
                                <button
                                    onClick={() => handleSearch()}
                                    disabled={!query.trim() || isAiLoading}
                                    className={`p-2 rounded-full transition-all duration-300 ${query.trim() ? 'bg-blue-600 text-white shadow-lg transform scale-100' : 'bg-gray-200 text-gray-400 scale-90'}`}
                                >
                                    {isAiLoading ? (
                                        <i className="ri-loader-4-line animate-spin text-xl"></i>
                                    ) : (
                                        <i className="ri-arrow-right-line text-xl"></i>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Suggestions (Only when no response) */}
                {!aiResponse && !isAiLoading && (
                    <div className="space-y-4 animate-slideUp">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSearch(suggestion.text)}
                                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 rounded-xl transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                    <i className={`${suggestion.icon} text-lg`}></i>
                                </div>
                                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                                    {suggestion.text}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* AI Response Area */}
                {(aiResponse || isAiLoading) && (
                    <div className="animate-fadeIn">
                        {/* Loading Skeleton */}
                        {isAiLoading && !aiResponse && (
                            <div className="space-y-4">
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                            </div>
                        )}

                        {/* Response Content */}
                        {aiResponse && (
                            <div className="bg-white rounded-none md:rounded-2xl md:p-6" ref={responseRef}>

                                {/* Header with Icon */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                        <i className="ri-sparkling-fill text-white text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Resposta da IA</h3>
                                        <p className="text-xs text-gray-500">Gerado por Gemini</p>
                                    </div>
                                </div>

                                {/* Actual Text */}
                                <div className="prose prose-lg prose-blue max-w-none">
                                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-light text-lg">
                                        {displayedResponse}
                                        {isTyping && <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-blink"></span>}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {!isTyping && (
                                    <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
                                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm font-medium text-gray-700 transition-colors">
                                            <i className="ri-thumb-up-line"></i> Útil
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm font-medium text-gray-700 transition-colors">
                                            <i className="ri-file-copy-line"></i> Copiar
                                        </button>
                                        <div className="flex-1"></div>
                                        <button onClick={() => { setAiResponse(null); setQuery(''); }} className="text-sm text-gray-400 hover:text-gray-600">
                                            Nova Pesquisa
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
