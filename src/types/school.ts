export interface School {
  id: string;
  name: string;
  type: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  admission_type: string | null;
  boarding: boolean;
  competitiveness: string | null;
  size: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SchoolFilters {
  search: string;
  states: string[];
  competitiveness: string[];
  boarding: 'all' | 'yes' | 'no';
  types: string[];
  sizes: string[];
}

export const defaultFilters: SchoolFilters = {
  search: '',
  states: [],
  competitiveness: [],
  boarding: 'all',
  types: [],
  sizes: [],
};

export const competitivenessLevels = [
  'Highly Selective',
  'Selective',
  'Moderately Selective',
  'Less Selective',
];

export const schoolSizes = ['Small', 'Medium', 'Large'];

export const schoolTypes = [
  'Private',
  'Selective Public/Charter',
  'Magnet',
  'Boarding',
  'Day',
];

export const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];
