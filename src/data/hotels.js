// База данных гостиниц для системы создания смет

export const hotels = [
  // Аргентина - Буэнос-Айрес
  {
    id: 'hotel_ba_1',
    name: 'Hotel Plaza Mayor',
    category: '4',
    country: 'argentina',
    region: 'buenos-aires',
    city: 'Буэнос-Айрес',
    address: 'Av. de Mayo 1234',
    phone: '+54 11 1234-5678',
    email: 'info@plazamayor.com',
    website: 'www.plazamayor.com',
    description: 'Элегантный отель в историческом центре города',
    amenities: ['Wi-Fi', 'Ресторан', 'Спа', 'Фитнес-центр', 'Конференц-зал'],
    priceRange: {
      single: 120,
      double: 150,
      triple: 180,
      suite: 250,
    },
    currency: 'USD',
    supplier: 'Plaza Mayor Hotels',
    contactPerson: 'Мария Гонсалес',
    contactPhone: '+54 11 9876-5432',
    contactEmail: 'maria@plazamayor.com',
    commission: 15,
    notes: 'Отличное расположение, рядом с основными достопримечательностями',
  },
  {
    id: 'hotel_ba_2',
    name: 'Buenos Aires Grand Hotel',
    category: '5',
    country: 'argentina',
    region: 'buenos-aires',
    city: 'Буэнос-Айрес',
    address: 'Recoleta 567',
    phone: '+54 11 2345-6789',
    email: 'reservas@grandhotel.com',
    website: 'www.grandhotel.com',
    description: 'Роскошный 5-звездочный отель в престижном районе',
    amenities: ['Wi-Fi', 'Ресторан', 'Спа', 'Бассейн', 'Фитнес-центр', 'Консьерж'],
    priceRange: {
      single: 200,
      double: 250,
      triple: 300,
      suite: 400,
    },
    currency: 'USD',
    supplier: 'Grand Hotels Group',
    contactPerson: 'Карлос Родригес',
    contactPhone: '+54 11 8765-4321',
    contactEmail: 'carlos@grandhotel.com',
    commission: 20,
    notes: 'VIP обслуживание, эксклюзивные услуги',
  },
  {
    id: 'hotel_ba_3',
    name: 'Hostel San Telmo',
    category: '2',
    country: 'argentina',
    region: 'buenos-aires',
    city: 'Буэнос-Айрес',
    address: 'San Telmo 890',
    phone: '+54 11 3456-7890',
    email: 'info@hostelsantelmo.com',
    website: 'www.hostelsantelmo.com',
    description: 'Уютный хостел в историческом районе',
    amenities: ['Wi-Fi', 'Общая кухня', 'Прачечная', 'Терраса'],
    priceRange: {
      dormitory: 25,
      private: 60,
      double: 80,
    },
    currency: 'USD',
    supplier: 'San Telmo Hostels',
    contactPerson: 'Ана Мартинес',
    contactPhone: '+54 11 7654-3210',
    contactEmail: 'ana@hostelsantelmo.com',
    commission: 10,
    notes: 'Идеально для бюджетных туристов',
  },

  // Аргентина - Патагония
  {
    id: 'hotel_pat_1',
    name: 'Hotel Patagonia Lodge',
    category: '4',
    country: 'argentina',
    region: 'patagonia',
    city: 'Эль-Калафате',
    address: 'Ruta 11, km 25',
    phone: '+54 2902 123-456',
    email: 'info@patagonialodge.com',
    website: 'www.patagonialodge.com',
    description: 'Лодж в сердце Патагонии с видом на ледники',
    amenities: ['Wi-Fi', 'Ресторан', 'Бар', 'Экскурсии', 'Трансфер'],
    priceRange: {
      single: 180,
      double: 220,
      triple: 260,
      cabin: 350,
    },
    currency: 'USD',
    supplier: 'Patagonia Lodges',
    contactPerson: 'Пабло Эрнандес',
    contactPhone: '+54 2902 654-321',
    contactEmail: 'pablo@patagonialodge.com',
    commission: 18,
    notes: 'Уникальное расположение, эксклюзивные туры',
  },

  // Чили - Сантьяго
  {
    id: 'hotel_scl_1',
    name: 'Santiago Central Hotel',
    category: '4',
    country: 'chile',
    region: 'santiago',
    city: 'Сантьяго',
    address: 'Providencia 1234',
    phone: '+56 2 2345-6789',
    email: 'reservas@santiagocentral.com',
    website: 'www.santiagocentral.com',
    description: 'Современный отель в центре Сантьяго',
    amenities: ['Wi-Fi', 'Ресторан', 'Спа', 'Фитнес-центр', 'Бизнес-центр'],
    priceRange: {
      single: 140,
      double: 180,
      triple: 220,
      suite: 300,
    },
    currency: 'USD',
    supplier: 'Santiago Hotels',
    contactPerson: 'Изабелла Фернандес',
    contactPhone: '+56 2 8765-4321',
    contactEmail: 'isabella@santiagocentral.com',
    commission: 16,
    notes: 'Отличная транспортная доступность',
  },
  {
    id: 'hotel_scl_2',
    name: 'Wine Valley Resort',
    category: '5',
    country: 'chile',
    region: 'santiago',
    city: 'Сантьяго',
    address: 'Valle del Maipo 567',
    phone: '+56 2 3456-7890',
    email: 'info@winevalley.com',
    website: 'www.winevalley.com',
    description: 'Роскошный курорт в винодельческой долине',
    amenities: ['Wi-Fi', 'Ресторан', 'Спа', 'Бассейн', 'Винные туры', 'Гольф'],
    priceRange: {
      single: 250,
      double: 320,
      triple: 380,
      villa: 500,
    },
    currency: 'USD',
    supplier: 'Wine Valley Group',
    contactPerson: 'Роберто Сильва',
    contactPhone: '+56 2 7654-3210',
    contactEmail: 'roberto@winevalley.com',
    commission: 22,
    notes: 'Эксклюзивные винные туры включены',
  },

  // Чили - Атакама
  {
    id: 'hotel_atc_1',
    name: 'Atacama Desert Lodge',
    category: '4',
    country: 'chile',
    region: 'atacama',
    city: 'Сан-Педро-де-Атакама',
    address: 'San Pedro 890',
    phone: '+56 55 123-456',
    email: 'info@atacamalodge.com',
    website: 'www.atacamalodge.com',
    description: 'Уникальный лодж в пустыне Атакама',
    amenities: ['Wi-Fi', 'Ресторан', 'Астрономические туры', 'Спа', 'Бассейн'],
    priceRange: {
      single: 200,
      double: 250,
      triple: 300,
      suite: 400,
    },
    currency: 'USD',
    supplier: 'Atacama Lodges',
    contactPerson: 'Кармен Варгас',
    contactPhone: '+56 55 654-321',
    contactEmail: 'carmen@atacamalodge.com',
    commission: 20,
    notes: 'Лучшие астрономические туры в регионе',
  },

  // Перу - Лима
  {
    id: 'hotel_lim_1',
    name: 'Lima Colonial Hotel',
    category: '4',
    country: 'peru',
    region: 'lima',
    city: 'Лима',
    address: 'Miraflores 1234',
    phone: '+51 1 234-5678',
    email: 'reservas@limacolonial.com',
    website: 'www.limacolonial.com',
    description: 'Колониальный отель в историческом центре',
    amenities: ['Wi-Fi', 'Ресторан', 'Спа', 'Терраса', 'Экскурсии'],
    priceRange: {
      single: 130,
      double: 170,
      triple: 210,
      suite: 280,
    },
    currency: 'USD',
    supplier: 'Lima Colonial Hotels',
    contactPerson: 'Хуан Перес',
    contactPhone: '+51 1 876-5432',
    contactEmail: 'juan@limacolonial.com',
    commission: 15,
    notes: 'Аутентичная колониальная атмосфера',
  },

  // Перу - Куско
  {
    id: 'hotel_cuz_1',
    name: 'Cusco Sacred Valley Resort',
    category: '5',
    country: 'peru',
    region: 'cusco',
    city: 'Куско',
    address: 'Sacred Valley 567',
    phone: '+51 84 234-5678',
    email: 'info@sacredvalley.com',
    website: 'www.sacredvalley.com',
    description: 'Роскошный курорт в Священной долине инков',
    amenities: ['Wi-Fi', 'Ресторан', 'Спа', 'Бассейн', 'Экскурсии', 'Йога'],
    priceRange: {
      single: 220,
      double: 280,
      triple: 340,
      suite: 450,
    },
    currency: 'USD',
    supplier: 'Sacred Valley Resorts',
    contactPerson: 'Мария Кесада',
    contactPhone: '+51 84 876-5432',
    contactEmail: 'maria@sacredvalley.com',
    commission: 25,
    notes: 'Эксклюзивные туры к Мачу-Пикчу',
  },
]

