export default function GoalsTab() {
  const goals = [
    {
      id: 1,
      title: '50 Restaurantes Michelin',
      icon: 'ri-star-line',
      current: 12,
      target: 50,
      color: 'from-yellow-400 to-yellow-600',
      bgColor: 'from-yellow-50 to-yellow-100',
    },
    {
      id: 2,
      title: '100 Vinhos Premium',
      icon: 'ri-goblet-line',
      current: 89,
      target: 100,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
    },
    {
      id: 3,
      title: 'Culinárias de 30 Países',
      icon: 'ri-earth-line',
      current: 18,
      target: 30,
      color: 'from-green-400 to-green-600',
      bgColor: 'from-green-50 to-green-100',
    },
    {
      id: 4,
      title: '200 Pratos Memoráveis',
      icon: 'ri-restaurant-line',
      current: 156,
      target: 200,
      color: 'from-pink-400 to-pink-600',
      bgColor: 'from-pink-50 to-pink-100',
    },
    {
      id: 5,
      title: '150 Drinks & Coquetéis',
      icon: 'ri-cup-line',
      current: 73,
      target: 150,
      color: 'from-teal-400 to-teal-600',
      bgColor: 'from-teal-50 to-teal-100',
    },
    {
      id: 6,
      title: '10 Estrelas Michelin',
      icon: 'ri-trophy-line',
      current: 12,
      target: 10,
      color: 'from-orange-400 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map((goal) => {
        const percentage = Math.min((goal.current / goal.target) * 100, 100);
        const isCompleted = goal.current >= goal.target;

        return (
          <div
            key={goal.id}
            className={`bg-gradient-to-br ${goal.bgColor} rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden`}
          >
            {isCompleted && (
              <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <i className="ri-check-line text-white text-lg"></i>
              </div>
            )}

            <div className={`w-14 h-14 bg-gradient-to-br ${goal.color} rounded-xl flex items-center justify-center mb-4`}>
              <i className={`${goal.icon} text-white text-2xl`}></i>
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-2">{goal.title}</h3>

            <div className="flex items-end gap-2 mb-3">
              <span className="text-3xl font-bold text-gray-900">{goal.current}</span>
              <span className="text-lg text-gray-600 mb-1">/ {goal.target}</span>
            </div>

            <div className="w-full bg-white/50 rounded-full h-3 mb-2 overflow-hidden">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${goal.color} transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">{percentage.toFixed(0)}% completo</span>
              {isCompleted ? (
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  ✓ Concluído
                </span>
              ) : (
                <span className="text-xs text-gray-600">
                  Faltam {goal.target - goal.current}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
