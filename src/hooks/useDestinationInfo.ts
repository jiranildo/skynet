import { useState, useEffect } from 'react';

export interface DestinationInfo {
    weather: {
        temp: number;
        condition: string;
        humidity: number;
        isDay: boolean; // 1 = day, 0 = night
    } | null;
    currency: {
        code: string;
        name: string;
        symbol: string;
        rateToBRL?: number; // Mocked or fetched
    } | null;
    timezone: {
        gmt: string;
        localTime: string;
    } | null;
    power: {
        voltage: string;
        frequency: string;
        plugs: string[]; // Type A, B, C...
    } | null;
    loading: boolean;
    error: string | null;
}

// Static map for power outlets (common destinations)
// Source: worldstandards.eu
const POWER_INFO: Record<string, { voltage: string; frequency: string; plugs: string[] }> = {
    'US': { voltage: '120V', frequency: '60Hz', plugs: ['A', 'B'] },
    'BR': { voltage: '127V/220V', frequency: '60Hz', plugs: ['N'] },
    'FR': { voltage: '230V', frequency: '50Hz', plugs: ['C', 'E'] },
    'DE': { voltage: '230V', frequency: '50Hz', plugs: ['C', 'F'] },
    'IT': { voltage: '230V', frequency: '50Hz', plugs: ['C', 'F', 'L'] },
    'ES': { voltage: '230V', frequency: '50Hz', plugs: ['C', 'F'] },
    'PT': { voltage: '230V', frequency: '50Hz', plugs: ['C', 'F'] },
    'GB': { voltage: '230V', frequency: '50Hz', plugs: ['G'] },
    'JP': { voltage: '100V', frequency: '50Hz/60Hz', plugs: ['A', 'B'] },
    'CN': { voltage: '220V', frequency: '50Hz', plugs: ['A', 'C', 'I'] },
    'AU': { voltage: '230V', frequency: '50Hz', plugs: ['I'] },
    'AR': { voltage: '220V', frequency: '50Hz', plugs: ['C', 'I'] },
    // Default fallback will be used if not found
};

