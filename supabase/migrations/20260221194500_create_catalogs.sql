
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

INSERT INTO public.gamification_badges (id, name, description, icon, color, requirement, reward, category) VALUES\n('first-trip', 'Primeira Viagem', 'Complete sua primeira viagem', 'ri-flight-takeoff-fill', 'from-blue-500 to-cyan-500', 1, 100, 'travel'),\n('social-butterfly', 'Borboleta Social', 'Faça 10 novos amigos', 'ri-user-heart-fill', 'from-pink-500 to-rose-500', 10, 150, 'social'),\n('foodie', 'Foodie Expert', 'Experimente 20 restaurantes diferentes', 'ri-restaurant-2-fill', 'from-orange-500 to-amber-500', 20, 200, 'food'),\n('globe-trotter', 'Viajante Mundial', 'Visite 5 países diferentes', 'ri-earth-fill', 'from-green-500 to-emerald-500', 5, 300, 'travel'),\n('content-creator', 'Criador de Conteúdo', 'Publique 50 posts', 'ri-camera-fill', 'from-purple-500 to-violet-500', 50, 250, 'social'),\n('wine-connoisseur', 'Sommelier', 'Experimente 15 vinhos diferentes', 'ri-wine-glass-fill', 'from-red-500 to-rose-500', 15, 180, 'food'),\n('adventure-seeker', 'Aventureiro', 'Complete 10 atividades de aventura', 'ri-mountain-fill', 'from-teal-500 to-cyan-500', 10, 220, 'travel'),\n('influencer', 'Influenciador', 'Alcance 1000 seguidores', 'ri-star-fill', 'from-yellow-500 to-amber-500', 1000, 500, 'social'),\n('luxury-traveler', 'Viajante Luxo', 'Reserve 5 hotéis 5 estrelas', 'ri-vip-diamond-fill', 'from-indigo-500 to-purple-500', 5, 400, 'special'),\n('early-bird', 'Madrugador', 'Complete missões por 7 dias seguidos', 'ri-sun-fill', 'from-orange-400 to-yellow-400', 7, 350, 'special') ON CONFLICT DO NOTHING;\n\nINSERT INTO public.gamification_missions (id, title, description, icon, reward, total) VALUES\n('daily-post', 'Compartilhe sua Jornada', 'Publique 1 foto da sua viagem', 'ri-camera-line', 50, 1),\n('daily-like', 'Espalhe Amor', 'Curta 10 posts de outros viajantes', 'ri-heart-line', 30, 10),\n('daily-explore', 'Explore Destinos', 'Visite 3 páginas de destinos diferentes', 'ri-compass-line', 40, 3),\n('daily-friend', 'Faça Conexões', 'Siga 2 novos viajantes', 'ri-user-add-line', 35, 2),\n('daily-review', 'Compartilhe Experiência', 'Avalie 1 restaurante ou hotel', 'ri-star-line', 45, 1) ON CONFLICT DO NOTHING;\n\nINSERT INTO public.wallet_earn_options (title, description, icon, reward, color) VALUES\n('Compartilhar Viagens', 'Poste fotos da sua viagem', 'ri-camera-line', 50, 'from-blue-500 to-cyan-500'),\n('Avaliar Experiência', 'Avalie restaurantes e hotéis', 'ri-star-line', 25, 'from-yellow-500 to-orange-500'),\n('Convidar Amigos', 'Ganhe por cada amigo que se cadastrar', 'ri-user-add-line', 100, 'from-purple-500 to-pink-500'),\n('Check-in', 'Faça check-in em destinos', 'ri-map-pin-line', 30, 'from-green-500 to-teal-500'),\n('Completar Viagens', 'Complete uma viagem planejada', 'ri-calendar-check-line', 200, 'from-red-500 to-pink-500'),\n('Conquistas', 'Desbloqueie badges e conquistas', 'ri-trophy-line', 150, 'from-indigo-500 to-purple-500');\n\nINSERT INTO public.wallet_spend_options (title, description, icon, cost, color) VALUES\n('Comprar Roteiros', 'Tenha acesso a roteiros exclusivos', 'ri-map-2-line', 50, 'from-sky-500 to-blue-600'),\n('SARA Premium', '1 mês de assistente de IA Ilimitado', 'ri-vip-diamond-line', 200, 'from-violet-500 to-fuchsia-500'),\n('Desconto em Hotéis', 'Cupom de 10% na próxima reserva', 'ri-hotel-line', 500, 'from-amber-500 to-orange-500'),\n('Sala VIP em Aeroporto', 'Acesso às áreas exclusivas em voos internacionais', 'ri-flight-takeoff-line', 2000, 'from-blue-600 to-indigo-700'),\n('Bagagem Extra', 'Despache 1 mala de até 23kg', 'ri-suitcase-3-line', 1500, 'from-teal-500 to-cyan-600'),\n('Upgrade de Voo', 'Passe da econômica para a executiva', 'ri-arrow-up-circle-line', 5000, 'from-rose-500 to-pink-600'),\n('Garrafa de Vinho Especial', 'Resgate na nossa adega virtual selecionada', 'ri-goblet-line', 800, 'from-red-600 to-rose-800'),\n('Jantar Romântico', 'Menu degustação para duas pessoas', 'ri-restaurant-line', 2500, 'from-orange-500 to-red-500'),\n('Ingresso para Museu', 'Entrada inteira nas melhores galerias do mundo', 'ri-ticket-2-line', 400, 'from-gray-600 to-gray-800'),\n('Parque de Diversões', 'Passaporte diário em parques parceiros', 'ri-ferris-wheel-line', 1200, 'from-yellow-400 to-orange-500'),\n('Cruzeiro de 1 Dia', 'Passeio all-inclusive pela costa', 'ri-ship-line', 3000, 'from-blue-400 to-blue-600'),\n('Seguro Viagem', 'Cobertura básica para até 7 dias', 'ri-shield-check-line', 1000, 'from-emerald-500 to-green-600'),\n('Transfer Aeroporto', 'In-out premium entre aeroporto e hotel', 'ri-taxi-line', 600, 'from-yellow-500 to-amber-600'),\n('Diária Extra', 'Uma noite adicional por nossa conta', 'ri-hotel-bed-line', 1500, 'from-indigo-400 to-violet-600'),\n('Passeio de Balão', 'Voo inesquecível de 1h em locais selecionados', 'ri-hotairballoon-line', 4000, 'from-red-400 to-orange-500'),\n('Chip de Dados Global', 'eSIM com 5GB para uso no exterior', 'ri-wifi-line', 800, 'from-sky-400 to-cyan-500'),\n('Curso de Fotografia', 'Aprenda a eternizar sua viagem', 'ri-camera-lens-line', 500, 'from-purple-500 to-purple-700'),\n('Aluguel de Carro', 'Diária de categoria SUV flex', 'ri-car-line', 1200, 'from-zinc-500 to-gray-700'),\n('Batismo de Mergulho', 'Experiência guiada em águas cristalinas', 'ri-water-flash-line', 2000, 'from-cyan-500 to-blue-500'),\n('Degustação Local', 'Food tour de 3h com guia especializado', 'ri-cake-3-line', 1000, 'from-orange-400 to-amber-600'),\n('Massagem Relaxante', 'Sessão de 60min em spa conveniado', 'ri-spa-line', 1500, 'from-pink-400 to-rose-500'),\n('Guia de Bolso Audio', 'Acesso VIP a audiotours nas capitais', 'ri-compass-focus-line', 300, 'from-teal-400 to-green-500'),\n('Roteiro Especialista', 'Agentes montam sua viagem sob medida', 'ri-compass-discover-line', 800, 'from-blue-500 to-indigo-500'),\n('Room Upgrade', 'Pule para a suíte premium no check-in', 'ri-building-4-line', 1500, 'from-purple-600 to-fuchsia-700'),\n('Kit Conforto em Voo', 'Ganhe travesseiro de pescoço e manta', 'ri-moon-cloudy-line', 400, 'from-slate-500 to-zinc-600'),\n('Passe VIP Evento', 'Ingresso backstage em show parceiro', 'ri-star-smile-line', 1000, 'from-yellow-400 to-yellow-600'),\n('Café da Manhã Incluso', 'Sua viagem com comodidade matinal', 'ri-cup-line', 500, 'from-amber-400 to-orange-500'),\n('Aula de Culinária', 'Aprenda o prato típico do local', 'ri-knife-line', 800, 'from-orange-600 to-red-600'),\n('Helicóptero Panorâmico', 'Passeio VIP de 30 minutos', 'ri-flight-land-line', 5000, 'from-slate-800 to-black'),\n('App Tradutor Pro', 'Tradução ilimitada offline (Premium)', 'ri-translate-2', 200, 'from-blue-400 to-cyan-500'),\n('Late Check-out', 'Fique no hotel até as 18h no último dia', 'ri-time-line', 600, 'from-indigo-400 to-blue-500'),\n('Cashback em Passagem', 'Credite 20% do valor da próxima passagem', 'ri-coupon-3-line', 2000, 'from-green-500 to-emerald-600'),\n('Concierge Pessoal', 'Assessoria remota disponível 24/7', 'ri-customer-service-2-line', 1500, 'from-violet-500 to-purple-600');\n\nINSERT INTO public.wallet_buy_packages (amount, price, bonus) VALUES\n(100, 'R$ 10,00', 0),\n(500, 'R$ 45,00', 50),\n(1200, 'R$ 100,00', 200);\n\n