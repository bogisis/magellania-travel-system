import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, MapPin, Calendar, Users, DollarSign, 
  Edit, Trash2, Eye, Download,
  Check, AlertTriangle, Plane, Hotel, Camera
} from 'lucide-react';

const MagellaniaDesignSystem = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  
  // Toast notification
  const showSuccessToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Skeleton loader component
  const SkeletonLoader = ({ width = "100%", height = "20px" }) => (
    <div 
      className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded"
      style={{ width, height, backgroundSize: '200% 100%' }}
    />
  );

  // Dashboard component
  const Dashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">💰 Выручка за месяц</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$125,400</p>
              <p className="text-green-600 text-sm mt-1">+12% к прошлому месяцу</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">📋 Смет создано</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">47</p>
              <p className="text-blue-600 text-sm mt-1">8 на рассмотрении</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Edit className="text-white" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">🎯 Конверсия</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">67%</p>
              <p className="text-green-600 text-sm mt-1">Выше среднего</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Check className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Быстрые действия</h3>
        <div className="flex flex-wrap gap-3">
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2">
            <Plus size={16} />
            Новая смета
          </button>
          <button className="bg-white text-blue-600 border-2 border-blue-200 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-all flex items-center gap-2">
            <Camera size={16} />
            Из шаблона
          </button>
          <button className="bg-white text-gray-600 border-2 border-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center gap-2">
            <Download size={16} />
            Отчет
          </button>
        </div>
      </div>

      {/* Recent Estimates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">📋 Последние сметы</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { name: "Патагония: ледники и треккинг", location: "🇦🇷 Аргентина", price: "$12,400", status: "🔄", days: "7 дней" },
            { name: "Ушуая: конец света", location: "🇦🇷 Аргентина", price: "$18,900", status: "✅", days: "5 дней" },
            { name: "Мендоса: винные туры", location: "🇦🇷 Аргентина", price: "$8,200", status: "📅", days: "3 дня" }
          ].map((estimate, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{estimate.name}</p>
                  <p className="text-sm text-gray-600">{estimate.location} • {estimate.days}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-900">{estimate.price}</span>
                  <span className="text-lg">{estimate.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Estimate Editor component
  const EstimateEditor = () => {
    const [days, setDays] = useState([
      {
        id: 1,
        title: "Прибытие в Буэнос-Айрес",
        date: "01 декабря",
        activities: [
          { description: "Трансфер из аэропорта", quantity: 1, price: 50, type: "transport" },
          { description: "Отель Hilton BA", quantity: 1, price: 180, type: "hotel" },
          { description: "Ужин в ресторане", quantity: 4, price: 45, type: "meal" }
        ]
      },
      {
        id: 2,
        title: "Полет в Эль Калафате",
        date: "02 декабря", 
        activities: [
          { description: "Перелет BA → FTE", quantity: 4, price: 350, type: "flight" },
          { description: "Трансфер + гид", quantity: 1, price: 120, type: "transport" }
        ]
      }
    ]);

    const handleDragStart = (e, dayIndex, activityIndex) => {
      setDraggedItem({ dayIndex, activityIndex });
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    const handleDrop = (e, targetDayIndex) => {
      e.preventDefault();
      if (draggedItem) {
        // Реализация перемещения активности
        showSuccessToast();
      }
      setDraggedItem(null);
    };

    const getActivityIcon = (type) => {
      switch (type) {
        case 'transport': return '🚗';
        case 'hotel': return '🏨';
        case 'meal': return '🍽️';
        case 'flight': return '✈️';
        default: return '📋';
      }
    };

    return (
      <div className="space-y-6">
        {/* Tour Info Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название тура</label>
              <input 
                type="text"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                defaultValue="Патагония: ледники и треккинг"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Страна</label>
              <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all">
                <option>🇦🇷 Аргентина</option>
                <option>🇨🇱 Чили</option>
                <option>🇵🇪 Перу</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Начало тура</label>
              <input 
                type="date"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                defaultValue="2024-12-01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дней</label>
              <input 
                type="number"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                defaultValue="7"
              />
            </div>
          </div>
        </div>

        {/* Days List */}
        {days.map((day, dayIndex) => (
          <div 
            key={day.id} 
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, dayIndex)}
          >
            {/* Day Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">📅 День {day.id} • {day.date}</h3>
                  <p className="opacity-90">{day.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    💰 ${day.activities.reduce((sum, act) => sum + (act.quantity * act.price), 0)}
                  </span>
                  <button className="hover:bg-white/20 p-2 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="divide-y divide-gray-100">
              {day.activities.map((activity, activityIndex) => (
                <div 
                  key={activityIndex}
                  className="p-4 hover:bg-gray-50 cursor-grab active:cursor-grabbing transition-colors"
                  draggable
                  onDragStart={(e) => handleDragStart(e, dayIndex, activityIndex)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <input 
                        type="text"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        defaultValue={activity.description}
                      />
                      <input 
                        type="number"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        defaultValue={activity.quantity}
                      />
                      <input 
                        type="number"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        defaultValue={activity.price}
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">${activity.quantity * activity.price}</span>
                        <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add Activity Button */}
              <div className="p-4">
                <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2">
                  <Plus size={16} />
                  Добавить активность
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add Day Button */}
        <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2">
          <Plus size={20} />
          📅 Добавить день
        </button>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Итоговая смета</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Базовая стоимость:</span>
              <span>$12,840</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Наценка (15%):</span>
              <span>$1,926</span>
            </div>
            <div className="border-t-2 border-gray-200 pt-3">
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Итого к оплате:</span>
                <span>$14,766</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            <button 
              onClick={() => {
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  showSuccessToast();
                }, 1500);
              }}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Сохранение...
                </>
              ) : (
                <>💾 Сохранить</>
              )}
            </button>
            <button className="bg-white text-blue-600 border-2 border-blue-200 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-all flex items-center gap-2">
              <Eye size={16} />
              👁️ Предпросмотр
            </button>
            <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2">
              <Download size={16} />
              📧 Отправить
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading State Example
  const LoadingExample = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <SkeletonLoader width="120px" height="16px" />
                <SkeletonLoader width="80px" height="24px" />
              </div>
              <SkeletonLoader width="48px" height="48px" />
            </div>
            <SkeletonLoader width="100px" height="14px" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">🗺️ Magellania Travel System</h1>
              <p className="opacity-90 mt-1">Профессиональное планирование туристических программ</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm opacity-90">Добро пожаловать, Анна</span>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                👤
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-0">
            {[
              { id: 'dashboard', label: '🏠 Главная', component: Dashboard },
              { id: 'estimates', label: '📊 Редактор смет', component: EstimateEditor },
              { id: 'loading', label: '⏳ Состояние загрузки', component: LoadingExample }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 border-b-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'estimates' && <EstimateEditor />}
        {activeTab === 'loading' && <LoadingExample />}
      </main>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-xl shadow-lg p-4 border-l-4 border-l-green-500 animate-slide-in-right max-w-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="text-white" size={16} />
            </div>
            <div>
              <p className="font-medium text-gray-900">Успешно сохранено!</p>
              <p className="text-sm text-gray-600">Смета обновлена и готова к отправке</p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MagellaniaDesignSystem;