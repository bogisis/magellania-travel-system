// Данные стран и регионов для системы создания смет

export const countries = [
  {
    id: 'argentina',
    name: 'Аргентина',
    regions: [
      {
        id: 'buenos-aires',
        name: 'Буэнос-Айрес',
        cities: [
          'Буэнос-Айрес',
          'Ла-Плата',
          'Мар-дель-Плата',
          'Росарио',
          'Кордова',
          'Мендоса',
          'Сальта',
          'Ушуайя',
          'Эль-Калафате',
          'Пуэрто-Мадрин',
          'Барилоче',
          'Игуасу'
        ]
      },
      {
        id: 'patagonia',
        name: 'Патагония',
        cities: [
          'Ушуайя',
          'Эль-Калафате',
          'Пуэрто-Мадрин',
          'Барилоче',
          'Эскель',
          'Трелью',
          'Комодоро-Ривадавия',
          'Рио-Гальегос'
        ]
      },
      {
        id: 'northwest',
        name: 'Северо-Запад',
        cities: [
          'Сальта',
          'Жужуй',
          'Тукуман',
          'Катамарка',
          'Ла-Риоха',
          'Сантьяго-дель-Эстеро'
        ]
      },
      {
        id: 'cuyo',
        name: 'Куйо',
        cities: [
          'Мендоса',
          'Сан-Хуан',
          'Сан-Луис',
          'Ла-Риоха'
        ]
      },
      {
        id: 'pampas',
        name: 'Пампасы',
        cities: [
          'Росарио',
          'Санта-Фе',
          'Парана',
          'Кордова',
          'Баия-Бланка'
        ]
      }
    ]
  },
  {
    id: 'chile',
    name: 'Чили',
    regions: [
      {
        id: 'santiago',
        name: 'Сантьяго',
        cities: [
          'Сантьяго',
          'Вальпараисо',
          'Винья-дель-Мар',
          'Консепсьон',
          'Антофагаста',
          'Икике',
          'Арика',
          'Пуэрто-Монт',
          'Пунта-Аренас'
        ]
      },
      {
        id: 'atacama',
        name: 'Атакама',
        cities: [
          'Сан-Педро-де-Атакама',
          'Антофагаста',
          'Икике',
          'Арика',
          'Копиапо',
          'Ла-Серена'
        ]
      },
      {
        id: 'patagonia-chile',
        name: 'Патагония',
        cities: [
          'Пуэрто-Монт',
          'Пунта-Аренас',
          'Пуэрто-Наталес',
          'Койайке',
          'Порвенир'
        ]
      },
      {
        id: 'easter-island',
        name: 'Остров Пасхи',
        cities: [
          'Ханга-Роа'
        ]
      }
    ]
  },
  {
    id: 'peru',
    name: 'Перу',
    regions: [
      {
        id: 'lima',
        name: 'Лима',
        cities: [
          'Лима',
          'Куско',
          'Арекипа',
          'Трухильо',
          'Пьюра',
          'Чиклайо',
          'Пиура',
          'Икитос',
          'Пуно',
          'Аякучо'
        ]
      },
      {
        id: 'cusco',
        name: 'Куско',
        cities: [
          'Куско',
          'Мачу-Пикчу',
          'Священная долина',
          'Ольянтайтамбо',
          'Писак',
          'Чинчеро'
        ]
      },
      {
        id: 'amazon',
        name: 'Амазония',
        cities: [
          'Икитос',
          'Пукальпа',
          'Тарапото',
          'Хуанхуй'
        ]
      }
    ]
  },
  {
    id: 'uruguay',
    name: 'Уругвай',
    regions: [
      {
        id: 'montevideo',
        name: 'Монтевидео',
        cities: [
          'Монтевидео',
          'Пунта-дель-Эсте',
          'Колония-дель-Сакраменто',
          'Сальто',
          'Пайсанду',
          'Ривера'
        ]
      }
    ]
  },
  {
    id: 'brazil',
    name: 'Бразилия',
    regions: [
      {
        id: 'rio',
        name: 'Рио-де-Жанейро',
        cities: [
          'Рио-де-Жанейро',
          'Сан-Паулу',
          'Бразилиа',
          'Сальвадор',
          'Ресифи',
          'Форталеза',
          'Манаус',
          'Белу-Оризонти'
        ]
      },
      {
        id: 'amazon-brazil',
        name: 'Амазония',
        cities: [
          'Манаус',
          'Белен',
          'Порту-Велью',
          'Рио-Бранко'
        ]
      }
    ]
  },
  {
    id: 'colombia',
    name: 'Колумбия',
    regions: [
      {
        id: 'bogota',
        name: 'Богота',
        cities: [
          'Богота',
          'Медельин',
          'Кали',
          'Картахена',
          'Барранкилья',
          'Санта-Марта',
          'Перейра',
          'Букараманга'
        ]
      }
    ]
  },
  {
    id: 'ecuador',
    name: 'Эквадор',
    regions: [
      {
        id: 'quito',
        name: 'Кито',
        cities: [
          'Кито',
          'Гуаякиль',
          'Куэнка',
          'Манта',
          'Галапагосские острова'
        ]
      }
    ]
  },
  {
    id: 'bolivia',
    name: 'Боливия',
    regions: [
      {
        id: 'la-paz',
        name: 'Ла-Пас',
        cities: [
          'Ла-Пас',
          'Санта-Крус',
          'Кочабамба',
          'Оруро',
          'Потоси',
          'Сукре'
        ]
      }
    ]
  },
  {
    id: 'paraguay',
    name: 'Парагвай',
    regions: [
      {
        id: 'asuncion',
        name: 'Асунсьон',
        cities: [
          'Асунсьон',
          'Сьюдад-дель-Эсте',
          'Энкарнасьон',
          'Педро-Хуан-Кабальеро'
        ]
      }
    ]
  },
  {
    id: 'venezuela',
    name: 'Венесуэла',
    regions: [
      {
        id: 'caracas',
        name: 'Каракас',
        cities: [
          'Каракас',
          'Маракайбо',
          'Валенсия',
          'Баркисимето',
          'Мерида'
        ]
      }
    ]
  },
  {
    id: 'guyana',
    name: 'Гайана',
    regions: [
      {
        id: 'georgetown',
        name: 'Джорджтаун',
        cities: [
          'Джорджтаун',
          'Линден',
          'Нью-Амстердам'
        ]
      }
    ]
  },
  {
    id: 'suriname',
    name: 'Суринам',
    regions: [
      {
        id: 'paramaribo',
        name: 'Парамарибо',
        cities: [
          'Парамарибо',
          'Лелидорп',
          'Ньив-Никкери'
        ]
      }
    ]
  },
  {
    id: 'french-guiana',
    name: 'Французская Гвиана',
    regions: [
      {
        id: 'cayenne',
        name: 'Каен',
        cities: [
          'Каен',
          'Куру',
          'Сен-Лоран-дю-Марони'
        ]
      }
    ]
  }
]

// Функции для работы с данными стран
export const getCountryById = (countryId) => {
  return countries.find(country => country.id === countryId)
}

export const getRegionById = (countryId, regionId) => {
  const country = getCountryById(countryId)
  if (!country) return null
  return country.regions.find(region => region.id === regionId)
}

export const getCitiesByRegion = (countryId, regionId) => {
  const region = getRegionById(countryId, regionId)
  return region ? region.cities : []
}

export const getAllCountries = () => {
  return countries.map(country => ({
    id: country.id,
    name: country.name
  }))
}

export const getRegionsByCountry = (countryId) => {
  const country = getCountryById(countryId)
  return country ? country.regions.map(region => ({
    id: region.id,
    name: region.name
  })) : []
}

// Сортировка стран по приоритету (Аргентина, Чили, остальные по алфавиту)
export const getSortedCountries = () => {
  const priorityCountries = ['argentina', 'chile']
  const otherCountries = countries.filter(country => !priorityCountries.includes(country.id))
  
  return [
    ...priorityCountries.map(id => countries.find(c => c.id === id)),
    ...otherCountries.sort((a, b) => a.name.localeCompare(b.name))
  ]
}
