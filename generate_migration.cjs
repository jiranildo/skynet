const fs = require('fs');

const STATIC_BADGES = [
    { id: 'first-trip', name: 'Primeira Viagem', description: 'Complete sua primeira viagem', icon: 'ri-flight-takeoff-fill', color: 'from-blue-500 to-cyan-500', requirement: 1, reward: 100, category: 'travel' },
    { id: 'social-butterfly', name: 'Borboleta Social', description: 'Faça 10 novos amigos', icon: 'ri-user-heart-fill', color: 'from-pink-500 to-rose-500', requirement: 10, reward: 150, category: 'social' },
    { id: 'foodie', name: 'Foodie Expert', description: 'Experimente 20 restaurantes diferentes', icon: 'ri-restaurant-2-fill', color: 'from-orange-500 to-amber-500', requirement: 20, reward: 200, category: 'food' },
    { id: 'globe-trotter', name: 'Viajante Mundial', description: 'Visite 5 países diferentes', icon: 'ri-earth-fill', color: 'from-green-500 to-emerald-500', requirement: 5, reward: 300, category: 'travel' },
    { id: 'content-creator', name: 'Criador de Conteúdo', description: 'Publique 50 posts', icon: 'ri-camera-fill', color: 'from-purple-500 to-violet-500', requirement: 50, reward: 250, category: 'social' },
    { id: 'wine-connoisseur', name: 'Sommelier', description: 'Experimente 15 vinhos diferentes', icon: 'ri-wine-glass-fill', color: 'from-red-500 to-rose-500', requirement: 15, reward: 180, category: 'food' },
    { id: 'adventure-seeker', name: 'Aventureiro', description: 'Complete 10 atividades de aventura', icon: 'ri-mountain-fill', color: 'from-teal-500 to-cyan-500', requirement: 10, reward: 220, category: 'travel' },
    { id: 'influencer', name: 'Influenciador', description: 'Alcance 1000 seguidores', icon: 'ri-star-fill', color: 'from-yellow-500 to-amber-500', requirement: 1000, reward: 500, category: 'social' },
    { id: 'luxury-traveler', name: 'Viajante Luxo', description: 'Reserve 5 hotéis 5 estrelas', icon: 'ri-vip-diamond-fill', color: 'from-indigo-500 to-purple-500', requirement: 5, reward: 400, category: 'special' },
    { id: 'early-bird', name: 'Madrugador', description: 'Complete missões por 7 dias seguidos', icon: 'ri-sun-fill', color: 'from-orange-400 to-yellow-400', requirement: 7, reward: 350, category: 'special' }
];

const STATIC_MISSIONS = [
    { id: 'daily-post', title: 'Compartilhe sua Jornada', description: 'Publique 1 foto da sua viagem', icon: 'ri-camera-line', reward: 50, total: 1 },
    { id: 'daily-like', title: 'Espalhe Amor', description: 'Curta 10 posts de outros viajantes', icon: 'ri-heart-line', reward: 30, total: 10 },
    { id: 'daily-explore', title: 'Explore Destinos', description: 'Visite 3 páginas de destinos diferentes', icon: 'ri-compass-line', reward: 40, total: 3 },
    { id: 'daily-friend', title: 'Faça Conexões', description: 'Siga 2 novos viajantes', icon: 'ri-user-add-line', reward: 35, total: 2 },
    { id: 'daily-review', title: 'Compartilhe Experiência', description: 'Avalie 1 restaurante ou hotel', icon: 'ri-star-line', reward: 45, total: 1 }
];

const earnWays = [
    { icon: 'ri-camera-line', title: 'Compartilhar Viagens', description: 'Poste fotos da sua viagem', reward: 50, color: 'from-blue-500 to-cyan-500' },
    { icon: 'ri-star-line', title: 'Avaliar Experiência', description: 'Avalie restaurantes e hotéis', reward: 25, color: 'from-yellow-500 to-orange-500' },
    { icon: 'ri-user-add-line', title: 'Convidar Amigos', description: 'Ganhe por cada amigo que se cadastrar', reward: 100, color: 'from-purple-500 to-pink-500' },
    { icon: 'ri-map-pin-line', title: 'Check-in', description: 'Faça check-in em destinos', reward: 30, color: 'from-green-500 to-teal-500' },
    { icon: 'ri-calendar-check-line', title: 'Completar Viagens', description: 'Complete uma viagem planejada', reward: 200, color: 'from-red-500 to-pink-500' },
    { icon: 'ri-trophy-line', title: 'Conquistas', description: 'Desbloqueie badges e conquistas', reward: 150, color: 'from-indigo-500 to-purple-500' }
];