export function useDestinationInfo(destination: string) {
    const [info, setInfo] = useState<DestinationInfo>({
        weather: null,
        currency: null,
        timezone: null,
        power: null,
        loading: false,
        error: null
    });

    useEffect(() => {
        if (!destination) return;

        let isMounted = true;
        const fetchData = async () => {
            setInfo(prev => ({ ...prev, loading: true, error: null }));

            try {
                // 1. Geocoding (Nominatim)
                // We get lat, lon, and country_code
                // 1. Geocoding (Nominatim) -> Using a CORS proxy or handle error gracefully
                // Nominatim requires User-Agent. Browser won't send custom User-Agent in fetch easily without CORS issues.

                let lat, lon, address, countryCode;

                try {
                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&addressdetails=1&limit=1`, {
                        headers: {
                            'Accept-Language': 'pt-BR'
                        }
                    });

                    if (!geoRes.ok) throw new Error(`Nominatim blocked: ${geoRes.status}`);

                    const geoData = await geoRes.json();
                    if (!geoData || geoData.length === 0) throw new Error('Destino não encontrado');

                    lat = geoData[0].lat;
                    lon = geoData[0].lon;
                    address = geoData[0].address;
                    countryCode = address.country_code?.toUpperCase();

                } catch (geoErr) {
                    console.warn('Geocoding failed (likely CORS/Auth), skipping destination info:', geoErr);
                    setInfo(prev => ({ ...prev, loading: false }));
                    return;
                }

                if (!isMounted) return;

                // 2. Weather (OpenMeteo)
                // Specs: current_weather=true
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m`);
                const weatherData = await weatherRes.json();

                let weather = null;
                if (weatherData.current_weather) {
                    // Get humidity from hourly data (approximate for current hour)
                    const currentHour = new Date().getHours();
                    const humidity = weatherData.hourly?.relativehumidity_2m?.[currentHour] || 50;

                    weather = {
                        temp: weatherData.current_weather.temperature,
                        condition: getWeatherCondition(weatherData.current_weather.weathercode),
                        humidity,
                        isDay: weatherData.current_weather.is_day === 1
                    };
                }

                // 3. Country Info (RestCountries)
                let currency = null;
                let timezone = null;
                let power = null;

                if (countryCode) {
                    try {
                        const countryRes = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
                        const countryData = await countryRes.json();
                        const country = countryData[0];

                        // Currency
                        if (country.currencies) {
                            const currCode = Object.keys(country.currencies)[0];
                            const curr = country.currencies[currCode];
                            currency = {
                                code: currCode,
                                name: curr.name,
                                symbol: curr.symbol,
                                rateToBRL: getMockExchangeRate(currCode) // In a real app, use an exchange rate API
                            };
                        }

                        // Timezone
                        // RestCountries gives UTC offsets. We can calculate local time.
                        // But getting a nice GMT string is easier.
                        if (country.timezones && country.timezones.length > 0) {
                            // Use the first timezone or try to deduce better? 
                            // Often countries have multiple. We'll pick the first one which is usually the capital or main one.
                            const tzOffset = country.timezones[0]; // e.g. "UTC+01:00"
                            const now = new Date();
                            // Very rough local time calc based on offset string
                            const localTime = calculateLocalTime(tzOffset);

                            timezone = {
                                gmt: tzOffset.replace('UTC', 'GMT'),
                                localTime
                            };
                        }

                        // Power
                        power = POWER_INFO[countryCode] || {
                            voltage: '220V',
                            frequency: '50Hz',
                            plugs: ['C', 'F'] // Generic European as reliable fallback for many
                        };

                    } catch (err) {
                        console.error('Error fetching country info', err);
                    }
                }

                if (isMounted) {
                    setInfo({
                        weather,
                        currency,
                        timezone,
                        power,
                        loading: false,
                        error: null
                    });
                }

            } catch (err) {
                if (isMounted) {
                    setInfo(prev => ({ ...prev, loading: false, error: 'Erro ao carregar informações' }));
                }
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [destination]);

    return info;
}

// Helpers

function calculateLocalTime(offsetStr: string): string {
    // offsetStr format: "UTC+01:00" or "UTC-03:00"
    try {
        const clean = offsetStr.replace('UTC', '');
        if (clean === '') return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); // UTC

        const sign = clean.startsWith('-') ? -1 : 1;
        // simple parse
        const [h, m] = clean.replace('+', '').replace('-', '').split(':').map(Number);
        const offsetMinutes = sign * (h * 60 + (m || 0));

        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const localParams = new Date(utc + (3600000 * offsetMinutes / 60));

        return localParams.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return '--:--';
    }
}

function getWeatherCondition(code: number): string {
    // WMO Weather interpretation codes (WW)
    // https://open-meteo.com/en/docs
    if (code === 0) return 'Céu limpo';
    if (code >= 1 && code <= 3) return 'Parcialmente nublado';
    if (code >= 45 && code <= 48) return 'Nevoeiro';
    if (code >= 51 && code <= 55) return 'Chuvisco';
    if (code >= 61 && code <= 65) return 'Chuva';
    if (code >= 71 && code <= 77) return 'Neve';
    if (code >= 80 && code <= 82) return 'Chuva forte';
    if (code >= 95 && code <= 99) return 'Tempestade';
    return 'Nublado';
}

function getMockExchangeRate(currencyCode: string): number {
    // Mock rates relative to BRL (Real)
    const rates: Record<string, number> = {
        'USD': 5.05,
        'EUR': 5.50,
        'GBP': 6.40,
        'JPY': 0.034,
        'ARS': 0.006,
        'CNY': 0.70,
        'AUD': 3.30,
        'CAD': 3.70,
        'CHF': 5.70
    };
    // If BRL, rate is 1? Or maybe they want conversion from BRL to BRL?
    // Usually this shows "$1 = R$ 5,05". So 1 Unit of Currency = X BRL.
    if (currencyCode === 'BRL') return 1;
    return rates[currencyCode] || 5.00; // Fallback
}
