import { useState } from 'react';

interface Article {
  id: string;
  title: string;
  category: string;
  icon: string;
  color: string;
  excerpt: string;
  content: string;
  image: string;
}

export default function SommelierTab() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Todos', icon: 'ri-apps-line', color: 'purple' },
    { id: 'profissionais', label: 'Profissionais', icon: 'ri-user-star-line', color: 'emerald' },
    { id: 'escolha', label: 'Como Escolher', icon: 'ri-search-eye-line', color: 'blue' },
    { id: 'harmonizacao', label: 'Harmonização', icon: 'ri-restaurant-line', color: 'orange' },
    { id: 'uvas', label: 'Uvas & Terroir', icon: 'ri-plant-line', color: 'green' },
    { id: 'historia', label: 'História', icon: 'ri-book-open-line', color: 'pink' },
    { id: 'servir', label: 'Como Servir', icon: 'ri-goblet-line', color: 'red' },
    { id: 'armazenamento', label: 'Armazenamento', icon: 'ri-archive-line', color: 'indigo' },
  ];

  const articles: Article[] = [
    {
      id: 'profissionais',
      title: 'Enólogo vs Sommelier: Habilidades e Diferenças',
      category: 'profissionais',
      icon: 'ri-user-star-line',
      color: 'emerald',
      excerpt: 'Entenda as diferenças entre esses dois profissionais essenciais do mundo do vinho.',
      image: 'https://readdy.ai/api/search-image?query=professional%20winemaker%20and%20sommelier%20working%20together%20in%20modern%20winery%20laboratory%20and%20tasting%20room%20elegant%20atmosphere%20natural%20lighting%20sophisticated%20setting&width=800&height=500&seq=sommelierpro1&orientation=landscape',
      content: `
        <h3>🎓 Duas Profissões, Uma Paixão</h3>
        <p>Embora ambos sejam especialistas em vinho, o Enólogo e o Sommelier têm formações, habilidades e funções completamente diferentes. Vamos entender cada um:</p>

        <h3>🔬 O Enólogo - O Cientista do Vinho</h3>
        
        <h4>Formação e Educação</h4>
        <ul>
          <li><strong>Graduação:</strong> Curso superior em Enologia (4-5 anos)</li>
          <li><strong>Base Científica:</strong> Química, Biologia, Microbiologia, Agronomia</li>
          <li><strong>Conhecimentos Técnicos:</strong> Viticultura, Vinificação, Análises Laboratoriais</li>
          <li><strong>Pós-Graduação:</strong> Mestrado e Doutorado em áreas relacionadas</li>
        </ul>

        <h4>Principais Responsabilidades</h4>
        <ul>
          <li>🍇 <strong>Gestão do Vinhedo:</strong> Escolha de uvas, manejo da vinha, momento ideal de colheita</li>
          <li>⚗️ <strong>Processo de Vinificação:</strong> Controle de fermentação, maceração, prensagem</li>
          <li>🛢️ <strong>Envelhecimento:</strong> Escolha de barris, tempo de guarda, blend final</li>
          <li>🔬 <strong>Análises Laboratoriais:</strong> pH, acidez, açúcar, álcool, compostos químicos</li>
          <li>🎯 <strong>Controle de Qualidade:</strong> Garantir padrões e consistência</li>
          <li>🏭 <strong>Gestão da Produção:</strong> Supervisionar toda a produção da vinícola</li>
          <li>💡 <strong>Inovação:</strong> Desenvolver novos produtos e técnicas</li>
        </ul>

        <h4>Habilidades Essenciais</h4>
        <ul>
          <li>✅ Conhecimento profundo de química e biologia</li>
          <li>✅ Capacidade analítica e científica</li>
          <li>✅ Gestão de processos industriais</li>
          <li>✅ Conhecimento de viticultura e terroir</li>
          <li>✅ Habilidades de degustação técnica</li>
          <li>✅ Visão de negócios e custos</li>
          <li>✅ Capacidade de resolver problemas técnicos</li>
        </ul>

        <h4>Onde Trabalha</h4>
        <ul>
          <li>🏭 Vinícolas e vinhedos</li>
          <li>🔬 Laboratórios de análise</li>
          <li>🎓 Instituições de ensino e pesquisa</li>
          <li>💼 Consultorias técnicas</li>
          <li>🏢 Cooperativas vinícolas</li>
        </ul>

        <h4>Foco Principal</h4>
        <p><strong>PRODUÇÃO:</strong> O enólogo está focado em CRIAR o vinho, desde a uva até a garrafa. Ele é o responsável por transformar a matéria-prima em produto final.</p>

        <hr style="margin: 2rem 0; border: none; border-top: 2px solid #e5e7eb;" />

        <h3>🍷 O Sommelier - O Embaixador do Vinho</h3>

        <h4>Formação e Educação</h4>
        <ul>
          <li><strong>Cursos Profissionais:</strong> Certificações de Sommelier (níveis 1-4)</li>
          <li><strong>Principais Certificações:</strong> Court of Master Sommeliers, WSET, ABS</li>
          <li><strong>Base de Conhecimento:</strong> Degustação, Regiões, Harmonização, Serviço</li>
          <li><strong>Formação Contínua:</strong> Degustações, viagens, estudos constantes</li>
          <li><strong>Tempo:</strong> De 2 anos (básico) até 10+ anos (Master Sommelier)</li>
        </ul>

        <h4>Principais Responsabilidades</h4>
        <ul>
          <li>📋 <strong>Gestão da Carta de Vinhos:</strong> Seleção, compra, precificação</li>
          <li>🍽️ <strong>Harmonização:</strong> Combinar vinhos com pratos do menu</li>
          <li>👥 <strong>Atendimento ao Cliente:</strong> Recomendar vinhos, educar clientes</li>
          <li>🍾 <strong>Serviço de Vinhos:</strong> Técnicas corretas de abertura e serviço</li>
          <li>📚 <strong>Treinamento:</strong> Capacitar equipe de garçons e bartenders</li>
          <li>🏪 <strong>Gestão de Adega:</strong> Armazenamento, controle de estoque, rotatividade</li>
          <li>🎤 <strong>Eventos e Degustações:</strong> Organizar e conduzir experiências</li>
        </ul>

        <h4>Habilidades Essenciais</h4>
        <ul>
          <li>✅ Paladar e olfato extremamente desenvolvidos</li>
          <li>✅ Conhecimento enciclopédico de regiões e produtores</li>
          <li>✅ Excelente comunicação e didática</li>
          <li>✅ Habilidades de vendas e persuasão</li>
          <li>✅ Conhecimento de gastronomia</li>
          <li>✅ Gestão de relacionamento com clientes</li>
          <li>✅ Capacidade de memorização impressionante</li>
          <li>✅ Elegância e etiqueta no serviço</li>
        </ul>

        <h4>Onde Trabalha</h4>
        <ul>
          <li>🍽️ Restaurantes fine dining</li>
          <li>🏨 Hotéis de luxo</li>
          <li>🍷 Wine bars e enotecas</li>
          <li>🛍️ Lojas especializadas em vinhos</li>
          <li>🚢 Cruzeiros de luxo</li>
          <li>💼 Consultorias e educação</li>
          <li>✈️ Companhias aéreas (primeira classe)</li>
        </ul>

        <h4>Foco Principal</h4>
        <p><strong>EXPERIÊNCIA:</strong> O sommelier está focado em APRESENTAR o vinho, criar experiências memoráveis e conectar pessoas aos vinhos certos.</p>

        <hr style="margin: 2rem 0; border: none; border-top: 2px solid #e5e7eb;" />

        <h3>⚖️ Comparação Direta</h3>

        <table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb;">Aspecto</th>
              <th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb;">Enólogo</th>
              <th style="padding: 0.75rem; text-align: left; border: 1px solid #e5e7eb;">Sommelier</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;"><strong>Formação</strong></td>
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Graduação universitária (4-5 anos)</td>
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Certificações profissionais (2-10 anos)</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;"><strong>Base</strong></td>
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Científica (Química, Biologia)</td>
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Sensorial e Cultural</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;"><strong>Local</strong></td>
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Vinícola, laboratório, vinhedo</td>
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Restaurante, hotel, loja</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;"><strong>Função</strong></td>
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Produzir o vinho</td>
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Apresentar e vender o vinho</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;"><strong>Contato</strong></td>
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Limitado com consumidor final</td>
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Direto e constante com clientes</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;"><strong>Habilidade Chave</strong></td>
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Análise técnica e científica</td>
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Degustação e comunicação</td>
            </tr>
            <tr>
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;"><strong>Objetivo</strong></td>
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Criar vinhos de qualidade</td>
              <td style="padding: 0.75rem; border: 1px solid #e5e7eb;">Criar experiências memoráveis</td>
            </tr>
          </tbody>
        </table>

        <h3>🤝 Colaboração Entre Profissionais</h3>
        <p>Embora tenham funções diferentes, enólogos e sommeliers frequentemente colaboram:</p>
        <ul>
          <li>🎯 <strong>Feedback do Mercado:</strong> Sommeliers informam enólogos sobre preferências dos consumidores</li>
          <li>📚 <strong>Educação:</strong> Enólogos educam sommeliers sobre processos e características dos vinhos</li>
          <li>🎪 <strong>Eventos:</strong> Trabalham juntos em lançamentos e degustações</li>
          <li>💡 <strong>Desenvolvimento:</strong> Sommeliers podem sugerir estilos que o mercado procura</li>
        </ul>

        <h3>💼 Carreiras e Salários</h3>
        
        <h4>Enólogo</h4>
        <ul>
          <li><strong>Iniciante:</strong> R$ 4.000 - R$ 7.000</li>
          <li><strong>Pleno:</strong> R$ 8.000 - R$ 15.000</li>
          <li><strong>Sênior/Consultor:</strong> R$ 15.000 - R$ 40.000+</li>
          <li><strong>Enólogo-Chefe (grandes vinícolas):</strong> R$ 30.000 - R$ 80.000+</li>
        </ul>

        <h4>Sommelier</h4>
        <ul>
          <li><strong>Iniciante:</strong> R$ 3.000 - R$ 5.000 + comissões</li>
          <li><strong>Pleno:</strong> R$ 6.000 - R$ 12.000 + comissões</li>
          <li><strong>Sênior:</strong> R$ 12.000 - R$ 25.000 + comissões</li>
          <li><strong>Master Sommelier:</strong> R$ 20.000 - R$ 50.000+</li>
          <li><strong>Head Sommelier (hotéis/restaurantes luxo):</strong> R$ 25.000 - R$ 60.000+</li>
        </ul>

        <h3>🎯 Qual Carreira Escolher?</h3>

        <h4>Escolha Enologia se você:</h4>
        <ul>
          <li>✅ Ama ciência, química e biologia</li>
          <li>✅ Prefere trabalhar "nos bastidores"</li>
          <li>✅ Gosta de processos técnicos e análises</li>
          <li>✅ Quer criar produtos do zero</li>
          <li>✅ Prefere ambiente de produção/laboratório</li>
          <li>✅ Tem paciência para processos longos</li>
        </ul>

        <h4>Escolha Sommelier se você:</h4>
        <ul>
          <li>✅ Ama interagir com pessoas</li>
          <li>✅ Tem excelente comunicação</li>
          <li>✅ Gosta de gastronomia e hospitalidade</li>
          <li>✅ Quer trabalhar em ambientes elegantes</li>
          <li>✅ Tem paladar e olfato apurados</li>
          <li>✅ Gosta de viajar e conhecer culturas</li>
          <li>✅ Quer ser o "rosto" da experiência do vinho</li>
        </ul>

        <h3>🌟 Curiosidades</h3>
        <ul>
          <li>🏆 Existem apenas cerca de 270 Master Sommeliers no mundo inteiro</li>
          <li>📚 O exame de Master Sommelier tem taxa de aprovação de apenas 8%</li>
          <li>🍷 Alguns enólogos famosos: Michel Rolland, Alberto Antonini, Paul Hobbs</li>
          <li>⭐ Alguns sommeliers famosos: Jancis Robinson, Andrea Immer, Aldo Sohm</li>
          <li>🎬 O filme "Somm" (2012) documenta a jornada para se tornar Master Sommelier</li>
          <li>🔬 Enólogos podem trabalhar com vinhos, cervejas, destilados e outras bebidas fermentadas</li>
        </ul>

        <h3>✨ Conclusão</h3>
        <p>Ambas as profissões são essenciais e complementares no mundo do vinho. O enólogo é o artista-cientista que cria a obra-prima, enquanto o sommelier é o curador-educador que apresenta essa obra ao mundo. Juntos, eles elevam a cultura do vinho e proporcionam experiências inesquecíveis aos apreciadores.</p>
      `
    },
    {
      id: '1',
      title: 'Como Escolher o Vinho Perfeito',
      category: 'escolha',
      icon: 'ri-search-eye-line',
      color: 'blue',
      excerpt: 'Aprenda a selecionar vinhos considerando ocasião, paladar e orçamento.',
      image: 'https://readdy.ai/api/search-image?query=elegant%20wine%20bottles%20on%20wooden%20shelf%20in%20modern%20wine%20cellar%20with%20soft%20warm%20lighting%20professional%20photography%20high%20quality%20detailed%20composition&width=800&height=500&seq=sommelier1&orientation=landscape',
      content: `
        <h3>Entendendo Seus Gostos</h3>
        <p>O primeiro passo para escolher um bom vinho é conhecer suas preferências. Você prefere vinhos mais leves ou encorpados? Doces ou secos? Frutados ou terrosos?</p>
        
        <h3>Ocasião e Momento</h3>
        <ul>
          <li><strong>Aperitivos:</strong> Espumantes, vinhos brancos leves e rosés</li>
          <li><strong>Refeições:</strong> Considere o prato principal para harmonização</li>
          <li><strong>Sobremesas:</strong> Vinhos doces, fortificados ou espumantes</li>
          <li><strong>Celebrações:</strong> Champagnes e espumantes de qualidade</li>
        </ul>

        <h3>Faixa de Preço</h3>
        <p>Bons vinhos existem em todas as faixas de preço. Para o dia a dia, vinhos entre R$50-100 oferecem excelente custo-benefício. Para ocasiões especiais, invista em rótulos acima de R$150.</p>

        <h3>Lendo o Rótulo</h3>
        <ul>
          <li><strong>Região:</strong> Indica o terroir e estilo do vinho</li>
          <li><strong>Safra:</strong> Ano da colheita das uvas</li>
          <li><strong>Uvas:</strong> Variedades utilizadas na produção</li>
          <li><strong>Teor Alcoólico:</strong> Geralmente entre 12-15%</li>
        </ul>

        <h3>Dicas do Sommelier</h3>
        <p>✨ Não tenha medo de experimentar vinhos de regiões menos conhecidas</p>
        <p>✨ Peça recomendações ao vendedor, descrevendo o que você gosta</p>
        <p>✨ Comece com vinhos mais acessíveis antes de investir em rótulos caros</p>
        <p>✨ Mantenha um registro dos vinhos que você gostou</p>
      `
    },
    {
      id: '2',
      title: 'Harmonização Perfeita: Vinho e Comida',
      category: 'harmonizacao',
      icon: 'ri-restaurant-line',
      color: 'orange',
      excerpt: 'Descubra as combinações clássicas e modernas entre vinhos e pratos.',
      image: 'https://readdy.ai/api/search-image?query=wine%20glass%20with%20gourmet%20food%20pairing%20on%20elegant%20table%20setting%20professional%20food%20photography%20warm%20ambient%20lighting%20sophisticated%20composition&width=800&height=500&seq=sommelier2&orientation=landscape',
      content: `
        <h3>Princípios Básicos da Harmonização</h3>
        <p>A harmonização busca equilibrar ou contrastar sabores, texturas e intensidades entre vinho e comida.</p>

        <h3>Harmonizações Clássicas</h3>
        <ul>
          <li><strong>Carnes Vermelhas:</strong> Cabernet Sauvignon, Malbec, Syrah</li>
          <li><strong>Carnes Brancas:</strong> Chardonnay, Pinot Grigio, Sauvignon Blanc</li>
          <li><strong>Peixes e Frutos do Mar:</strong> Albariño, Riesling, Champagne</li>
          <li><strong>Massas com Molho Vermelho:</strong> Chianti, Sangiovese, Barbera</li>
          <li><strong>Queijos:</strong> Porto, Sauternes, Riesling (doce)</li>
        </ul>

        <h3>Regras de Ouro</h3>
        <p><strong>1. Intensidade Similar:</strong> Pratos leves com vinhos leves, pratos intensos com vinhos encorpados</p>
        <p><strong>2. Acidez:</strong> Vinhos ácidos cortam gordura e limpam o paladar</p>
        <p><strong>3. Doçura:</strong> O vinho deve ser mais doce que o prato</p>
        <p><strong>4. Taninos:</strong> Combinam bem com proteínas e gorduras</p>

        <h3>Harmonizações Regionais</h3>
        <p>Uma dica valiosa: vinhos e pratos da mesma região geralmente harmonizam perfeitamente. Exemplo: Chianti com massas italianas, Malbec com churrasco argentino.</p>

        <h3>Quebrando Regras</h3>
        <p>Não tenha medo de experimentar! Algumas combinações inusitadas podem surpreender positivamente. O importante é que você goste do resultado.</p>
      `
    },
    {
      id: '3',
      title: 'Uvas Nobres e Seus Terroirs',
      category: 'uvas',
      icon: 'ri-plant-line',
      color: 'green',
      excerpt: 'Conheça as principais uvas e onde elas expressam seu melhor potencial.',
      image: 'https://readdy.ai/api/search-image?query=vineyard%20with%20ripe%20wine%20grapes%20on%20vines%20rolling%20hills%20landscape%20golden%20hour%20sunlight%20beautiful%20terroir%20professional%20photography&width=800&height=500&seq=sommelier3&orientation=landscape',
      content: `
        <h3>Uvas Tintas Nobres</h3>
        
        <h4>🍇 Cabernet Sauvignon</h4>
        <p><strong>Origem:</strong> Bordeaux, França</p>
        <p><strong>Melhores Terroirs:</strong> Bordeaux (França), Napa Valley (EUA), Maipo Valley (Chile), Coonawarra (Austrália)</p>
        <p><strong>Características:</strong> Corpo pleno, taninos firmes, notas de cassis, cedro e especiarias</p>

        <h4>🍇 Pinot Noir</h4>
        <p><strong>Origem:</strong> Borgonha, França</p>
        <p><strong>Melhores Terroirs:</strong> Borgonha (França), Willamette Valley (EUA), Central Otago (Nova Zelândia)</p>
        <p><strong>Características:</strong> Corpo médio, elegante, notas de frutas vermelhas, cogumelos e terra</p>

        <h4>🍇 Malbec</h4>
        <p><strong>Origem:</strong> Cahors, França</p>
        <p><strong>Melhores Terroirs:</strong> Mendoza (Argentina), Cahors (França)</p>
        <p><strong>Características:</strong> Corpo pleno, taninos macios, notas de ameixa, chocolate e violeta</p>

        <h4>🍇 Syrah/Shiraz</h4>
        <p><strong>Origem:</strong> Vale do Rhône, França</p>
        <p><strong>Melhores Terroirs:</strong> Rhône (França), Barossa Valley (Austrália), Stellenbosch (África do Sul)</p>
        <p><strong>Características:</strong> Corpo pleno, especiado, notas de pimenta preta, frutas escuras e defumado</p>

        <h3>Uvas Brancas Nobres</h3>

        <h4>🍇 Chardonnay</h4>
        <p><strong>Origem:</strong> Borgonha, França</p>
        <p><strong>Melhores Terroirs:</strong> Borgonha (França), Califórnia (EUA), Margaret River (Austrália)</p>
        <p><strong>Características:</strong> Versátil, pode ser leve e mineral ou rico e amanteigado</p>

        <h4>🍇 Sauvignon Blanc</h4>
        <p><strong>Origem:</strong> Vale do Loire, França</p>
        <p><strong>Melhores Terroirs:</strong> Sancerre (França), Marlborough (Nova Zelândia), Casablanca (Chile)</p>
        <p><strong>Características:</strong> Alta acidez, notas herbáceas, frutas cítricas e minerais</p>

        <h4>🍇 Riesling</h4>
        <p><strong>Origem:</strong> Alemanha</p>
        <p><strong>Melhores Terroirs:</strong> Mosel (Alemanha), Alsácia (França), Clare Valley (Austrália)</p>
        <p><strong>Características:</strong> Alta acidez, aromático, do seco ao doce, notas de frutas brancas e petróleo</p>

        <h3>O Conceito de Terroir</h3>
        <p>Terroir é a combinação única de solo, clima, topografia e práticas vitícolas que confere características únicas ao vinho. A mesma uva cultivada em diferentes terroirs produzirá vinhos com perfis distintos.</p>

        <h3>Fatores do Terroir</h3>
        <ul>
          <li><strong>Solo:</strong> Calcário, argila, xisto, granito - cada tipo influencia o vinho</li>
          <li><strong>Clima:</strong> Temperatura, precipitação, insolação</li>
          <li><strong>Altitude:</strong> Afeta temperatura e maturação das uvas</li>
          <li><strong>Exposição Solar:</strong> Orientação das vinhas</li>
        </ul>
      `
    },
    {
      id: '4',
      title: 'História do Vinho: Das Origens à Modernidade',
      category: 'historia',
      icon: 'ri-book-open-line',
      color: 'pink',
      excerpt: 'Uma jornada fascinante pela história milenar da produção de vinhos.',
      image: 'https://readdy.ai/api/search-image?query=ancient%20wine%20cellar%20with%20old%20wooden%20barrels%20and%20vintage%20bottles%20historical%20atmosphere%20warm%20candlelight%20rustic%20stone%20walls%20professional%20photography&width=800&height=500&seq=sommelier4&orientation=landscape',
      content: `
        <h3>Origens Antigas (6000 a.C. - 1000 d.C.)</h3>
        <p>As primeiras evidências de produção de vinho datam de cerca de 6000 a.C., na região do Cáucaso (atual Geórgia). Os antigos egípcios, gregos e romanos aperfeiçoaram as técnicas de viticultura e vinificação.</p>

        <h3>Idade Média (1000 - 1500)</h3>
        <p>Os monges católicos foram fundamentais na preservação e desenvolvimento da viticultura europeia. Regiões como Borgonha e Champagne começaram a ganhar reputação.</p>

        <h3>Era Moderna (1500 - 1800)</h3>
        <ul>
          <li><strong>Século XVI:</strong> Expansão das vinhas para o Novo Mundo</li>
          <li><strong>Século XVII:</strong> Desenvolvimento do Champagne por Dom Pérignon</li>
          <li><strong>Século XVIII:</strong> Classificação de Bordeaux e estabelecimento de grandes châteaux</li>
        </ul>

        <h3>Revolução Industrial (1800 - 1900)</h3>
        <p>A filoxera devastou vinhedos europeus, mas levou à inovação com enxertos americanos. Louis Pasteur revolucionou a compreensão da fermentação.</p>

        <h3>Século XX</h3>
        <ul>
          <li><strong>Anos 1920-1930:</strong> Proibição nos EUA afeta indústria</li>
          <li><strong>Anos 1960-1970:</strong> Revolução da qualidade na Califórnia</li>
          <li><strong>Anos 1980-1990:</strong> Ascensão dos vinhos do Novo Mundo</li>
        </ul>

        <h3>Era Contemporânea (2000 - Presente)</h3>
        <p>Globalização do vinho, foco em sustentabilidade, vinhos biodinâmicos e naturais, e democratização do conhecimento enológico através da internet.</p>

        <h3>Curiosidades Históricas</h3>
        <p>🍷 O vinho mais antigo ainda bebível data de 325 d.C. (Garrafa de Speyer)</p>
        <p>🍷 Napoleão Bonaparte era grande apreciador de Chambertin</p>
        <p>🍷 Thomas Jefferson foi um dos primeiros grandes colecionadores americanos</p>
        <p>🍷 O Julgamento de Paris (1976) colocou vinhos californianos no mapa mundial</p>
      `
    },
    {
      id: '5',
      title: 'Como Servir Vinho Corretamente',
      category: 'servir',
      icon: 'ri-goblet-line',
      color: 'red',
      excerpt: 'Temperatura, taças, decantação e outros segredos para servir vinhos.',
      image: 'https://readdy.ai/api/search-image?query=sommelier%20pouring%20red%20wine%20into%20elegant%20crystal%20glass%20professional%20service%20refined%20atmosphere%20soft%20lighting%20luxury%20restaurant%20setting&width=800&height=500&seq=sommelier5&orientation=landscape',
      content: `
        <h3>Temperatura Ideal de Serviço</h3>
        <ul>
          <li><strong>Espumantes:</strong> 6-8°C</li>
          <li><strong>Brancos Leves:</strong> 8-10°C</li>
          <li><strong>Brancos Encorpados:</strong> 10-12°C</li>
          <li><strong>Rosés:</strong> 8-10°C</li>
          <li><strong>Tintos Leves:</strong> 12-14°C</li>
          <li><strong>Tintos Médios:</strong> 14-16°C</li>
          <li><strong>Tintos Encorpados:</strong> 16-18°C</li>
          <li><strong>Vinhos Doces:</strong> 6-8°C</li>
        </ul>

        <h3>Escolhendo a Taça Certa</h3>
        <p><strong>Taça Bordeaux:</strong> Grande, para tintos encorpados. Permite aeração e concentra aromas.</p>
        <p><strong>Taça Borgonha:</strong> Bojo largo, para Pinot Noir e vinhos delicados. Maximiza contato com o ar.</p>
        <p><strong>Taça Branco:</strong> Menor e mais estreita, mantém temperatura e preserva aromas frescos.</p>
        <p><strong>Flute:</strong> Alta e estreita, para espumantes. Preserva as bolhas.</p>
        <p><strong>Taça ISO:</strong> Universal, adequada para degustações profissionais.</p>

        <h3>Decantação</h3>
        <p><strong>Quando decantar:</strong></p>
        <ul>
          <li>Vinhos tintos jovens e tânicos (1-2 horas antes)</li>
          <li>Vinhos tintos maduros com sedimento (30 minutos antes)</li>
          <li>Vinhos muito antigos (decantar na hora, servir imediatamente)</li>
        </ul>

        <p><strong>Como decantar:</strong></p>
        <ol>
          <li>Deixe a garrafa em pé por 24h antes (vinhos antigos)</li>
          <li>Abra cuidadosamente</li>
          <li>Despeje lentamente no decanter</li>
          <li>Pare quando ver sedimento se aproximando do gargalo</li>
        </ol>

        <h3>Abrindo a Garrafa</h3>
        <ol>
          <li>Corte a cápsula abaixo do anel do gargalo</li>
          <li>Limpe o topo da garrafa</li>
          <li>Insira o saca-rolhas no centro da rolha</li>
          <li>Gire suavemente até quase o fim</li>
          <li>Puxe a rolha lentamente</li>
          <li>Limpe novamente o gargalo</li>
        </ol>

        <h3>Servindo</h3>
        <ul>
          <li>Segure a garrafa pelo corpo, não pelo gargalo</li>
          <li>Sirva 1/3 da taça (150ml)</li>
          <li>Gire levemente a garrafa ao terminar para evitar gotas</li>
          <li>Sirva as mulheres primeiro, depois os homens, e por último quem escolheu o vinho</li>
        </ul>

        <h3>Oxigenação</h3>
        <p>Vinhos jovens e tânicos se beneficiam de aeração. Você pode:</p>
        <ul>
          <li>Decantar 1-2 horas antes</li>
          <li>Usar aerador de vinho</li>
          <li>Simplesmente girar o vinho na taça</li>
        </ul>
      `
    },
    {
      id: '6',
      title: 'Armazenamento e Conservação',
      category: 'armazenamento',
      icon: 'ri-archive-line',
      color: 'indigo',
      excerpt: 'Aprenda a armazenar seus vinhos corretamente para preservar qualidade.',
      image: 'https://readdy.ai/api/search-image?query=professional%20wine%20storage%20cellar%20with%20organized%20bottles%20on%20wooden%20racks%20controlled%20temperature%20ambient%20lighting%20sophisticated%20wine%20collection&width=800&height=500&seq=sommelier6&orientation=landscape',
      content: `
        <h3>Condições Ideais de Armazenamento</h3>
        
        <h4>🌡️ Temperatura</h4>
        <p><strong>Ideal:</strong> 12-14°C</p>
        <p><strong>Aceitável:</strong> 10-16°C</p>
        <p><strong>Crítico:</strong> Evitar variações bruscas (mais importante que a temperatura exata)</p>

        <h4>💧 Umidade</h4>
        <p><strong>Ideal:</strong> 60-70%</p>
        <p><strong>Muito seco:</strong> Rolhas ressecam e deixam entrar ar</p>
        <p><strong>Muito úmido:</strong> Rótulos deterioram e pode haver mofo</p>

        <h4>💡 Luz</h4>
        <p>Mantenha vinhos longe de luz direta, especialmente UV. A luz acelera o envelhecimento e pode causar defeitos. Garrafas escuras oferecem mais proteção.</p>

        <h4>📐 Posição</h4>
        <p><strong>Horizontal:</strong> Mantém a rolha úmida e vedada (essencial para guarda longa)</p>
        <p><strong>Vertical:</strong> Aceitável para consumo em curto prazo (até 6 meses)</p>

        <h4>🔇 Vibração</h4>
        <p>Evite vibrações constantes. Elas perturbam o sedimento e aceleram reações químicas indesejadas.</p>

        <h3>Tipos de Armazenamento</h3>

        <h4>Adega Climatizada</h4>
        <p><strong>Prós:</strong> Controle total de temperatura e umidade</p>
        <p><strong>Contras:</strong> Investimento inicial alto</p>
        <p><strong>Ideal para:</strong> Colecionadores sérios, vinhos de guarda</p>

        <h4>Adega Termoelétrica</h4>
        <p><strong>Prós:</strong> Sem vibração, silenciosa, eficiente</p>
        <p><strong>Contras:</strong> Capacidade limitada</p>
        <p><strong>Ideal para:</strong> Apartamentos, coleções pequenas</p>

        <h4>Adega Compressora</h4>
        <p><strong>Prós:</strong> Maior capacidade, resfriamento potente</p>
        <p><strong>Contras:</strong> Vibração leve, mais barulho</p>
        <p><strong>Ideal para:</strong> Coleções médias a grandes</p>

        <h4>Armazenamento Improvisado</h4>
        <p>Se não tiver adega, escolha:</p>
        <ul>
          <li>Local mais fresco da casa</li>
          <li>Longe de janelas e fontes de calor</li>
          <li>Armário fechado ou closet</li>
          <li>Evite cozinha e lavanderia</li>
        </ul>

        <h3>Quanto Tempo Guardar?</h3>
        <ul>
          <li><strong>Vinhos do dia a dia:</strong> Consumir em 1-2 anos</li>
          <li><strong>Vinhos de qualidade:</strong> 3-5 anos</li>
          <li><strong>Vinhos premium:</strong> 5-10 anos</li>
          <li><strong>Grandes vinhos:</strong> 10-30+ anos</li>
          <li><strong>Vinhos fortificados:</strong> Décadas</li>
        </ul>

        <h3>Sinais de Vinho Estragado</h3>
        <ul>
          <li>🚫 Cheiro de vinagre ou acetona</li>
          <li>🚫 Cor marrom em vinhos brancos</li>
          <li>🚫 Cor tijolo em tintos jovens</li>
          <li>🚫 Rolha empurrada para fora</li>
          <li>🚫 Vazamento pela rolha</li>
          <li>🚫 Cheiro de mofo ou papelão molhado (cork taint)</li>
        </ul>

        <h3>Organizando Sua Adega</h3>
        <ul>
          <li>📋 Mantenha inventário atualizado</li>
          <li>🏷️ Etiquete prateleiras por região ou uva</li>
          <li>📅 Organize por data de consumo ideal</li>
          <li>🔄 Sistema FIFO (First In, First Out) para vinhos do dia a dia</li>
          <li>⭐ Separe vinhos especiais para ocasiões</li>
        </ul>

        <h3>Vinho Aberto</h3>
        <p><strong>Conservação após abertura:</strong></p>
        <ul>
          <li>Espumantes: 1-3 dias (com tampa especial)</li>
          <li>Brancos leves: 3-5 dias (geladeira)</li>
          <li>Brancos encorpados: 3-5 dias (geladeira)</li>
          <li>Tintos: 3-5 dias (local fresco)</li>
          <li>Vinhos fortificados: 1-4 semanas</li>
        </ul>

        <p><strong>Dicas:</strong></p>
        <ul>
          <li>Use bombas de vácuo para remover ar</li>
          <li>Transfira para garrafa menor se sobrar pouco</li>
          <li>Sistemas de preservação com gás inerte (argônio)</li>
        </ul>
      `
    },
    {
      id: '7',
      title: 'Degustação Profissional: Método e Técnicas',
      category: 'escolha',
      icon: 'ri-eye-line',
      color: 'blue',
      excerpt: 'Aprenda a degustar vinhos como um sommelier profissional.',
      image: 'https://readdy.ai/api/search-image?query=wine%20tasting%20session%20with%20multiple%20glasses%20on%20white%20table%20professional%20sommelier%20notes%20elegant%20setup%20natural%20lighting%20refined%20atmosphere&width=800&height=500&seq=sommelier7&orientation=landscape',
      content: `
        <h3>Os Três Passos da Degustação</h3>

        <h4>👁️ 1. Análise Visual</h4>
        <p><strong>O que observar:</strong></p>
        <ul>
          <li><strong>Limpidez:</strong> Cristalino, brilhante, turvo?</li>
          <li><strong>Intensidade:</strong> Pálido, médio, profundo?</li>
          <li><strong>Cor:</strong> Matiz específico (rubi, granada, âmbar, etc.)</li>
          <li><strong>Lágrimas:</strong> Indicam álcool e glicerol</li>
        </ul>

        <p><strong>Como fazer:</strong></p>
        <ol>
          <li>Incline a taça sobre fundo branco</li>
          <li>Observe o centro e as bordas</li>
          <li>Note a evolução da cor do centro para a borda</li>
        </ol>

        <h4>👃 2. Análise Olfativa</h4>
        <p><strong>Primeiro nariz (vinho parado):</strong></p>
        <ul>
          <li>Aproxime o nariz da taça sem girar</li>
          <li>Inspire profundamente</li>
          <li>Identifique aromas primários</li>
        </ul>

        <p><strong>Segundo nariz (após girar):</strong></p>
        <ul>
          <li>Gire a taça suavemente</li>
          <li>Inspire novamente</li>
          <li>Aromas se intensificam e revelam complexidade</li>
        </ul>

        <p><strong>Famílias de aromas:</strong></p>
        <ul>
          <li><strong>Frutados:</strong> Frutas vermelhas, negras, cítricas, tropicais</li>
          <li><strong>Florais:</strong> Rosa, violeta, acácia, flor de laranjeira</li>
          <li><strong>Vegetais:</strong> Herbáceos, pimentão, eucalipto</li>
          <li><strong>Especiarias:</strong> Pimenta, cravo, canela, baunilha</li>
          <li><strong>Madeira:</strong> Carvalho, cedro, defumado, tostado</li>
          <li><strong>Terrosos:</strong> Cogumelo, terra molhada, mineral</li>
          <li><strong>Animais:</strong> Couro, caça (em vinhos maduros)</li>
        </ul>

        <h4>👅 3. Análise Gustativa</h4>
        <p><strong>Como degustar:</strong></p>
        <ol>
          <li>Tome um gole médio</li>
          <li>Deixe o vinho percorrer toda a boca</li>
          <li>Aspire ar pela boca (retronasal)</li>
          <li>Mastigue o vinho</li>
          <li>Engula ou cuspa</li>
          <li>Observe o retrogosto</li>
        </ol>

        <p><strong>O que avaliar:</strong></p>
        <ul>
          <li><strong>Doçura:</strong> Seco, meio-seco, doce</li>
          <li><strong>Acidez:</strong> Baixa, média, alta</li>
          <li><strong>Taninos:</strong> Macios, médios, firmes (tintos)</li>
          <li><strong>Corpo:</strong> Leve, médio, encorpado</li>
          <li><strong>Álcool:</strong> Sensação de calor</li>
          <li><strong>Sabores:</strong> Confirmam ou diferem dos aromas?</li>
          <li><strong>Equilíbrio:</strong> Harmonia entre elementos</li>
          <li><strong>Persistência:</strong> Quanto tempo duram os sabores?</li>
        </ul>

        <h3>Vocabulário do Sommelier</h3>
        <ul>
          <li><strong>Complexo:</strong> Múltiplas camadas de aromas e sabores</li>
          <li><strong>Estruturado:</strong> Boa presença de taninos e acidez</li>
          <li><strong>Elegante:</strong> Refinado, equilibrado, sutil</li>
          <li><strong>Encorpado:</strong> Sensação de peso e textura na boca</li>
          <li><strong>Persistente:</strong> Sabores que duram após engolir</li>
          <li><strong>Redondo:</strong> Taninos macios, bem integrados</li>
          <li><strong>Mineral:</strong> Notas de pedra, ardósia, sílex</li>
          <li><strong>Terroso:</strong> Aromas de terra, cogumelo, folhas</li>
        </ul>

        <h3>Defeitos Comuns</h3>
        <ul>
          <li><strong>Cork Taint (TCA):</strong> Cheiro de mofo, papelão molhado</li>
          <li><strong>Oxidação:</strong> Cor marrom, aromas de nozes ranças</li>
          <li><strong>Redução:</strong> Cheiro de enxofre, ovo podre</li>
          <li><strong>Brettanomyces:</strong> Aromas de estábulo, band-aid</li>
          <li><strong>Acetato de Etila:</strong> Cheiro de removedor de esmalte</li>
        </ul>

        <h3>Dicas para Degustação</h3>
        <ul>
          <li>🚫 Evite perfumes fortes</li>
          <li>🚫 Não fume antes de degustar</li>
          <li>🚫 Evite alimentos muito temperados</li>
          <li>✅ Use taças limpas e sem odores</li>
          <li>✅ Deguste em ambiente bem iluminado</li>
          <li>✅ Comece pelos vinhos mais leves</li>
          <li>✅ Faça pausas entre vinhos</li>
          <li>✅ Beba água e coma pão neutro</li>
        </ul>

        <h3>Tomando Notas</h3>
        <p>Registre suas impressões:</p>
        <ul>
          <li>Nome do vinho, produtor, safra</li>
          <li>Data da degustação</li>
          <li>Aparência, aromas, sabores</li>
          <li>Pontuação pessoal</li>
          <li>Harmonizações sugeridas</li>
          <li>Janela de consumo</li>
          <li>Preço e onde comprar</li>
        </ul>
      `
    },
    {
      id: '8',
      title: 'Regiões Vinícolas do Mundo',
      category: 'uvas',
      icon: 'ri-map-pin-line',
      color: 'green',
      excerpt: 'Explore as principais regiões produtoras e seus vinhos característicos.',
      image: 'https://readdy.ai/api/search-image?query=world%20map%20with%20wine%20regions%20highlighted%20elegant%20visualization%20professional%20design%20warm%20colors%20educational%20infographic%20style&width=800&height=500&seq=sommelier8&orientation=landscape',
      content: `
        <h3>🇫🇷 França - O Berço do Vinho</h3>

        <h4>Bordeaux</h4>
        <p><strong>Uvas:</strong> Cabernet Sauvignon, Merlot, Cabernet Franc</p>
        <p><strong>Estilo:</strong> Tintos elegantes e estruturados, brancos de Sauternes</p>
        <p><strong>Destaque:</strong> Châteaux classificados, vinhos de guarda</p>

        <h4>Borgonha</h4>
        <p><strong>Uvas:</strong> Pinot Noir, Chardonnay</p>
        <p><strong>Estilo:</strong> Vinhos elegantes e terroir-driven</p>
        <p><strong>Destaque:</strong> Grands Crus, expressão máxima do terroir</p>

        <h4>Champagne</h4>
        <p><strong>Uvas:</strong> Chardonnay, Pinot Noir, Pinot Meunier</p>
        <p><strong>Estilo:</strong> Espumantes pelo método tradicional</p>
        <p><strong>Destaque:</strong> Celebrações, luxo, prestígio</p>

        <h4>Vale do Rhône</h4>
        <p><strong>Uvas:</strong> Syrah, Grenache, Viognier</p>
        <p><strong>Estilo:</strong> Tintos potentes e especiados</p>
        <p><strong>Destaque:</strong> Châteauneuf-du-Pape, Côte-Rôtie</p>

        <h3>🇮🇹 Itália - Diversidade e Tradição</h3>

        <h4>Toscana</h4>
        <p><strong>Uvas:</strong> Sangiovese, Cabernet Sauvignon</p>
        <p><strong>Estilo:</strong> Chianti, Brunello, Super Tuscans</p>
        <p><strong>Destaque:</strong> Vinhos icônicos, paisagens deslumbrantes</p>

        <h4>Piemonte</h4>
        <p><strong>Uvas:</strong> Nebbiolo, Barbera, Moscato</p>
        <p><strong>Estilo:</strong> Barolo, Barbaresco - "Reis do vinho"</p>
        <p><strong>Destaque:</strong> Vinhos longevos e complexos</p>

        <h4>Vêneto</h4>
        <p><strong>Uvas:</strong> Corvina, Glera, Garganega</p>
        <p><strong>Estilo:</strong> Amarone, Prosecco, Soave</p>
        <p><strong>Destaque:</strong> Técnica appassimento, espumantes</p>

        <h3>🇪🇸 Espanha - Tradição e Inovação</h3>

        <h4>Rioja</h4>
        <p><strong>Uvas:</strong> Tempranillo, Garnacha</p>
        <p><strong>Estilo:</strong> Tintos com envelhecimento em carvalho</p>
        <p><strong>Destaque:</strong> Classificação por tempo de guarda</p>

        <h4>Ribera del Duero</h4>
        <p><strong>Uvas:</strong> Tempranillo (Tinto Fino)</p>
        <p><strong>Estilo:</strong> Tintos potentes e concentrados</p>
        <p><strong>Destaque:</strong> Vega Sicilia, Pingus</p>

        <h4>Priorat</h4>
        <p><strong>Uvas:</strong> Garnacha, Cariñena</p>
        <p><strong>Estilo:</strong> Vinhos minerais de encosta</p>
        <p><strong>Destaque:</strong> Terroir único de ardósia</p>

        <h3>🇵🇹 Portugal - Tesouros Escondidos</h3>

        <h4>Douro</h4>
        <p><strong>Uvas:</strong> Touriga Nacional, Touriga Franca</p>
        <p><strong>Estilo:</strong> Vinho do Porto, tintos secos</p>
        <p><strong>Destaque:</strong> Paisagem Patrimônio da UNESCO</p>

        <h4>Alentejo</h4>
        <p><strong>Uvas:</strong> Aragonês, Trincadeira</p>
        <p><strong>Estilo:</strong> Tintos frutados e acessíveis</p>
        <p><strong>Destaque:</strong> Excelente custo-benefício</p>

        <h3>🇺🇸 Estados Unidos - Novo Mundo</h3>

        <h4>Napa Valley</h4>
        <p><strong>Uvas:</strong> Cabernet Sauvignon</p>
        <p><strong>Estilo:</strong> Tintos potentes e concentrados</p>
        <p><strong>Destaque:</strong> Cult wines, preços premium</p>

        <h4>Sonoma</h4>
        <p><strong>Uvas:</strong> Pinot Noir, Chardonnay, Zinfandel</p>
        <p><strong>Estilo:</strong> Diversidade de microclimas</p>
        <p><strong>Destaque:</strong> Russian River Valley</p>

        <h3>🇦🇷 Argentina - Malbec Mundial</h3>

        <h4>Mendoza</h4>
        <p><strong>Uvas:</strong> Malbec, Cabernet Sauvignon</p>
        <p><strong>Estilo:</strong> Tintos frutados e macios</p>
        <p><strong>Destaque:</strong> Altitude, sol intenso</p>

        <h3>🇨🇱 Chile - Qualidade e Valor</h3>

        <h4>Maipo Valley</h4>
        <p><strong>Uvas:</strong> Cabernet Sauvignon</p>
        <p><strong>Estilo:</strong> Tintos elegantes</p>
        <p><strong>Destaque:</strong> Proximidade dos Andes</p>

        <h4>Casablanca Valley</h4>
        <p><strong>Uvas:</strong> Sauvignon Blanc, Chardonnay</p>
        <p><strong>Estilo:</strong> Brancos frescos e minerais</p>
        <p><strong>Destaque:</strong> Influência marítima</p>

        <h3>🇦🇺 Austrália - Ousadia e Inovação</h3>

        <h4>Barossa Valley</h4>
        <p><strong>Uvas:</strong> Shiraz</p>
        <p><strong>Estilo:</strong> Tintos potentes e frutados</p>
        <p><strong>Destaque:</strong> Vinhas centenárias</p>

        <h4>Margaret River</h4>
        <p><strong>Uvas:</strong> Cabernet Sauvignon, Chardonnay</p>
        <p><strong>Estilo:</strong> Elegância e complexidade</p>
        <p><strong>Destaque:</strong> Influência marítima</p>

        <h3>🇳🇿 Nova Zelândia - Pureza e Frescor</h3>

        <h4>Marlborough</h4>
        <p><strong>Uvas:</strong> Sauvignon Blanc</p>
        <p><strong>Estilo:</strong> Brancos aromáticos e vibrantes</p>
        <p><strong>Destaque:</strong> Referência mundial</p>

        <h4>Central Otago</h4>
        <p><strong>Uvas:</strong> Pinot Noir</p>
        <p><strong>Estilo:</strong> Elegantes e frutados</p>
        <p><strong>Destaque:</strong> Região mais ao sul do mundo</p>

        <h3>🇿🇦 África do Sul - Renascimento</h3>

        <h4>Stellenbosch</h4>
        <p><strong>Uvas:</strong> Cabernet Sauvignon, Pinotage</p>
        <p><strong>Estilo:</strong> Tintos estruturados</p>
        <p><strong>Destaque:</strong> Uva Pinotage (exclusiva)</p>
      `
    }
  ];

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(a => a.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <i className="ri-lightbulb-line text-2xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Dicas do Sommelier</h2>
            <p className="text-white/90 text-sm">Conhecimento profissional sobre vinhos</p>
          </div>
        </div>
        <p className="text-white/90 leading-relaxed">
          Aprenda com especialistas sobre escolha, harmonização, uvas, terroir, história e muito mais. 
          Transforme-se em um conhecedor de vinhos! 🍷✨
        </p>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
              selectedCategory === cat.id
                ? `bg-${cat.color}-600 text-white shadow-lg`
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <i className={`${cat.icon} text-lg`}></i>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className={`absolute top-4 right-4 w-10 h-10 bg-${article.color}-600 rounded-lg flex items-center justify-center`}>
                <i className={`${article.icon} text-white text-lg`}></i>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {article.excerpt}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-xs font-medium text-${article.color}-600 bg-${article.color}-50 px-3 py-1 rounded-full`}>
                  {categories.find(c => c.id === article.category)?.label}
                </span>
                <i className="ri-arrow-right-line text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all"></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="relative h-64">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-all"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
              <div className="absolute bottom-6 left-6 right-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1 bg-${selectedArticle.color}-600 text-white rounded-full text-xs font-medium mb-3`}>
                  <i className={selectedArticle.icon}></i>
                  {categories.find(c => c.id === selectedArticle.category)?.label}
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {selectedArticle.title}
                </h2>
                <p className="text-white/90 text-sm">
                  {selectedArticle.excerpt}
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-16rem)]">
              <div 
                className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-h3:text-xl prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3 prose-h4:text-lg prose-h4:font-semibold prose-h4:mt-4 prose-h4:mb-2 prose-p:text-gray-600 prose-p:leading-relaxed prose-ul:text-gray-600 prose-li:my-1 prose-strong:text-gray-900 prose-table:text-sm"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 p-6 bg-gray-50">
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
