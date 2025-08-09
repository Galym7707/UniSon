import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')
    
    if (!country) {
      return NextResponse.json(
        { error: 'Country parameter is required' },
        { status: 400 }
      )
    }

    const citiesByCountry: Record<string, Array<{id: string, name: string, country: string}>> = {
      'afghanistan': [
        { id: 'kabul', name: 'Kabul', country: 'afghanistan' },
        { id: 'kandahar', name: 'Kandahar', country: 'afghanistan' },
        { id: 'herat', name: 'Herat', country: 'afghanistan' }
      ],
      'albania': [
        { id: 'tirana', name: 'Tirana', country: 'albania' },
        { id: 'durres', name: 'Durrës', country: 'albania' },
        { id: 'vlore', name: 'Vlorë', country: 'albania' }
      ],
      'algeria': [
        { id: 'algiers', name: 'Algiers', country: 'algeria' },
        { id: 'oran', name: 'Oran', country: 'algeria' },
        { id: 'constantine', name: 'Constantine', country: 'algeria' }
      ],
      'argentina': [
        { id: 'buenos-aires', name: 'Buenos Aires', country: 'argentina' },
        { id: 'cordoba', name: 'Córdoba', country: 'argentina' },
        { id: 'rosario', name: 'Rosario', country: 'argentina' }
      ],
      'australia': [
        { id: 'sydney', name: 'Sydney', country: 'australia' },
        { id: 'melbourne', name: 'Melbourne', country: 'australia' },
        { id: 'brisbane', name: 'Brisbane', country: 'australia' },
        { id: 'perth', name: 'Perth', country: 'australia' },
        { id: 'adelaide', name: 'Adelaide', country: 'australia' }
      ],
      'austria': [
        { id: 'vienna', name: 'Vienna', country: 'austria' },
        { id: 'salzburg', name: 'Salzburg', country: 'austria' },
        { id: 'innsbruck', name: 'Innsbruck', country: 'austria' }
      ],
      'bangladesh': [
        { id: 'dhaka', name: 'Dhaka', country: 'bangladesh' },
        { id: 'chittagong', name: 'Chittagong', country: 'bangladesh' },
        { id: 'sylhet', name: 'Sylhet', country: 'bangladesh' }
      ],
      'belgium': [
        { id: 'brussels', name: 'Brussels', country: 'belgium' },
        { id: 'antwerp', name: 'Antwerp', country: 'belgium' },
        { id: 'ghent', name: 'Ghent', country: 'belgium' }
      ],
      'brazil': [
        { id: 'sao-paulo', name: 'São Paulo', country: 'brazil' },
        { id: 'rio-de-janeiro', name: 'Rio de Janeiro', country: 'brazil' },
        { id: 'brasilia', name: 'Brasília', country: 'brazil' },
        { id: 'salvador', name: 'Salvador', country: 'brazil' },
        { id: 'fortaleza', name: 'Fortaleza', country: 'brazil' }
      ],
      'bulgaria': [
        { id: 'sofia', name: 'Sofia', country: 'bulgaria' },
        { id: 'plovdiv', name: 'Plovdiv', country: 'bulgaria' },
        { id: 'varna', name: 'Varna', country: 'bulgaria' }
      ],
      'canada': [
        { id: 'toronto', name: 'Toronto', country: 'canada' },
        { id: 'vancouver', name: 'Vancouver', country: 'canada' },
        { id: 'montreal', name: 'Montreal', country: 'canada' },
        { id: 'calgary', name: 'Calgary', country: 'canada' },
        { id: 'ottawa', name: 'Ottawa', country: 'canada' }
      ],
      'chile': [
        { id: 'santiago', name: 'Santiago', country: 'chile' },
        { id: 'valparaiso', name: 'Valparaíso', country: 'chile' },
        { id: 'concepcion', name: 'Concepción', country: 'chile' }
      ],
      'china': [
        { id: 'beijing', name: 'Beijing', country: 'china' },
        { id: 'shanghai', name: 'Shanghai', country: 'china' },
        { id: 'guangzhou', name: 'Guangzhou', country: 'china' },
        { id: 'shenzhen', name: 'Shenzhen', country: 'china' },
        { id: 'chengdu', name: 'Chengdu', country: 'china' }
      ],
      'colombia': [
        { id: 'bogota', name: 'Bogotá', country: 'colombia' },
        { id: 'medellin', name: 'Medellín', country: 'colombia' },
        { id: 'cali', name: 'Cali', country: 'colombia' }
      ],
      'croatia': [
        { id: 'zagreb', name: 'Zagreb', country: 'croatia' },
        { id: 'split', name: 'Split', country: 'croatia' },
        { id: 'rijeka', name: 'Rijeka', country: 'croatia' }
      ],
      'czech-republic': [
        { id: 'prague', name: 'Prague', country: 'czech-republic' },
        { id: 'brno', name: 'Brno', country: 'czech-republic' },
        { id: 'ostrava', name: 'Ostrava', country: 'czech-republic' }
      ],
      'denmark': [
        { id: 'copenhagen', name: 'Copenhagen', country: 'denmark' },
        { id: 'aarhus', name: 'Aarhus', country: 'denmark' },
        { id: 'odense', name: 'Odense', country: 'denmark' }
      ],
      'egypt': [
        { id: 'cairo', name: 'Cairo', country: 'egypt' },
        { id: 'alexandria', name: 'Alexandria', country: 'egypt' },
        { id: 'giza', name: 'Giza', country: 'egypt' }
      ],
      'finland': [
        { id: 'helsinki', name: 'Helsinki', country: 'finland' },
        { id: 'espoo', name: 'Espoo', country: 'finland' },
        { id: 'tampere', name: 'Tampere', country: 'finland' }
      ],
      'france': [
        { id: 'paris', name: 'Paris', country: 'france' },
        { id: 'marseille', name: 'Marseille', country: 'france' },
        { id: 'lyon', name: 'Lyon', country: 'france' },
        { id: 'toulouse', name: 'Toulouse', country: 'france' },
        { id: 'nice', name: 'Nice', country: 'france' }
      ],
      'germany': [
        { id: 'berlin', name: 'Berlin', country: 'germany' },
        { id: 'munich', name: 'Munich', country: 'germany' },
        { id: 'hamburg', name: 'Hamburg', country: 'germany' },
        { id: 'cologne', name: 'Cologne', country: 'germany' },
        { id: 'frankfurt', name: 'Frankfurt', country: 'germany' }
      ],
      'ghana': [
        { id: 'accra', name: 'Accra', country: 'ghana' },
        { id: 'kumasi', name: 'Kumasi', country: 'ghana' },
        { id: 'tamale', name: 'Tamale', country: 'ghana' }
      ],
      'greece': [
        { id: 'athens', name: 'Athens', country: 'greece' },
        { id: 'thessaloniki', name: 'Thessaloniki', country: 'greece' },
        { id: 'patras', name: 'Patras', country: 'greece' }
      ],
      'hungary': [
        { id: 'budapest', name: 'Budapest', country: 'hungary' },
        { id: 'debrecen', name: 'Debrecen', country: 'hungary' },
        { id: 'szeged', name: 'Szeged', country: 'hungary' }
      ],
      'india': [
        { id: 'mumbai', name: 'Mumbai', country: 'india' },
        { id: 'delhi', name: 'Delhi', country: 'india' },
        { id: 'bangalore', name: 'Bangalore', country: 'india' },
        { id: 'hyderabad', name: 'Hyderabad', country: 'india' },
        { id: 'chennai', name: 'Chennai', country: 'india' }
      ],
      'indonesia': [
        { id: 'jakarta', name: 'Jakarta', country: 'indonesia' },
        { id: 'surabaya', name: 'Surabaya', country: 'indonesia' },
        { id: 'bandung', name: 'Bandung', country: 'indonesia' }
      ],
      'iran': [
        { id: 'tehran', name: 'Tehran', country: 'iran' },
        { id: 'mashhad', name: 'Mashhad', country: 'iran' },
        { id: 'isfahan', name: 'Isfahan', country: 'iran' }
      ],
      'ireland': [
        { id: 'dublin', name: 'Dublin', country: 'ireland' },
        { id: 'cork', name: 'Cork', country: 'ireland' },
        { id: 'galway', name: 'Galway', country: 'ireland' }
      ],
      'israel': [
        { id: 'jerusalem', name: 'Jerusalem', country: 'israel' },
        { id: 'tel-aviv', name: 'Tel Aviv', country: 'israel' },
        { id: 'haifa', name: 'Haifa', country: 'israel' }
      ],
      'italy': [
        { id: 'rome', name: 'Rome', country: 'italy' },
        { id: 'milan', name: 'Milan', country: 'italy' },
        { id: 'naples', name: 'Naples', country: 'italy' },
        { id: 'turin', name: 'Turin', country: 'italy' },
        { id: 'florence', name: 'Florence', country: 'italy' }
      ],
      'japan': [
        { id: 'tokyo', name: 'Tokyo', country: 'japan' },
        { id: 'osaka', name: 'Osaka', country: 'japan' },
        { id: 'kyoto', name: 'Kyoto', country: 'japan' },
        { id: 'yokohama', name: 'Yokohama', country: 'japan' },
        { id: 'nagoya', name: 'Nagoya', country: 'japan' }
      ],
      'kenya': [
        { id: 'nairobi', name: 'Nairobi', country: 'kenya' },
        { id: 'mombasa', name: 'Mombasa', country: 'kenya' },
        { id: 'kisumu', name: 'Kisumu', country: 'kenya' }
      ],
      'malaysia': [
        { id: 'kuala-lumpur', name: 'Kuala Lumpur', country: 'malaysia' },
        { id: 'johor-bahru', name: 'Johor Bahru', country: 'malaysia' },
        { id: 'ipoh', name: 'Ipoh', country: 'malaysia' }
      ],
      'mexico': [
        { id: 'mexico-city', name: 'Mexico City', country: 'mexico' },
        { id: 'guadalajara', name: 'Guadalajara', country: 'mexico' },
        { id: 'monterrey', name: 'Monterrey', country: 'mexico' }
      ],
      'netherlands': [
        { id: 'amsterdam', name: 'Amsterdam', country: 'netherlands' },
        { id: 'rotterdam', name: 'Rotterdam', country: 'netherlands' },
        { id: 'the-hague', name: 'The Hague', country: 'netherlands' }
      ],
      'new-zealand': [
        { id: 'auckland', name: 'Auckland', country: 'new-zealand' },
        { id: 'wellington', name: 'Wellington', country: 'new-zealand' },
        { id: 'christchurch', name: 'Christchurch', country: 'new-zealand' }
      ],
      'nigeria': [
        { id: 'lagos', name: 'Lagos', country: 'nigeria' },
        { id: 'abuja', name: 'Abuja', country: 'nigeria' },
        { id: 'kano', name: 'Kano', country: 'nigeria' }
      ],
      'norway': [
        { id: 'oslo', name: 'Oslo', country: 'norway' },
        { id: 'bergen', name: 'Bergen', country: 'norway' },
        { id: 'trondheim', name: 'Trondheim', country: 'norway' }
      ],
      'pakistan': [
        { id: 'karachi', name: 'Karachi', country: 'pakistan' },
        { id: 'lahore', name: 'Lahore', country: 'pakistan' },
        { id: 'islamabad', name: 'Islamabad', country: 'pakistan' }
      ],
      'philippines': [
        { id: 'manila', name: 'Manila', country: 'philippines' },
        { id: 'quezon-city', name: 'Quezon City', country: 'philippines' },
        { id: 'davao', name: 'Davao', country: 'philippines' }
      ],
      'poland': [
        { id: 'warsaw', name: 'Warsaw', country: 'poland' },
        { id: 'krakow', name: 'Kraków', country: 'poland' },
        { id: 'gdansk', name: 'Gdańsk', country: 'poland' }
      ],
      'portugal': [
        { id: 'lisbon', name: 'Lisbon', country: 'portugal' },
        { id: 'porto', name: 'Porto', country: 'portugal' },
        { id: 'braga', name: 'Braga', country: 'portugal' }
      ],
      'romania': [
        { id: 'bucharest', name: 'Bucharest', country: 'romania' },
        { id: 'cluj-napoca', name: 'Cluj-Napoca', country: 'romania' },
        { id: 'timisoara', name: 'Timișoara', country: 'romania' }
      ],
      'russia': [
        { id: 'moscow', name: 'Moscow', country: 'russia' },
        { id: 'saint-petersburg', name: 'St. Petersburg', country: 'russia' },
        { id: 'novosibirsk', name: 'Novosibirsk', country: 'russia' },
        { id: 'yekaterinburg', name: 'Yekaterinburg', country: 'russia' },
        { id: 'kazan', name: 'Kazan', country: 'russia' }
      ],
      'saudi-arabia': [
        { id: 'riyadh', name: 'Riyadh', country: 'saudi-arabia' },
        { id: 'jeddah', name: 'Jeddah', country: 'saudi-arabia' },
        { id: 'mecca', name: 'Mecca', country: 'saudi-arabia' }
      ],
      'singapore': [
        { id: 'singapore', name: 'Singapore', country: 'singapore' }
      ],
      'south-africa': [
        { id: 'johannesburg', name: 'Johannesburg', country: 'south-africa' },
        { id: 'cape-town', name: 'Cape Town', country: 'south-africa' },
        { id: 'durban', name: 'Durban', country: 'south-africa' }
      ],
      'south-korea': [
        { id: 'seoul', name: 'Seoul', country: 'south-korea' },
        { id: 'busan', name: 'Busan', country: 'south-korea' },
        { id: 'incheon', name: 'Incheon', country: 'south-korea' }
      ],
      'spain': [
        { id: 'madrid', name: 'Madrid', country: 'spain' },
        { id: 'barcelona', name: 'Barcelona', country: 'spain' },
        { id: 'valencia', name: 'Valencia', country: 'spain' },
        { id: 'seville', name: 'Seville', country: 'spain' },
        { id: 'bilbao', name: 'Bilbao', country: 'spain' }
      ],
      'sweden': [
        { id: 'stockholm', name: 'Stockholm', country: 'sweden' },
        { id: 'gothenburg', name: 'Gothenburg', country: 'sweden' },
        { id: 'malmo', name: 'Malmö', country: 'sweden' }
      ],
      'switzerland': [
        { id: 'zurich', name: 'Zurich', country: 'switzerland' },
        { id: 'geneva', name: 'Geneva', country: 'switzerland' },
        { id: 'basel', name: 'Basel', country: 'switzerland' }
      ],
      'thailand': [
        { id: 'bangkok', name: 'Bangkok', country: 'thailand' },
        { id: 'chiang-mai', name: 'Chiang Mai', country: 'thailand' },
        { id: 'pattaya', name: 'Pattaya', country: 'thailand' }
      ],
      'turkey': [
        { id: 'istanbul', name: 'Istanbul', country: 'turkey' },
        { id: 'ankara', name: 'Ankara', country: 'turkey' },
        { id: 'izmir', name: 'İzmir', country: 'turkey' }
      ],
      'ukraine': [
        { id: 'kyiv', name: 'Kyiv', country: 'ukraine' },
        { id: 'kharkiv', name: 'Kharkiv', country: 'ukraine' },
        { id: 'odesa', name: 'Odesa', country: 'ukraine' }
      ],
      'united-arab-emirates': [
        { id: 'dubai', name: 'Dubai', country: 'united-arab-emirates' },
        { id: 'abu-dhabi', name: 'Abu Dhabi', country: 'united-arab-emirates' },
        { id: 'sharjah', name: 'Sharjah', country: 'united-arab-emirates' }
      ],
      'united-kingdom': [
        { id: 'london', name: 'London', country: 'united-kingdom' },
        { id: 'manchester', name: 'Manchester', country: 'united-kingdom' },
        { id: 'birmingham', name: 'Birmingham', country: 'united-kingdom' },
        { id: 'glasgow', name: 'Glasgow', country: 'united-kingdom' },
        { id: 'liverpool', name: 'Liverpool', country: 'united-kingdom' }
      ],
      'united-states': [
        { id: 'new-york', name: 'New York', country: 'united-states' },
        { id: 'los-angeles', name: 'Los Angeles', country: 'united-states' },
        { id: 'chicago', name: 'Chicago', country: 'united-states' },
        { id: 'houston', name: 'Houston', country: 'united-states' },
        { id: 'phoenix', name: 'Phoenix', country: 'united-states' },
        { id: 'philadelphia', name: 'Philadelphia', country: 'united-states' },
        { id: 'san-antonio', name: 'San Antonio', country: 'united-states' },
        { id: 'san-diego', name: 'San Diego', country: 'united-states' },
        { id: 'dallas', name: 'Dallas', country: 'united-states' },
        { id: 'san-jose', name: 'San Jose', country: 'united-states' }
      ],
      'vietnam': [
        { id: 'ho-chi-minh-city', name: 'Ho Chi Minh City', country: 'vietnam' },
        { id: 'hanoi', name: 'Hanoi', country: 'vietnam' },
        { id: 'da-nang', name: 'Da Nang', country: 'vietnam' }
      ]
    }

    const cities = citiesByCountry[country] || []
    
    return NextResponse.json({ cities }, { status: 200 })
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    )
  }
}