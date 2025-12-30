import React, { useState, useRef, useEffect } from 'react';

interface Country {
  code: string;
  country: string;
  name: string;
  flag: string;
}

const allCountries: Country[] = [
  { code: '+93', country: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
  { code: '+355', country: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: '+213', country: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: '+376', country: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: '+244', country: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: '+1', country: 'AG', name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: '+54', country: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: '+374', country: 'AM', name: 'Armenia', flag: '🇦🇲' },
  { code: '+61', country: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: '+43', country: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: '+994', country: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: '+1', country: 'BS', name: 'Bahamas', flag: '🇧🇸' },
  { code: '+973', country: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: '+880', country: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: '+1', country: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: '+375', country: 'BY', name: 'Belarus', flag: '🇧🇾' },
  { code: '+32', country: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: '+501', country: 'BZ', name: 'Belize', flag: '🇧🇿' },
  { code: '+229', country: 'BJ', name: 'Benin', flag: '🇧🇯' },
  { code: '+975', country: 'BT', name: 'Bhutan', flag: '🇧🇹' },
  { code: '+591', country: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: '+387', country: 'BA', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: '+267', country: 'BW', name: 'Botswana', flag: '🇧🇼' },
  { code: '+55', country: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: '+673', country: 'BN', name: 'Brunei', flag: '🇧🇳' },
  { code: '+359', country: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: '+226', country: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+257', country: 'BI', name: 'Burundi', flag: '🇧🇮' },
  { code: '+855', country: 'KH', name: 'Cambodia', flag: '🇰🇭' },
  { code: '+237', country: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: '+1', country: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: '+238', country: 'CV', name: 'Cape Verde', flag: '🇨🇻' },
  { code: '+236', country: 'CF', name: 'Central African Republic', flag: '🇨🇫' },
  { code: '+235', country: 'TD', name: 'Chad', flag: '🇹🇩' },
  { code: '+56', country: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: '+86', country: 'CN', name: 'China', flag: '🇨🇳' },
  { code: '+57', country: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: '+269', country: 'KM', name: 'Comoros', flag: '🇰🇲' },
  { code: '+242', country: 'CG', name: 'Congo', flag: '🇨🇬' },
  { code: '+243', country: 'CD', name: 'Congo (DRC)', flag: '🇨🇩' },
  { code: '+506', country: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: '+385', country: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: '+53', country: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: '+357', country: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: '+420', country: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: '+45', country: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: '+253', country: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
  { code: '+1', country: 'DM', name: 'Dominica', flag: '🇩🇲' },
  { code: '+1', country: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
  { code: '+670', country: 'TL', name: 'East Timor', flag: '🇹🇱' },
  { code: '+593', country: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: '+20', country: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: '+503', country: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: '+240', country: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: '+291', country: 'ER', name: 'Eritrea', flag: '🇪🇷' },
  { code: '+372', country: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: '+268', country: 'SZ', name: 'Eswatini', flag: '🇸🇿' },
  { code: '+251', country: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: '+679', country: 'FJ', name: 'Fiji', flag: '🇫🇯' },
  { code: '+358', country: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: '+33', country: 'FR', name: 'France', flag: '🇫🇷' },
  { code: '+241', country: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: '+220', country: 'GM', name: 'Gambia', flag: '🇬🇲' },
  { code: '+995', country: 'GE', name: 'Georgia', flag: '🇬🇪' },
  { code: '+49', country: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: '+233', country: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: '+30', country: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: '+1', country: 'GD', name: 'Grenada', flag: '🇬🇩' },
  { code: '+502', country: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: '+224', country: 'GN', name: 'Guinea', flag: '🇬🇳' },
  { code: '+245', country: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: '+592', country: 'GY', name: 'Guyana', flag: '🇬🇾' },
  { code: '+509', country: 'HT', name: 'Haiti', flag: '🇭🇹' },
  { code: '+504', country: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: '+852', country: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: '+36', country: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: '+354', country: 'IS', name: 'Iceland', flag: '🇮🇸' },
  { code: '+91', country: 'IN', name: 'India', flag: '🇮🇳' },
  { code: '+62', country: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: '+98', country: 'IR', name: 'Iran', flag: '🇮🇷' },
  { code: '+964', country: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: '+353', country: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: '+972', country: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: '+39', country: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: '+225', country: 'CI', name: 'Ivory Coast', flag: '🇨🇮' },
  { code: '+1', country: 'JM', name: 'Jamaica', flag: '🇯🇲' },
  { code: '+81', country: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: '+962', country: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: '+7', country: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: '+254', country: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: '+686', country: 'KI', name: 'Kiribati', flag: '🇰🇮' },
  { code: '+383', country: 'XK', name: 'Kosovo', flag: '🇽🇰' },
  { code: '+965', country: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: '+996', country: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: '+856', country: 'LA', name: 'Laos', flag: '🇱🇦' },
  { code: '+371', country: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: '+961', country: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: '+266', country: 'LS', name: 'Lesotho', flag: '🇱🇸' },
  { code: '+231', country: 'LR', name: 'Liberia', flag: '🇱🇷' },
  { code: '+218', country: 'LY', name: 'Libya', flag: '🇱🇾' },
  { code: '+423', country: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: '+370', country: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: '+352', country: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: '+853', country: 'MO', name: 'Macau', flag: '🇲🇴' },
  { code: '+261', country: 'MG', name: 'Madagascar', flag: '🇲🇬' },
  { code: '+265', country: 'MW', name: 'Malawi', flag: '🇲🇼' },
  { code: '+60', country: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+960', country: 'MV', name: 'Maldives', flag: '🇲🇻' },
  { code: '+223', country: 'ML', name: 'Mali', flag: '🇲🇱' },
  { code: '+356', country: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: '+692', country: 'MH', name: 'Marshall Islands', flag: '🇲🇭' },
  { code: '+222', country: 'MR', name: 'Mauritania', flag: '🇲🇷' },
  { code: '+230', country: 'MU', name: 'Mauritius', flag: '🇲🇺' },
  { code: '+52', country: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: '+691', country: 'FM', name: 'Micronesia', flag: '🇫🇲' },
  { code: '+373', country: 'MD', name: 'Moldova', flag: '🇲🇩' },
  { code: '+377', country: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: '+976', country: 'MN', name: 'Mongolia', flag: '🇲🇳' },
  { code: '+382', country: 'ME', name: 'Montenegro', flag: '🇲🇪' },
  { code: '+212', country: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: '+258', country: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
  { code: '+95', country: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: '+264', country: 'NA', name: 'Namibia', flag: '🇳🇦' },
  { code: '+674', country: 'NR', name: 'Nauru', flag: '🇳🇷' },
  { code: '+977', country: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: '+31', country: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: '+64', country: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: '+505', country: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: '+227', country: 'NE', name: 'Niger', flag: '🇳🇪' },
  { code: '+234', country: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+850', country: 'KP', name: 'North Korea', flag: '🇰🇵' },
  { code: '+389', country: 'MK', name: 'North Macedonia', flag: '🇲🇰' },
  { code: '+47', country: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: '+968', country: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: '+92', country: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: '+680', country: 'PW', name: 'Palau', flag: '🇵🇼' },
  { code: '+970', country: 'PS', name: 'Palestine', flag: '🇵🇸' },
  { code: '+507', country: 'PA', name: 'Panama', flag: '🇵🇦' },
  { code: '+675', country: 'PG', name: 'Papua New Guinea', flag: '🇵🇬' },
  { code: '+595', country: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: '+51', country: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: '+63', country: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: '+48', country: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: '+351', country: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: '+1', country: 'PR', name: 'Puerto Rico', flag: '🇵🇷' },
  { code: '+974', country: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: '+40', country: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: '+7', country: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: '+250', country: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  { code: '+1', country: 'KN', name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { code: '+1', country: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
  { code: '+1', country: 'VC', name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { code: '+685', country: 'WS', name: 'Samoa', flag: '🇼🇸' },
  { code: '+378', country: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: '+239', country: 'ST', name: 'Sao Tome and Principe', flag: '🇸🇹' },
  { code: '+966', country: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+221', country: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: '+381', country: 'RS', name: 'Serbia', flag: '🇷🇸' },
  { code: '+248', country: 'SC', name: 'Seychelles', flag: '🇸🇨' },
  { code: '+232', country: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+65', country: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: '+421', country: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: '+386', country: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: '+677', country: 'SB', name: 'Solomon Islands', flag: '🇸🇧' },
  { code: '+252', country: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: '+27', country: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: '+82', country: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: '+211', country: 'SS', name: 'South Sudan', flag: '🇸🇸' },
  { code: '+34', country: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: '+94', country: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+249', country: 'SD', name: 'Sudan', flag: '🇸🇩' },
  { code: '+597', country: 'SR', name: 'Suriname', flag: '🇸🇷' },
  { code: '+46', country: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: '+41', country: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: '+963', country: 'SY', name: 'Syria', flag: '🇸🇾' },
  { code: '+886', country: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: '+992', country: 'TJ', name: 'Tajikistan', flag: '🇹🇯' },
  { code: '+255', country: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: '+66', country: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: '+228', country: 'TG', name: 'Togo', flag: '🇹🇬' },
  { code: '+676', country: 'TO', name: 'Tonga', flag: '🇹🇴' },
  { code: '+1', country: 'TT', name: 'Trinidad and Tobago', flag: '🇹🇹' },
  { code: '+216', country: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: '+90', country: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: '+993', country: 'TM', name: 'Turkmenistan', flag: '🇹🇲' },
  { code: '+688', country: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
  { code: '+256', country: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: '+380', country: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: '+971', country: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+44', country: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+1', country: 'US', name: 'United States', flag: '🇺🇸' },
  { code: '+598', country: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: '+998', country: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: '+678', country: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
  { code: '+379', country: 'VA', name: 'Vatican City', flag: '🇻🇦' },
  { code: '+58', country: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: '+84', country: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: '+967', country: 'YE', name: 'Yemen', flag: '🇾🇪' },
  { code: '+260', country: 'ZM', name: 'Zambia', flag: '🇿🇲' },
  { code: '+263', country: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
];

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CountryCodeSelect: React.FC<CountryCodeSelectProps> = ({ value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedCountry = allCountries.find(c => c.code === value && c.country === 'US')
    || allCountries.find(c => c.code === value)
    || allCountries.find(c => c.country === 'US')!;

  const filteredCountries = allCountries.filter(country => {
    const searchLower = search.toLowerCase();
    return (
      country.name.toLowerCase().includes(searchLower) ||
      country.country.toLowerCase().includes(searchLower) ||
      country.code.includes(search)
    );
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [search]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredCountries.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCountries[highlightedIndex]) {
          onChange(filteredCountries[highlightedIndex].code);
          setIsOpen(false);
          setSearch('');
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearch('');
        break;
    }
  };

  const handleSelect = (country: Country) => {
    onChange(country.code);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="h-full flex items-center gap-2 pl-3 pr-8 py-2.5 rounded-l-lg border border-r-0 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        onKeyDown={handleKeyDown}
      >
        <span className="text-base">{selectedCountry.flag}</span>
        <span className="font-medium">{selectedCountry.code}</span>
      </button>

      <svg
        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search countries..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime/50 focus:border-brand-lime"
              />
            </div>
          </div>

          <ul
            ref={listRef}
            className="max-h-60 overflow-y-auto py-1"
          >
            {filteredCountries.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                No countries found
              </li>
            ) : (
              filteredCountries.map((country, index) => (
                <li
                  key={`${country.country}-${index}`}
                  onClick={() => handleSelect(country)}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                    index === highlightedIndex
                      ? 'bg-brand-lime/10 text-gray-900 dark:text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="flex-1 text-sm truncate">{country.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {country.code}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CountryCodeSelect;