// Функции для работы с данными гостиниц
export const getHotelById = (hotelId) => {
  return hotels.find((hotel) => hotel.id === hotelId)
}

export const getHotelsByLocation = (country, region, city) => {
  return hotels.filter((hotel) => {
    const countryMatch = !country || hotel.country === country
    const regionMatch = !region || hotel.region === region
    const cityMatch = !city || hotel.city === city
    return countryMatch && regionMatch && cityMatch
  })
}

export const getHotelsByCategory = (category) => {
  return hotels.filter((hotel) => hotel.category === category)
}

export const searchHotels = (query) => {
  const searchTerm = query.toLowerCase()
  return hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchTerm) ||
      hotel.city.toLowerCase().includes(searchTerm) ||
      hotel.description.toLowerCase().includes(searchTerm),
  )
}

export const getHotelsBySupplier = (supplier) => {
  return hotels.filter((hotel) => hotel.supplier === supplier)
}

export const getAllSuppliers = () => {
  const suppliers = [...new Set(hotels.map((hotel) => hotel.supplier))]
  return suppliers.sort()
}

export const getPriceRange = (hotel) => {
  const prices = Object.values(hotel.priceRange)
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  }
}

export const addHotel = (hotelData) => {
  const newHotel = {
    id: `hotel_${Date.now()}`,
    ...hotelData,
    createdAt: new Date().toISOString(),
  }
  hotels.push(newHotel)
  return newHotel
}

export const updateHotel = (hotelId, updates) => {
  const index = hotels.findIndex((hotel) => hotel.id === hotelId)
  if (index !== -1) {
    hotels[index] = { ...hotels[index], ...updates, updatedAt: new Date().toISOString() }
    return hotels[index]
  }
  return null
}

export const deleteHotel = (hotelId) => {
  const index = hotels.findIndex((hotel) => hotel.id === hotelId)
  if (index !== -1) {
    return hotels.splice(index, 1)[0]
  }
  return null
}