const spendWays = [
    { icon: 'ri-map-2-line', title: 'Comprar Roteiros', description: 'Tenha acesso a roteiros exclusivos', cost: 50, color: 'from-sky-500 to-blue-600' },
    { icon: 'ri-vip-diamond-line', title: 'SARA Premium', description: '1 mês de assistente de IA Ilimitado', cost: 200, color: 'from-violet-500 to-fuchsia-500' },
    { icon: 'ri-hotel-line', title: 'Desconto em Hotéis', description: 'Cupom de 10% na próxima reserva', cost: 500, color: 'from-amber-500 to-orange-500' },
    { icon: 'ri-flight-takeoff-line', title: 'Sala VIP em Aeroporto', description: 'Acesso às áreas exclusivas em voos internacionais', cost: 2000, color: 'from-blue-600 to-indigo-700' },
    { icon: 'ri-suitcase-3-line', title: 'Bagagem Extra', description: 'Despache 1 mala de até 23kg', cost: 1500, color: 'from-teal-500 to-cyan-600' },
    { icon: 'ri-arrow-up-circle-line', title: 'Upgrade de Voo', description: 'Passe da econômica para a executiva', cost: 5000, color: 'from-rose-500 to-pink-600' },
    { icon: 'ri-goblet-line', title: 'Garrafa de Vinho Especial', description: 'Resgate na nossa adega virtual selecionada', cost: 800, color: 'from-red-600 to-rose-800' },
    { icon: 'ri-restaurant-line', title: 'Jantar Romântico', description: 'Menu degustação para duas pessoas', cost: 2500, color: 'from-orange-500 to-red-500' },
    { icon: 'ri-ticket-2-line', title: 'Ingresso para Museu', description: 'Entrada inteira nas melhores galerias do mundo', cost: 400, color: 'from-gray-600 to-gray-800' },
    { icon: 'ri-ferris-wheel-line', title: 'Parque de Diversões', description: 'Passaporte diário em parques parceiros', cost: 1200, color: 'from-yellow-400 to-orange-500' },
    { icon: 'ri-ship-line', title: 'Cruzeiro de 1 Dia', description: 'Passeio all-inclusive pela costa', cost: 3000, color: 'from-blue-400 to-blue-600' },
    { icon: 'ri-shield-check-line', title: 'Seguro Viagem', description: 'Cobertura básica para até 7 dias', cost: 1000, color: 'from-emerald-500 to-green-600' },
    { icon: 'ri-taxi-line', title: 'Transfer Aeroporto', description: 'In-out premium entre aeroporto e hotel', cost: 600, color: 'from-yellow-500 to-amber-600' },
    { icon: 'ri-hotel-bed-line', title: 'Diária Extra', description: 'Uma noite adicional por nossa conta', cost: 1500, color: 'from-indigo-400 to-violet-600' },
    { icon: 'ri-hotairballoon-line', title: 'Passeio de Balão', description: 'Voo inesquecível de 1h em locais selecionados', cost: 4000, color: 'from-red-400 to-orange-500' },
    { icon: 'ri-wifi-line', title: 'Chip de Dados Global', description: 'eSIM com 5GB para uso no exterior', cost: 800, color: 'from-sky-400 to-cyan-500' },
    { icon: 'ri-camera-lens-line', title: 'Curso de Fotografia', description: 'Aprenda a eternizar sua viagem', cost: 500, color: 'from-purple-500 to-purple-700' },
    { icon: 'ri-car-line', title: 'Aluguel de Carro', description: 'Diária de categoria SUV flex', cost: 1200, color: 'from-zinc-500 to-gray-700' },
    { icon: 'ri-water-flash-line', title: 'Batismo de Mergulho', description: 'Experiência guiada em águas cristalinas', cost: 2000, color: 'from-cyan-500 to-blue-500' },
    { icon: 'ri-cake-3-line', title: 'Degustação Local', description: 'Food tour de 3h com guia especializado', cost: 1000, color: 'from-orange-400 to-amber-600' },
    { icon: 'ri-spa-line', title: 'Massagem Relaxante', description: 'Sessão de 60min em spa conveniado', cost: 1500, color: 'from-pink-400 to-rose-500' },
    { icon: 'ri-compass-focus-line', title: 'Guia de Bolso Audio', description: 'Acesso VIP a audiotours nas capitais', cost: 300, color: 'from-teal-400 to-green-500' },
    { icon: 'ri-compass-discover-line', title: 'Roteiro Especialista', description: 'Agentes montam sua viagem sob medida', cost: 800, color: 'from-blue-500 to-indigo-500' },
    { icon: 'ri-building-4-line', title: 'Room Upgrade', description: 'Pule para a suíte premium no check-in', cost: 1500, color: 'from-purple-600 to-fuchsia-700' },
    { icon: 'ri-moon-cloudy-line', title: 'Kit Conforto em Voo', description: 'Ganhe travesseiro de pescoço e manta', cost: 400, color: 'from-slate-500 to-zinc-600' },
    { icon: 'ri-star-smile-line', title: 'Passe VIP Evento', description: 'Ingresso backstage em show parceiro', cost: 1000, color: 'from-yellow-400 to-yellow-600' },
    { icon: 'ri-cup-line', title: 'Café da Manhã Incluso', description: 'Sua viagem com comodidade matinal', cost: 500, color: 'from-amber-400 to-orange-500' },
    { icon: 'ri-knife-line', title: 'Aula de Culinária', description: 'Aprenda o prato típico do local', cost: 800, color: 'from-orange-600 to-red-600' },
    { icon: 'ri-flight-land-line', title: 'Helicóptero Panorâmico', description: 'Passeio VIP de 30 minutos', cost: 5000, color: 'from-slate-800 to-black' },
    { icon: 'ri-translate-2', title: 'App Tradutor Pro', description: 'Tradução ilimitada offline (Premium)', cost: 200, color: 'from-blue-400 to-cyan-500' },
    { icon: 'ri-time-line', title: 'Late Check-out', description: 'Fique no hotel até as 18h no último dia', cost: 600, color: 'from-indigo-400 to-blue-500' },
    { icon: 'ri-coupon-3-line', title: 'Cashback em Passagem', description: 'Credite 20% do valor da próxima passagem', cost: 2000, color: 'from-green-500 to-emerald-600' },
    { icon: 'ri-customer-service-2-line', title: 'Concierge Pessoal', description: 'Assessoria remota disponível 24/7', cost: 1500, color: 'from-violet-500 to-purple-600' }
];

