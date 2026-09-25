'use client'

import { IL_ILCE, ILLER } from '@/lib/ilIlce'

type Props = {
  city: string
  district: string
  onChange: (city: string, district: string) => void
  required?: boolean
  cityLabel: string
  districtLabel: string
  labelClassName: string
  selectClassName: string
}

export function IlIlceSelects({ city, district, onChange, required, cityLabel, districtLabel, labelClassName, selectClassName }: Props) {
  const districts = IL_ILCE[city] ?? []

  return (
    <>
      <div>
        <label className={labelClassName}>{cityLabel}</label>
        <select
          name="city"
          required={required}
          value={city}
          onChange={(e) => onChange(e.target.value, '')}
          className={selectClassName}
        >
          <option value="">İl seçin</option>
          {ILLER.map((il) => (
            <option key={il} value={il}>{il}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClassName}>{districtLabel}</label>
        <select
          name="district"
          required={required}
          value={district}
          disabled={!city}
          onChange={(e) => onChange(city, e.target.value)}
          className={selectClassName}
        >
          <option value="">{city ? 'İlçe seçin' : 'Önce il seçin'}</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
    </>
  )
}