const buyPackages = [
    { amount: 100, price: 'R$ 10,00', bonus: 0 },
    { amount: 500, price: 'R$ 45,00', bonus: 50 },
    { amount: 1200, price: 'R$ 100,00', bonus: 200 }
];

const esc = (str) => typeof str === 'string' ? `'${str.replace(/'/g, "''")}'` : str;

let sql = `
-- Migration to create Gamification and Wallet Catalogs
-- Data seeded automatically

CREATE TABLE IF NOT EXISTS public.gamification_badges (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    color text NOT NULL,
    requirement integer NOT NULL,
    reward integer NOT NULL,
    category text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gamification_missions (
    id text PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    reward integer NOT NULL,
    total integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallet_earn_options (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    reward integer NOT NULL,
    color text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallet_spend_options (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    cost integer NOT NULL,
    color text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wallet_buy_packages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    amount integer NOT NULL,
    price text NOT NULL,
    bonus integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.gamification_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_earn_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_spend_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_buy_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users on badges" ON public.gamification_badges FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on missions" ON public.gamification_missions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on earn_options" ON public.wallet_earn_options FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on spend_options" ON public.wallet_spend_options FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users on buy_packages" ON public.wallet_buy_packages FOR SELECT USING (true);

`;

if (STATIC_BADGES.length) {
    sql += 'INSERT INTO public.gamification_badges (id, name, description, icon, color, requirement, reward, category) VALUES\\n';
    sql += STATIC_BADGES.map(b => `(${esc(b.id)}, ${esc(b.name)}, ${esc(b.description)}, ${esc(b.icon)}, ${esc(b.color)}, ${b.requirement}, ${b.reward}, ${esc(b.category)})`).join(',\\n') + ' ON CONFLICT DO NOTHING;\\n\\n';
}

if (STATIC_MISSIONS.length) {
    sql += 'INSERT INTO public.gamification_missions (id, title, description, icon, reward, total) VALUES\\n';
    sql += STATIC_MISSIONS.map(m => `(${esc(m.id)}, ${esc(m.title)}, ${esc(m.description)}, ${esc(m.icon)}, ${m.reward}, ${m.total})`).join(',\\n') + ' ON CONFLICT DO NOTHING;\\n\\n';
}

if (earnWays.length) {
    sql += 'INSERT INTO public.wallet_earn_options (title, description, icon, reward, color) VALUES\\n';
    sql += earnWays.map(w => `(${esc(w.title)}, ${esc(w.description)}, ${esc(w.icon)}, ${w.reward}, ${esc(w.color)})`).join(',\\n') + ';\\n\\n';
}

if (spendWays.length) {
    sql += 'INSERT INTO public.wallet_spend_options (title, description, icon, cost, color) VALUES\\n';
    sql += spendWays.map(w => `(${esc(w.title)}, ${esc(w.description)}, ${esc(w.icon)}, ${w.cost}, ${esc(w.color)})`).join(',\\n') + ';\\n\\n';
}

if (buyPackages.length) {
    sql += 'INSERT INTO public.wallet_buy_packages (amount, price, bonus) VALUES\\n';
    sql += buyPackages.map(w => `(${w.amount}, ${esc(w.price)}, ${w.bonus})`).join(',\\n') + ';\\n\\n';
}

fs.writeFileSync('supabase/migrations/20260221194500_create_catalogs.sql', sql);
console.log('SQL generated successfully.');
