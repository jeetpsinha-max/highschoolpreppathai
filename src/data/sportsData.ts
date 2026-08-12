export interface Conference {
  id: string;
  name: string;
  abbreviation: string;
  region: string;
  description: string;
  color: string;
}

export interface Championship {
  year: number;
  title: string;
  sport: string;
}

export interface Alumni {
  name: string;
  sport: string;
  achievement: string;
}

export interface SportProgram {
  sport: string;
  gender: 'Boys' | 'Girls' | 'Coed';
  grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-';
  season: 'Fall' | 'Winter' | 'Spring';
  level: string;
  record?: string;
  stateRanking?: number;
  nationalRanking?: number;
  championships?: number;
}

export interface SchoolSports {
  schoolName: string;
  city: string;
  state: string;
  conference: string;
  conferenceId: string;
  varsitySportsCount: number;
  strongestPrograms: string[];
  recentChampionships: Championship[];
  notableAlumni: Alumni[];
  facilitiesHighlights: string[];
  sportPrograms: SportProgram[];
}

export const CONFERENCES: Conference[] = [
  { id: 'c1', name: 'Founders League', abbreviation: 'Founders', region: 'New England', description: 'Highly competitive New England prep school league', color: '#1d3557' },
  { id: 'c2', name: 'Eight Schools Association', abbreviation: 'ESA', region: 'New England', description: 'Historic group of eight elite boarding schools', color: '#457b9d' },
  { id: 'c3', name: 'Mid-Atlantic Prep League', abbreviation: 'MAPL', region: 'Mid-Atlantic', description: 'Top prep schools in NJ, PA, and surrounding areas', color: '#e63946' },
  { id: 'c4', name: 'Independent School League', abbreviation: 'ISL', region: 'New England', description: 'Historic and competitive league based primarily in Massachusetts', color: '#a8dadc' },
  { id: 'c5', name: 'New England Prep School Athletic Council', abbreviation: 'NEPSAC', region: 'New England', description: 'The governing body for prep school sports in New England', color: '#2a9d8f' },
  { id: 'c6', name: 'Lakes Region League', abbreviation: 'Lakes Region', region: 'New England', description: 'Competitive prep league located in Northern New England', color: '#e76f51' },
  { id: 'c7', name: 'Interstate Athletic Conference', abbreviation: 'IAC', region: 'Mid-Atlantic', description: 'Elite boys prep sports league in DC/MD/VA area', color: '#f4a261' },
  { id: 'c8', name: 'Virginia Prep League', abbreviation: 'VPL', region: 'South', description: 'Premier boys prep league in Virginia', color: '#264653' },
  { id: 'c9', name: 'Delaware Independent School Conference', abbreviation: 'DISC', region: 'Mid-Atlantic', description: 'Top independent schools in Delaware', color: '#8ab17d' },
  { id: 'c10', name: 'Fairchester Athletic Association', abbreviation: 'FAA', region: 'New England / NY', description: 'League featuring schools in Fairfield County CT and Westchester County NY', color: '#d4a373' },
  { id: 'c11', name: 'Ivy Preparatory School League', abbreviation: 'Ivy Prep', region: 'New York', description: 'Historic prep league in New York', color: '#b56576' },
  { id: 'c12', name: 'Skyland Conference', abbreviation: 'Skyland', region: 'Mid-Atlantic', description: 'Highly competitive high school sports conference in New Jersey', color: '#6d597a' },
  { id: 'c13', name: 'Independent', abbreviation: 'Independent', region: 'National', description: 'Schools competing outside of specific regional leagues', color: '#4a4e69' }
];

export const SCHOOL_SPORTS_DATA: SchoolSports[] = [
  {
    schoolName: 'Phillips Exeter Academy',
    city: 'Exeter',
    state: 'NH',
    conference: 'NEPSAC/ESA',
    conferenceId: 'c2',
    varsitySportsCount: 33,
    strongestPrograms: ['Swimming', 'Track', 'Water Polo', 'Tennis'],
    recentChampionships: [{ year: 2023, title: 'NEPSAC Div 1', sport: 'Swimming' }],
    notableAlumni: [
      { name: 'Duncan Robinson', sport: 'Basketball', achievement: 'NBA' },
      { name: 'Sam Fuld', sport: 'Baseball', achievement: 'MLB' }
    ],
    facilitiesHighlights: ['Love Gymnasium', 'Roger Nekton Championship Pool', 'Thompson Field House'],
    sportPrograms: [
      { sport: 'Swimming', gender: 'Coed', grade: 'A+', season: 'Winter', level: 'Varsity', record: '12-0', championships: 5 },
      { sport: 'Track', gender: 'Coed', grade: 'A', season: 'Spring', level: 'Varsity', record: 'Undefeated', stateRanking: 1 },
      { sport: 'Water Polo', gender: 'Boys', grade: 'A', season: 'Fall', level: 'Varsity', record: '15-2' },
      { sport: 'Tennis', gender: 'Girls', grade: 'A-', season: 'Spring', level: 'Varsity', record: '14-1' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '18-5' },
      { sport: 'Baseball', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '14-6' },
      { sport: 'Crew', gender: 'Coed', grade: 'A', season: 'Spring', level: 'Varsity' },
      { sport: 'Soccer', gender: 'Boys', grade: 'B', season: 'Fall', level: 'Varsity', record: '10-4-2' }
    ]
  },
  {
    schoolName: 'Phillips Academy Andover',
    city: 'Andover',
    state: 'MA',
    conference: 'NEPSAC/ESA',
    conferenceId: 'c2',
    varsitySportsCount: 30,
    strongestPrograms: ['Swimming', 'Football', 'Baseball'],
    recentChampionships: [{ year: 2022, title: 'NEPSAC Bowl', sport: 'Football' }],
    notableAlumni: [
      { name: 'Bill Belichick', sport: 'Football', achievement: 'NFL coach' },
      { name: 'Cory Schneider', sport: 'Hockey', achievement: 'NHL' }
    ],
    facilitiesHighlights: ['Snyder Center', 'Phelps Stadium', 'Borden Pavilion'],
    sportPrograms: [
      { sport: 'Football', gender: 'Boys', grade: 'A', season: 'Fall', level: 'Varsity', record: '8-1', championships: 3 },
      { sport: 'Swimming', gender: 'Coed', grade: 'A', season: 'Winter', level: 'Varsity', record: '10-1' },
      { sport: 'Baseball', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity', record: '15-3' },
      { sport: 'Hockey', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '16-8-2' },
      { sport: 'Water Polo', gender: 'Coed', grade: 'B+', season: 'Fall', level: 'Varsity' },
      { sport: 'Track', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity' },
      { sport: 'Soccer', gender: 'Girls', grade: 'B', season: 'Fall', level: 'Varsity', record: '9-4-3' },
      { sport: 'Squash', gender: 'Coed', grade: 'A-', season: 'Winter', level: 'Varsity' }
    ]
  },
  {
    schoolName: 'Choate Rosemary Hall',
    city: 'Wallingford',
    state: 'CT',
    conference: 'Founders',
    conferenceId: 'c1',
    varsitySportsCount: 32,
    strongestPrograms: ['Football', 'Volleyball', 'Hockey', 'Crew'],
    recentChampionships: [{ year: 2023, title: 'Founders League', sport: 'Football' }],
    notableAlumni: [
      { name: 'Hilary Knight', sport: 'Hockey', achievement: 'Olympic Hockey' },
      { name: 'Matt Walsh', sport: 'Basketball', achievement: 'NBA' }
    ],
    facilitiesHighlights: ['Worthington Johnson Athletic Center', 'Remsen Arena', 'Lanterman Athletics Center'],
    sportPrograms: [
      { sport: 'Football', gender: 'Boys', grade: 'A+', season: 'Fall', level: 'Varsity', record: '9-0', championships: 6 },
      { sport: 'Volleyball', gender: 'Girls', grade: 'A', season: 'Fall', level: 'Varsity', record: '18-2' },
      { sport: 'Hockey', gender: 'Girls', grade: 'A', season: 'Winter', level: 'Varsity', record: '20-4', championships: 2 },
      { sport: 'Hockey', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '14-10-1' },
      { sport: 'Crew', gender: 'Coed', grade: 'A-', season: 'Spring', level: 'Varsity' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B', season: 'Winter', level: 'Varsity', record: '16-7' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '13-5' },
      { sport: 'Soccer', gender: 'Coed', grade: 'B+', season: 'Fall', level: 'Varsity', record: '11-3-2' }
    ]
  },
  {
    schoolName: 'Deerfield Academy',
    city: 'Deerfield',
    state: 'MA',
    conference: 'NEPSAC/Founders',
    conferenceId: 'c1',
    varsitySportsCount: 28,
    strongestPrograms: ['Lacrosse', 'Swimming', 'Hockey'],
    recentChampionships: [{ year: 2022, title: 'National Prep', sport: 'Lacrosse' }],
    notableAlumni: [
      { name: 'Patrick Moran', sport: 'Lacrosse', achievement: 'Professional Lacrosse' }
    ],
    facilitiesHighlights: ['Athletics Center', 'Koch Pool', 'Ice Rink'],
    sportPrograms: [
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A+', season: 'Spring', level: 'Varsity', record: '16-1', nationalRanking: 5, championships: 4 },
      { sport: 'Swimming', gender: 'Coed', grade: 'A', season: 'Winter', level: 'Varsity', record: '11-2' },
      { sport: 'Hockey', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '18-6-2' },
      { sport: 'Water Polo', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '12-4' },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'A-', season: 'Fall', level: 'Varsity', record: '14-3' },
      { sport: 'Rowing', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity' },
      { sport: 'Football', gender: 'Boys', grade: 'B', season: 'Fall', level: 'Varsity', record: '5-4' },
      { sport: 'Squash', gender: 'Coed', grade: 'A-', season: 'Winter', level: 'Varsity' }
    ]
  },
  {
    schoolName: 'The Hotchkiss School',
    city: 'Lakeville',
    state: 'CT',
    conference: 'Founders',
    conferenceId: 'c1',
    varsitySportsCount: 32,
    strongestPrograms: ['Sailing', 'Tennis', 'Golf', 'Field Hockey'],
    recentChampionships: [{ year: 2023, title: 'NEPSAC Class A', sport: 'Field Hockey' }],
    notableAlumni: [],
    facilitiesHighlights: ['Forrest E. Mars Jr. Athletic Center', 'Golf Course', 'Lake Wononscopomuc Sailing Facility'],
    sportPrograms: [
      { sport: 'Sailing', gender: 'Coed', grade: 'A+', season: 'Spring', level: 'Varsity', championships: 3 },
      { sport: 'Tennis', gender: 'Coed', grade: 'A', season: 'Spring', level: 'Varsity', record: '14-2' },
      { sport: 'Golf', gender: 'Coed', grade: 'A', season: 'Spring', level: 'Varsity', record: '15-1' },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'A+', season: 'Fall', level: 'Varsity', record: '17-1', championships: 2 },
      { sport: 'Hockey', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '14-9-3' },
      { sport: 'Basketball', gender: 'Coed', grade: 'B', season: 'Winter', level: 'Varsity', record: '12-10' },
      { sport: 'Soccer', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '11-4-2' },
      { sport: 'Lacrosse', gender: 'Girls', grade: 'A-', season: 'Spring', level: 'Varsity', record: '13-3' }
    ]
  },
  {
    schoolName: 'Loomis Chaffee',
    city: 'Windsor',
    state: 'CT',
    conference: 'Founders',
    conferenceId: 'c1',
    varsitySportsCount: 30,
    strongestPrograms: ['Soccer', 'Swimming', 'Track', 'Football'],
    recentChampionships: [{ year: 2022, title: 'Founders League', sport: 'Soccer' }],
    notableAlumni: [
      { name: 'David Emma', sport: 'Hockey', achievement: 'NHL' }
    ],
    facilitiesHighlights: ['Erickson Athletic Complex', 'Hedges Pool', 'Pratt Field'],
    sportPrograms: [
      { sport: 'Soccer', gender: 'Boys', grade: 'A+', season: 'Fall', level: 'Varsity', record: '16-2-1', championships: 3 },
      { sport: 'Swimming', gender: 'Coed', grade: 'A', season: 'Winter', level: 'Varsity', record: '10-2' },
      { sport: 'Track', gender: 'Coed', grade: 'A-', season: 'Spring', level: 'Varsity' },
      { sport: 'Football', gender: 'Boys', grade: 'A', season: 'Fall', level: 'Varsity', record: '8-1' },
      { sport: 'Hockey', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '15-10-2' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '12-5' },
      { sport: 'Basketball', gender: 'Girls', grade: 'A-', season: 'Winter', level: 'Varsity', record: '19-4' },
      { sport: 'Cross Country', gender: 'Coed', grade: 'B+', season: 'Fall', level: 'Varsity' }
    ]
  },
  {
    schoolName: 'The Taft School',
    city: 'Watertown',
    state: 'CT',
    conference: 'Founders',
    conferenceId: 'c1',
    varsitySportsCount: 29,
    strongestPrograms: ['Hockey', 'Lacrosse', 'Squash', 'Soccer'],
    recentChampionships: [{ year: 2023, title: 'Founders League', sport: 'Squash' }],
    notableAlumni: [
      { name: 'Max Pacioretty', sport: 'Hockey', achievement: 'NHL' }
    ],
    facilitiesHighlights: ['Odden Arena', 'Cruikshank Athletic Center', 'Geissinger Field'],
    sportPrograms: [
      { sport: 'Hockey', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', record: '21-5-1', championships: 2 },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A', season: 'Spring', level: 'Varsity', record: '15-4' },
      { sport: 'Squash', gender: 'Coed', grade: 'A+', season: 'Winter', level: 'Varsity', record: '14-1', championships: 3 },
      { sport: 'Soccer', gender: 'Boys', grade: 'A-', season: 'Fall', level: 'Varsity', record: '14-3-2' },
      { sport: 'Football', gender: 'Boys', grade: 'B', season: 'Fall', level: 'Varsity', record: '5-4' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '17-6' },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'B+', season: 'Fall', level: 'Varsity', record: '12-5' },
      { sport: 'Golf', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity', record: '10-3' }
    ]
  },
  {
    schoolName: 'Kent School',
    city: 'Kent',
    state: 'CT',
    conference: 'Founders',
    conferenceId: 'c1',
    varsitySportsCount: 24,
    strongestPrograms: ['Crew', 'Hockey', 'Football'],
    recentChampionships: [{ year: 2022, title: 'NEIRA', sport: 'Crew' }],
    notableAlumni: [],
    facilitiesHighlights: ['Partridge Rowing Center', 'Nadal Hockey Rink', 'Sill Athletic Center'],
    sportPrograms: [
      { sport: 'Crew', gender: 'Coed', grade: 'A+', season: 'Spring', level: 'Varsity', championships: 5 },
      { sport: 'Hockey', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '16-8-2' },
      { sport: 'Football', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '6-3' },
      { sport: 'Soccer', gender: 'Boys', grade: 'B', season: 'Fall', level: 'Varsity', record: '9-6-2' },
      { sport: 'Basketball', gender: 'Coed', grade: 'B', season: 'Winter', level: 'Varsity', record: '11-12' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '10-6' },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'B', season: 'Fall', level: 'Varsity', record: '8-8' },
      { sport: 'Tennis', gender: 'Coed', grade: 'B', season: 'Spring', level: 'Varsity', record: '8-6' }
    ]
  },
  {
    schoolName: 'Westminster School',
    city: 'Simsbury',
    state: 'CT',
    conference: 'Founders',
    conferenceId: 'c1',
    varsitySportsCount: 25,
    strongestPrograms: ['Hockey', 'Lacrosse', 'Field Hockey'],
    recentChampionships: [{ year: 2023, title: 'NEPSAC Class B', sport: 'Field Hockey' }],
    notableAlumni: [
      { name: 'Tommy Cross', sport: 'Hockey', achievement: 'NHL' },
      { name: 'Ben Smith', sport: 'Hockey', achievement: 'NHL' }
    ],
    facilitiesHighlights: ['Jackson Rink', 'Sherwin Athletic Center', 'Hovey Field'],
    sportPrograms: [
      { sport: 'Hockey', gender: 'Boys', grade: 'A', season: 'Winter', level: 'Varsity', record: '18-7-1' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity', record: '13-4' },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'A', season: 'Fall', level: 'Varsity', record: '15-2', championships: 1 },
      { sport: 'Soccer', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '11-5-1' },
      { sport: 'Squash', gender: 'Coed', grade: 'B+', season: 'Winter', level: 'Varsity', record: '10-4' },
      { sport: 'Football', gender: 'Boys', grade: 'B-', season: 'Fall', level: 'Varsity', record: '4-5' },
      { sport: 'Basketball', gender: 'Girls', grade: 'B+', season: 'Winter', level: 'Varsity', record: '14-8' },
      { sport: 'Baseball', gender: 'Boys', grade: 'B', season: 'Spring', level: 'Varsity', record: '10-9' }
    ]
  },
  {
    schoolName: 'Avon Old Farms',
    city: 'Avon',
    state: 'CT',
    conference: 'Founders',
    conferenceId: 'c1',
    varsitySportsCount: 20,
    strongestPrograms: ['Hockey', 'Football', 'Baseball'],
    recentChampionships: [{ year: 2023, title: 'NEPSAC Elite 8', sport: 'Hockey' }],
    notableAlumni: [
      { name: 'Brian Leetch', sport: 'Hockey', achievement: 'NHL' },
      { name: 'Jonathan Quick', sport: 'Hockey', achievement: 'NHL' },
      { name: 'George Springer', sport: 'Baseball', achievement: 'MLB' }
    ],
    facilitiesHighlights: ['Jennings Fairchild Rink', 'Ryan Field', 'Brown Student Center'],
    sportPrograms: [
      { sport: 'Hockey', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', record: '24-3-1', championships: 8 },
      { sport: 'Football', gender: 'Boys', grade: 'A+', season: 'Fall', level: 'Varsity', record: '9-0', championships: 5 },
      { sport: 'Baseball', gender: 'Boys', grade: 'A+', season: 'Spring', level: 'Varsity', record: '19-2', championships: 3 },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A', season: 'Spring', level: 'Varsity', record: '15-3' },
      { sport: 'Soccer', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '12-4-2' },
      { sport: 'Basketball', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '18-5' },
      { sport: 'Squash', gender: 'Boys', grade: 'B', season: 'Winter', level: 'Varsity', record: '8-6' },
      { sport: 'Track', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity' }
    ]
  },
  {
    schoolName: 'The Lawrenceville School',
    city: 'Lawrenceville',
    state: 'NJ',
    conference: 'MAPL',
    conferenceId: 'c3',
    varsitySportsCount: 34,
    strongestPrograms: ['Lacrosse', 'Track', 'Field Hockey'],
    recentChampionships: [{ year: 2023, title: 'MAPL', sport: 'Lacrosse' }],
    notableAlumni: [
      { name: 'Joakim Noah', sport: 'Basketball', achievement: 'NBA' },
      { name: 'Bobby Sanguinetti', sport: 'Hockey', achievement: 'NHL' }
    ],
    facilitiesHighlights: ['Lavino Field House', 'Loucks Ice Center', 'Violich Field'],
    sportPrograms: [
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A+', season: 'Spring', level: 'Varsity', record: '19-1', nationalRanking: 1, championships: 4 },
      { sport: 'Track', gender: 'Coed', grade: 'A', season: 'Spring', level: 'Varsity', championships: 2 },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'A', season: 'Fall', level: 'Varsity', record: '16-3' },
      { sport: 'Hockey', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '17-8-1' },
      { sport: 'Basketball', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '20-6' },
      { sport: 'Football', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '6-3' },
      { sport: 'Soccer', gender: 'Girls', grade: 'B+', season: 'Fall', level: 'Varsity', record: '12-4-1' },
      { sport: 'Crew', gender: 'Coed', grade: 'A-', season: 'Spring', level: 'Varsity' }
    ]
  },
  {
    schoolName: 'Peddie School',
    city: 'Hightstown',
    state: 'NJ',
    conference: 'MAPL',
    conferenceId: 'c3',
    varsitySportsCount: 21,
    strongestPrograms: ['Swimming', 'Basketball', 'Soccer'],
    recentChampionships: [{ year: 2023, title: 'Easterns', sport: 'Swimming' }],
    notableAlumni: [],
    facilitiesHighlights: ['Ian H. Graham Athletic Center', 'Aquatic Center', 'Golf Course'],
    sportPrograms: [
      { sport: 'Swimming', gender: 'Coed', grade: 'A+', season: 'Winter', level: 'Varsity', record: '10-0', nationalRanking: 10, championships: 6 },
      { sport: 'Basketball', gender: 'Boys', grade: 'A', season: 'Winter', level: 'Varsity', record: '21-4' },
      { sport: 'Soccer', gender: 'Boys', grade: 'A-', season: 'Fall', level: 'Varsity', record: '14-3-2' },
      { sport: 'Football', gender: 'Boys', grade: 'B', season: 'Fall', level: 'Varsity', record: '5-4' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '11-6' },
      { sport: 'Track', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity' },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'B', season: 'Fall', level: 'Varsity', record: '9-7' },
      { sport: 'Rowing', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity' }
    ]
  },
  {
    schoolName: 'Blair Academy',
    city: 'Blairstown',
    state: 'NJ',
    conference: 'MAPL',
    conferenceId: 'c3',
    varsitySportsCount: 26,
    strongestPrograms: ['Wrestling', 'Basketball', 'Field Hockey'],
    recentChampionships: [{ year: 2023, title: 'National Prep', sport: 'Wrestling' }],
    notableAlumni: [
      { name: 'Luol Deng', sport: 'Basketball', achievement: 'NBA' },
      { name: 'Charlie Villanueva', sport: 'Basketball', achievement: 'NBA' }
    ],
    facilitiesHighlights: ['Wallace Pool', 'Hardwick Hall', 'Wrestling Room'],
    sportPrograms: [
      { sport: 'Wrestling', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', nationalRanking: 1, championships: 40 },
      { sport: 'Basketball', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', record: '24-3', nationalRanking: 15, championships: 5 },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'A', season: 'Fall', level: 'Varsity', record: '16-2' },
      { sport: 'Football', gender: 'Boys', grade: 'A-', season: 'Fall', level: 'Varsity', record: '7-2' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '12-5' },
      { sport: 'Soccer', gender: 'Girls', grade: 'B+', season: 'Fall', level: 'Varsity', record: '11-4-1' },
      { sport: 'Crew', gender: 'Coed', grade: 'A-', season: 'Spring', level: 'Varsity' },
      { sport: 'Tennis', gender: 'Coed', grade: 'B', season: 'Spring', level: 'Varsity', record: '9-5' }
    ]
  },
  {
    schoolName: 'The Hill School',
    city: 'Pottstown',
    state: 'PA',
    conference: 'MAPL',
    conferenceId: 'c3',
    varsitySportsCount: 31,
    strongestPrograms: ['Hockey', 'Water Polo', 'Field Hockey'],
    recentChampionships: [{ year: 2022, title: 'MAPL', sport: 'Field Hockey' }],
    notableAlumni: [],
    facilitiesHighlights: ['Mercer Fieldhouse', 'Briggs Rink', 'Cunningham Pool'],
    sportPrograms: [
      { sport: 'Hockey', gender: 'Boys', grade: 'A', season: 'Winter', level: 'Varsity', record: '19-6-2' },
      { sport: 'Water Polo', gender: 'Coed', grade: 'A-', season: 'Fall', level: 'Varsity', record: '15-4' },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'A+', season: 'Fall', level: 'Varsity', record: '18-1', championships: 3 },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity', record: '14-5' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '16-8' },
      { sport: 'Soccer', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '12-5-1' },
      { sport: 'Football', gender: 'Boys', grade: 'B', season: 'Fall', level: 'Varsity', record: '5-4' },
      { sport: 'Track', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity' }
    ]
  },
  {
    schoolName: 'Mercersburg Academy',
    city: 'Mercersburg',
    state: 'PA',
    conference: 'MAPL',
    conferenceId: 'c3',
    varsitySportsCount: 26,
    strongestPrograms: ['Swimming', 'Track', 'Squash'],
    recentChampionships: [{ year: 2023, title: 'Easterns', sport: 'Swimming' }],
    notableAlumni: [
      { name: 'Mel Stewart', sport: 'Swimming', achievement: 'Olympic Swimmer' }
    ],
    facilitiesHighlights: ['Lloyd Aquatic Center', 'Goldthorpe Athletic Complex', 'Squash Center'],
    sportPrograms: [
      { sport: 'Swimming', gender: 'Coed', grade: 'A+', season: 'Winter', level: 'Varsity', record: '9-1', championships: 4 },
      { sport: 'Track', gender: 'Coed', grade: 'A', season: 'Spring', level: 'Varsity' },
      { sport: 'Squash', gender: 'Coed', grade: 'A-', season: 'Winter', level: 'Varsity', record: '12-3' },
      { sport: 'Soccer', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '11-4-2' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B', season: 'Winter', level: 'Varsity', record: '14-10' },
      { sport: 'Lacrosse', gender: 'Girls', grade: 'B+', season: 'Spring', level: 'Varsity', record: '10-6' },
      { sport: 'Wrestling', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity' },
      { sport: 'Baseball', gender: 'Boys', grade: 'B', season: 'Spring', level: 'Varsity', record: '11-8' }
    ]
  },
  {
    schoolName: 'The Hun School of Princeton',
    city: 'Princeton',
    state: 'NJ',
    conference: 'MAPL',
    conferenceId: 'c3',
    varsitySportsCount: 24,
    strongestPrograms: ['Football', 'Baseball', 'Basketball'],
    recentChampionships: [{ year: 2023, title: 'MAPL', sport: 'Football' }],
    notableAlumni: [
      { name: 'Jason Thompson', sport: 'Basketball', achievement: 'NBA' },
      { name: 'Myron Rolle', sport: 'Football', achievement: 'NFL' }
    ],
    facilitiesHighlights: ['Breen Performing Arts Center & Athletic Center', 'Turf Field', 'Baseball Complex'],
    sportPrograms: [
      { sport: 'Football', gender: 'Boys', grade: 'A+', season: 'Fall', level: 'Varsity', record: '9-0', championships: 4 },
      { sport: 'Baseball', gender: 'Boys', grade: 'A+', season: 'Spring', level: 'Varsity', record: '18-2', championships: 3 },
      { sport: 'Basketball', gender: 'Boys', grade: 'A', season: 'Winter', level: 'Varsity', record: '20-5' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity', record: '13-4' },
      { sport: 'Soccer', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '10-5-2' },
      { sport: 'Rowing', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity' },
      { sport: 'Ice Hockey', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '14-7-1' },
      { sport: 'Tennis', gender: 'Girls', grade: 'B', season: 'Fall', level: 'Varsity', record: '9-5' }
    ]
  },
  {
    schoolName: 'Milton Academy',
    city: 'Milton',
    state: 'MA',
    conference: 'ISL',
    conferenceId: 'c4',
    varsitySportsCount: 29,
    strongestPrograms: ['Soccer', 'Tennis', 'Skiing', 'Football'],
    recentChampionships: [{ year: 2022, title: 'ISL', sport: 'Soccer' }],
    notableAlumni: [
      { name: 'Ken Dryden', sport: 'Hockey', achievement: 'NHL' }
    ],
    facilitiesHighlights: ['Athletic and Convocation Center', 'Outdoor Track', 'Tennis Courts'],
    sportPrograms: [
      { sport: 'Soccer', gender: 'Boys', grade: 'A+', season: 'Fall', level: 'Varsity', record: '17-1-2', championships: 3 },
      { sport: 'Tennis', gender: 'Coed', grade: 'A', season: 'Spring', level: 'Varsity', record: '15-1' },
      { sport: 'Skiing', gender: 'Coed', grade: 'A-', season: 'Winter', level: 'Varsity' },
      { sport: 'Football', gender: 'Boys', grade: 'A', season: 'Fall', level: 'Varsity', record: '8-1', championships: 1 },
      { sport: 'Hockey', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '15-8-3' },
      { sport: 'Basketball', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '18-6' },
      { sport: 'Lacrosse', gender: 'Girls', grade: 'B+', season: 'Spring', level: 'Varsity', record: '11-5' },
      { sport: 'Baseball', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '13-6' }
    ]
  },
  {
    schoolName: 'Middlesex School',
    city: 'Concord',
    state: 'MA',
    conference: 'ISL',
    conferenceId: 'c4',
    varsitySportsCount: 27,
    strongestPrograms: ['Field Hockey', 'Lacrosse', 'Crew'],
    recentChampionships: [{ year: 2023, title: 'ISL', sport: 'Field Hockey' }],
    notableAlumni: [],
    facilitiesHighlights: ['Athletic Center', 'Boathouse', 'Turf Fields'],
    sportPrograms: [
      { sport: 'Field Hockey', gender: 'Girls', grade: 'A+', season: 'Fall', level: 'Varsity', record: '16-1-1', championships: 2 },
      { sport: 'Lacrosse', gender: 'Girls', grade: 'A', season: 'Spring', level: 'Varsity', record: '15-2' },
      { sport: 'Crew', gender: 'Coed', grade: 'A-', season: 'Spring', level: 'Varsity' },
      { sport: 'Hockey', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '13-10-2' },
      { sport: 'Soccer', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '11-4-3' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B', season: 'Winter', level: 'Varsity', record: '12-10' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '10-7' },
      { sport: 'Tennis', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity', record: '10-4' }
    ]
  },
  {
    schoolName: 'Groton School',
    city: 'Groton',
    state: 'MA',
    conference: 'ISL',
    conferenceId: 'c4',
    varsitySportsCount: 23,
    strongestPrograms: ['Tennis', 'Crew', 'Squash'],
    recentChampionships: [{ year: 2023, title: 'ISL', sport: 'Tennis' }],
    notableAlumni: [],
    facilitiesHighlights: ['Athletic Center', 'Nashua River Boathouse', 'Squash Courts'],
    sportPrograms: [
      { sport: 'Tennis', gender: 'Coed', grade: 'A+', season: 'Spring', level: 'Varsity', record: '16-0', championships: 4 },
      { sport: 'Crew', gender: 'Coed', grade: 'A', season: 'Spring', level: 'Varsity' },
      { sport: 'Squash', gender: 'Coed', grade: 'A-', season: 'Winter', level: 'Varsity', record: '12-3' },
      { sport: 'Ice Hockey', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '14-9-2' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '11-6' },
      { sport: 'Soccer', gender: 'Girls', grade: 'A-', season: 'Fall', level: 'Varsity', record: '12-3-2' },
      { sport: 'Football', gender: 'Boys', grade: 'B', season: 'Fall', level: 'Varsity', record: '5-4' },
      { sport: 'Basketball', gender: 'Girls', grade: 'B+', season: 'Winter', level: 'Varsity', record: '13-8' }
    ]
  },
  {
    schoolName: 'Tabor Academy',
    city: 'Marion',
    state: 'MA',
    conference: 'ISL',
    conferenceId: 'c4',
    varsitySportsCount: 26,
    strongestPrograms: ['Sailing', 'Hockey', 'Crew'],
    recentChampionships: [{ year: 2022, title: 'National', sport: 'Sailing' }],
    notableAlumni: [
      { name: 'Travis Roy', sport: 'Hockey', achievement: 'Hockey' }
    ],
    facilitiesHighlights: ['Sailing Center', 'Travis Roy Rink', 'Fish Center for Health and Athletics'],
    sportPrograms: [
      { sport: 'Sailing', gender: 'Coed', grade: 'A+', season: 'Spring', level: 'Varsity', championships: 6 },
      { sport: 'Hockey', gender: 'Boys', grade: 'A', season: 'Winter', level: 'Varsity', record: '19-7-2' },
      { sport: 'Hockey', gender: 'Girls', grade: 'A+', season: 'Winter', level: 'Varsity', record: '22-2-1', championships: 3 },
      { sport: 'Crew', gender: 'Coed', grade: 'A', season: 'Spring', level: 'Varsity' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity', record: '14-4' },
      { sport: 'Soccer', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '10-5-3' },
      { sport: 'Basketball', gender: 'Girls', grade: 'A-', season: 'Winter', level: 'Varsity', record: '18-5' },
      { sport: 'Football', gender: 'Boys', grade: 'B-', season: 'Fall', level: 'Varsity', record: '4-5' }
    ]
  },
  {
    schoolName: 'Brooks School',
    city: 'North Andover',
    state: 'MA',
    conference: 'ISL',
    conferenceId: 'c4',
    varsitySportsCount: 24,
    strongestPrograms: ['Basketball', 'Soccer', 'Field Hockey'],
    recentChampionships: [{ year: 2023, title: 'ISL', sport: 'Basketball' }],
    notableAlumni: [
      { name: 'Pat Connaughton', sport: 'Basketball', achievement: 'NBA' }
    ],
    facilitiesHighlights: ['Athletic Center', 'Turf Fields', 'Rowing Center'],
    sportPrograms: [
      { sport: 'Basketball', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', record: '22-3', championships: 4 },
      { sport: 'Soccer', gender: 'Boys', grade: 'A', season: 'Fall', level: 'Varsity', record: '15-2-2' },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'A', season: 'Fall', level: 'Varsity', record: '14-3-1' },
      { sport: 'Crew', gender: 'Coed', grade: 'A-', season: 'Spring', level: 'Varsity' },
      { sport: 'Hockey', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '12-10-3' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '10-6' },
      { sport: 'Football', gender: 'Boys', grade: 'B', season: 'Fall', level: 'Varsity', record: '6-3' },
      { sport: 'Tennis', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity', record: '10-4' }
    ]
  },
  {
    schoolName: "The Governor's Academy",
    city: 'Byfield',
    state: 'MA',
    conference: 'ISL',
    conferenceId: 'c4',
    varsitySportsCount: 26,
    strongestPrograms: ['Lacrosse', 'Field Hockey', 'Track'],
    recentChampionships: [{ year: 2023, title: 'ISL', sport: 'Lacrosse' }],
    notableAlumni: [],
    facilitiesHighlights: ['Pescosolido Field House', 'Whiston Bragdon Arena', 'Turf Complex'],
    sportPrograms: [
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A+', season: 'Spring', level: 'Varsity', record: '16-2', championships: 3 },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'A', season: 'Fall', level: 'Varsity', record: '15-3-1' },
      { sport: 'Track', gender: 'Coed', grade: 'A-', season: 'Spring', level: 'Varsity' },
      { sport: 'Football', gender: 'Boys', grade: 'A-', season: 'Fall', level: 'Varsity', record: '7-2' },
      { sport: 'Hockey', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '14-9-2' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '16-8' },
      { sport: 'Soccer', gender: 'Boys', grade: 'B', season: 'Fall', level: 'Varsity', record: '9-5-3' },
      { sport: 'Baseball', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '12-7' }
    ]
  },
  {
    schoolName: 'Belmont Hill School',
    city: 'Belmont',
    state: 'MA',
    conference: 'ISL',
    conferenceId: 'c4',
    varsitySportsCount: 16,
    strongestPrograms: ['Wrestling', 'Hockey', 'Lacrosse', 'Crew'],
    recentChampionships: [{ year: 2023, title: 'ISL', sport: 'Hockey' }],
    notableAlumni: [],
    facilitiesHighlights: ['Jordan Athletic Center', 'Fritz Reuter Arena', 'Wrestling Room'],
    sportPrograms: [
      { sport: 'Wrestling', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', championships: 8 },
      { sport: 'Hockey', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', record: '22-4-2', championships: 5 },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A+', season: 'Spring', level: 'Varsity', record: '17-1', championships: 3 },
      { sport: 'Crew', gender: 'Boys', grade: 'A', season: 'Spring', level: 'Varsity' },
      { sport: 'Football', gender: 'Boys', grade: 'A-', season: 'Fall', level: 'Varsity', record: '7-2' },
      { sport: 'Soccer', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '11-4-3' },
      { sport: 'Track', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B', season: 'Winter', level: 'Varsity', record: '14-10' }
    ]
  },
  {
    schoolName: 'Noble and Greenough School',
    city: 'Dedham',
    state: 'MA',
    conference: 'ISL',
    conferenceId: 'c4',
    varsitySportsCount: 28,
    strongestPrograms: ['Hockey', 'Crew', 'Lacrosse'],
    recentChampionships: [{ year: 2023, title: 'NEPSAC Elite 8', sport: 'Hockey' }],
    notableAlumni: [
      { name: 'Kevin Hayes', sport: 'Hockey', achievement: 'NHL' },
      { name: 'Jimmy Vesey', sport: 'Hockey', achievement: 'NHL' }
    ],
    facilitiesHighlights: ['Omni Rink', 'Boathouse', 'Athletic Center'],
    sportPrograms: [
      { sport: 'Hockey', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', record: '23-3-1', championships: 4 },
      { sport: 'Hockey', gender: 'Girls', grade: 'A+', season: 'Winter', level: 'Varsity', record: '25-1-1', championships: 6 },
      { sport: 'Crew', gender: 'Coed', grade: 'A', season: 'Spring', level: 'Varsity', championships: 2 },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A', season: 'Spring', level: 'Varsity', record: '16-3' },
      { sport: 'Soccer', gender: 'Girls', grade: 'A-', season: 'Fall', level: 'Varsity', record: '14-2-2' },
      { sport: 'Football', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '6-3' },
      { sport: 'Basketball', gender: 'Girls', grade: 'A-', season: 'Winter', level: 'Varsity', record: '19-4' },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'A-', season: 'Fall', level: 'Varsity', record: '13-3-1' }
    ]
  },
  {
    schoolName: 'Buckingham Browne & Nichols',
    city: 'Cambridge',
    state: 'MA',
    conference: 'ISL',
    conferenceId: 'c4',
    varsitySportsCount: 25,
    strongestPrograms: ['Football', 'Soccer', 'Crew'],
    recentChampionships: [{ year: 2022, title: 'ISL', sport: 'Football' }],
    notableAlumni: [],
    facilitiesHighlights: ['Nicholas Athletic Center', 'Boat Club', 'Turf Field'],
    sportPrograms: [
      { sport: 'Football', gender: 'Boys', grade: 'A+', season: 'Fall', level: 'Varsity', record: '8-1', championships: 2 },
      { sport: 'Soccer', gender: 'Boys', grade: 'A', season: 'Fall', level: 'Varsity', record: '14-3-2' },
      { sport: 'Crew', gender: 'Coed', grade: 'A-', season: 'Spring', level: 'Varsity' },
      { sport: 'Hockey', gender: 'Girls', grade: 'A-', season: 'Winter', level: 'Varsity', record: '17-6-2' },
      { sport: 'Hockey', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '13-11-2' },
      { sport: 'Baseball', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity', record: '14-5' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '15-9' },
      { sport: 'Lacrosse', gender: 'Girls', grade: 'B+', season: 'Spring', level: 'Varsity', record: '11-6' }
    ]
  },
  {
    schoolName: 'The Rivers School',
    city: 'Weston',
    state: 'MA',
    conference: 'ISL',
    conferenceId: 'c4',
    varsitySportsCount: 21,
    strongestPrograms: ['Basketball', 'Soccer', 'Hockey'],
    recentChampionships: [{ year: 2023, title: 'ISL', sport: 'Basketball' }],
    notableAlumni: [],
    facilitiesHighlights: ['MacDowell Athletic Center', 'Waterman Field', 'Carlin Center'],
    sportPrograms: [
      { sport: 'Basketball', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', record: '20-4', championships: 3 },
      { sport: 'Soccer', gender: 'Boys', grade: 'A', season: 'Fall', level: 'Varsity', record: '15-2-1' },
      { sport: 'Hockey', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '16-8-2' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity', record: '13-5' },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'B+', season: 'Fall', level: 'Varsity', record: '11-4-2' },
      { sport: 'Football', gender: 'Boys', grade: 'B', season: 'Fall', level: 'Varsity', record: '5-4' },
      { sport: 'Baseball', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '12-7' },
      { sport: 'Tennis', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity', record: '9-4' }
    ]
  },
  {
    schoolName: "St. Mark's School",
    city: 'Southborough',
    state: 'MA',
    conference: 'ISL',
    conferenceId: 'c4',
    varsitySportsCount: 26,
    strongestPrograms: ['Hockey', 'Lacrosse'],
    recentChampionships: [{ year: 2022, title: 'ISL', sport: 'Hockey' }],
    notableAlumni: [
      { name: 'Scott Young', sport: 'Hockey', achievement: 'NHL' }
    ],
    facilitiesHighlights: ['Michel Faculty Athletic Center', 'Gardner Rink', 'Turf Fields'],
    sportPrograms: [
      { sport: 'Hockey', gender: 'Boys', grade: 'A', season: 'Winter', level: 'Varsity', record: '19-6-1', championships: 2 },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A', season: 'Spring', level: 'Varsity', record: '15-4' },
      { sport: 'Soccer', gender: 'Boys', grade: 'A-', season: 'Fall', level: 'Varsity', record: '12-3-3' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '14-9' },
      { sport: 'Football', gender: 'Boys', grade: 'B', season: 'Fall', level: 'Varsity', record: '6-3' },
      { sport: 'Crew', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity' },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'B+', season: 'Fall', level: 'Varsity', record: '10-5-2' },
      { sport: 'Baseball', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '11-6' }
    ]
  },
  {
    schoolName: "St. George's School",
    city: 'Newport',
    state: 'RI',
    conference: 'ISL',
    conferenceId: 'c4',
    varsitySportsCount: 24,
    strongestPrograms: ['Sailing', 'Hockey', 'Lacrosse'],
    recentChampionships: [{ year: 2023, title: 'National', sport: 'Sailing' }],
    notableAlumni: [],
    facilitiesHighlights: ['Hoopes Squash Center', 'Howard Ice Arena', 'Sailing Center'],
    sportPrograms: [
      { sport: 'Sailing', gender: 'Coed', grade: 'A+', season: 'Spring', level: 'Varsity', championships: 5 },
      { sport: 'Hockey', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '15-9-2' },
      { sport: 'Hockey', gender: 'Girls', grade: 'A-', season: 'Winter', level: 'Varsity', record: '16-7-2' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity', record: '12-5' },
      { sport: 'Squash', gender: 'Coed', grade: 'A-', season: 'Winter', level: 'Varsity', record: '11-4' },
      { sport: 'Football', gender: 'Boys', grade: 'B', season: 'Fall', level: 'Varsity', record: '5-4' },
      { sport: 'Soccer', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '10-6-1' },
      { sport: 'Tennis', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity', record: '9-5' }
    ]
  },
  {
    schoolName: 'Thayer Academy',
    city: 'Braintree',
    state: 'MA',
    conference: 'ISL',
    conferenceId: 'c4',
    varsitySportsCount: 27,
    strongestPrograms: ['Track', 'Hockey', 'Lacrosse'],
    recentChampionships: [{ year: 2023, title: 'ISL', sport: 'Track' }],
    notableAlumni: [
      { name: 'Jeremy Roenick', sport: 'Hockey', achievement: 'NHL' },
      { name: 'Charlie Coyle', sport: 'Hockey', achievement: 'NHL' }
    ],
    facilitiesHighlights: ['Sports Center', 'Arthur Valicenti Rink', 'Turf Field'],
    sportPrograms: [
      { sport: 'Track', gender: 'Coed', grade: 'A+', season: 'Spring', level: 'Varsity', championships: 4 },
      { sport: 'Hockey', gender: 'Boys', grade: 'A', season: 'Winter', level: 'Varsity', record: '18-7-2', championships: 2 },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A', season: 'Spring', level: 'Varsity', record: '14-4' },
      { sport: 'Football', gender: 'Boys', grade: 'A-', season: 'Fall', level: 'Varsity', record: '7-2' },
      { sport: 'Soccer', gender: 'Girls', grade: 'B+', season: 'Fall', level: 'Varsity', record: '11-4-2' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '15-9' },
      { sport: 'Baseball', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity', record: '13-6' },
      { sport: 'Wrestling', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity' }
    ]
  },
  {
    schoolName: "St. Paul's School",
    city: 'Concord',
    state: 'NH',
    conference: 'NEPSAC',
    conferenceId: 'c5',
    varsitySportsCount: 28,
    strongestPrograms: ['Hockey', 'Crew', 'Skiing', 'Lacrosse'],
    recentChampionships: [{ year: 2023, title: 'NEPSAC', sport: 'Hockey' }],
    notableAlumni: [
      { name: 'Hobey Baker', sport: 'Hockey', achievement: 'Hockey Legend' }
    ],
    facilitiesHighlights: ['Athletic and Fitness Center', 'Gordon Rink', 'Boathouse'],
    sportPrograms: [
      { sport: 'Hockey', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', record: '20-5-2', championships: 5 },
      { sport: 'Hockey', gender: 'Girls', grade: 'A', season: 'Winter', level: 'Varsity', record: '18-6-1' },
      { sport: 'Crew', gender: 'Coed', grade: 'A+', season: 'Spring', level: 'Varsity', championships: 4 },
      { sport: 'Skiing', gender: 'Coed', grade: 'A+', season: 'Winter', level: 'Varsity', championships: 3 },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A', season: 'Spring', level: 'Varsity', record: '14-5' },
      { sport: 'Football', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '6-3' },
      { sport: 'Soccer', gender: 'Girls', grade: 'A-', season: 'Fall', level: 'Varsity', record: '12-3-2' },
      { sport: 'Squash', gender: 'Coed', grade: 'A-', season: 'Winter', level: 'Varsity', record: '10-4' }
    ]
  },
  {
    schoolName: 'Berkshire School',
    city: 'Sheffield',
    state: 'MA',
    conference: 'NEPSAC',
    conferenceId: 'c5',
    varsitySportsCount: 29,
    strongestPrograms: ['Soccer', 'Hockey', 'Skiing'],
    recentChampionships: [{ year: 2022, title: 'NEPSAC Class A', sport: 'Soccer' }],
    notableAlumni: [
      { name: 'Jack Harrison', sport: 'Soccer', achievement: 'Premier League' }
    ],
    facilitiesHighlights: ['Jackman L. Stewart Athletic Center', 'Rovensky Fieldhouse', 'Ski Hill'],
    sportPrograms: [
      { sport: 'Soccer', gender: 'Boys', grade: 'A+', season: 'Fall', level: 'Varsity', record: '18-1-1', nationalRanking: 3, championships: 5 },
      { sport: 'Hockey', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', record: '22-4-2', championships: 2 },
      { sport: 'Skiing', gender: 'Coed', grade: 'A', season: 'Winter', level: 'Varsity', championships: 3 },
      { sport: 'Crew', gender: 'Coed', grade: 'A-', season: 'Spring', level: 'Varsity' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity', record: '13-5' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '15-8' },
      { sport: 'Track', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity' },
      { sport: 'Volleyball', gender: 'Girls', grade: 'A-', season: 'Fall', level: 'Varsity', record: '14-3' }
    ]
  },
  {
    schoolName: 'Salisbury School',
    city: 'Salisbury',
    state: 'CT',
    conference: 'NEPSAC',
    conferenceId: 'c5',
    varsitySportsCount: 18,
    strongestPrograms: ['Hockey', 'Lacrosse', 'Crew'],
    recentChampionships: [{ year: 2023, title: 'NEPSAC Elite 8', sport: 'Hockey' }],
    notableAlumni: [],
    facilitiesHighlights: ['Flood Athletic Center', 'Curtis Boathouse', 'Olympic Rink'],
    sportPrograms: [
      { sport: 'Hockey', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', record: '24-4-1', championships: 6 },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A+', season: 'Spring', level: 'Varsity', record: '18-2', nationalRanking: 8, championships: 4 },
      { sport: 'Crew', gender: 'Boys', grade: 'A', season: 'Spring', level: 'Varsity', championships: 2 },
      { sport: 'Football', gender: 'Boys', grade: 'A-', season: 'Fall', level: 'Varsity', record: '7-2' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '16-8' },
      { sport: 'Soccer', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '11-5-2' },
      { sport: 'Baseball', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity', record: '14-4' },
      { sport: 'Skiing', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity' }
    ]
  },
  {
    schoolName: 'Pomfret School',
    city: 'Pomfret',
    state: 'CT',
    conference: 'NEPSAC',
    conferenceId: 'c5',
    varsitySportsCount: 23,
    strongestPrograms: ['Hockey', 'Volleyball', 'Squash'],
    recentChampionships: [{ year: 2023, title: 'NEPSAC Class B', sport: 'Volleyball' }],
    notableAlumni: [],
    facilitiesHighlights: ['Corzine Athletic Center', 'Jahn Rink', 'Blodgett Tennis Center'],
    sportPrograms: [
      { sport: 'Hockey', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '16-9-2' },
      { sport: 'Volleyball', gender: 'Girls', grade: 'A', season: 'Fall', level: 'Varsity', record: '17-2', championships: 2 },
      { sport: 'Squash', gender: 'Coed', grade: 'A-', season: 'Winter', level: 'Varsity', record: '11-4' },
      { sport: 'Crew', gender: 'Coed', grade: 'A-', season: 'Spring', level: 'Varsity' },
      { sport: 'Football', gender: 'Boys', grade: 'B', season: 'Fall', level: 'Varsity', record: '5-4' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '10-6' },
      { sport: 'Soccer', gender: 'Girls', grade: 'B+', season: 'Fall', level: 'Varsity', record: '11-4-2' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B', season: 'Winter', level: 'Varsity', record: '12-10' }
    ]
  },
  {
    schoolName: 'Suffield Academy',
    city: 'Suffield',
    state: 'CT',
    conference: 'NEPSAC',
    conferenceId: 'c5',
    varsitySportsCount: 22,
    strongestPrograms: ['Football', 'Swimming', 'Soccer'],
    recentChampionships: [{ year: 2022, title: 'NEPSAC Bowl', sport: 'Football' }],
    notableAlumni: [
      { name: 'Christian Wilkins', sport: 'Football', achievement: 'NFL' }
    ],
    facilitiesHighlights: ['Tisch Field House', 'Apsea Pool', 'Turf Fields'],
    sportPrograms: [
      { sport: 'Football', gender: 'Boys', grade: 'A+', season: 'Fall', level: 'Varsity', record: '8-1', championships: 4 },
      { sport: 'Swimming', gender: 'Coed', grade: 'A', season: 'Winter', level: 'Varsity', record: '10-2' },
      { sport: 'Soccer', gender: 'Boys', grade: 'A-', season: 'Fall', level: 'Varsity', record: '13-3-2' },
      { sport: 'Basketball', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '17-6' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '11-5' },
      { sport: 'Water Polo', gender: 'Coed', grade: 'B+', season: 'Fall', level: 'Varsity' },
      { sport: 'Track', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity' },
      { sport: 'Baseball', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity', record: '14-5' }
    ]
  },
  {
    schoolName: 'Holderness School',
    city: 'Holderness',
    state: 'NH',
    conference: 'Lakes Region',
    conferenceId: 'c6',
    varsitySportsCount: 20,
    strongestPrograms: ['Skiing', 'Hockey', 'Lacrosse'],
    recentChampionships: [{ year: 2023, title: 'NEPSAC', sport: 'Skiing' }],
    notableAlumni: [],
    facilitiesHighlights: ['Ice Arena', 'Ski Trails', 'Turf Field'],
    sportPrograms: [
      { sport: 'Skiing', gender: 'Coed', grade: 'A+', season: 'Winter', level: 'Varsity', championships: 6 },
      { sport: 'Hockey', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '17-8-1' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A', season: 'Spring', level: 'Varsity', record: '14-3', championships: 2 },
      { sport: 'Soccer', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '11-4-2' },
      { sport: 'Snowboarding', gender: 'Coed', grade: 'A', season: 'Winter', level: 'Varsity', championships: 3 },
      { sport: 'Mountain Biking', gender: 'Coed', grade: 'A-', season: 'Fall', level: 'Varsity' },
      { sport: 'Tennis', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity', record: '9-4' },
      { sport: 'Football', gender: 'Boys', grade: 'B', season: 'Fall', level: 'Varsity', record: '4-4' }
    ]
  },
  {
    schoolName: 'Northfield Mount Hermon',
    city: 'Gill',
    state: 'MA',
    conference: 'NEPSAC',
    conferenceId: 'c5',
    varsitySportsCount: 31,
    strongestPrograms: ['Basketball', 'Soccer', 'Track'],
    recentChampionships: [{ year: 2022, title: 'NEPSAC AAA', sport: 'Basketball' }],
    notableAlumni: [
      { name: 'Noah Locke', sport: 'Basketball', achievement: 'NCAA BB' }
    ],
    facilitiesHighlights: ['Forslund Gym', 'Gordy Pavilion', 'Outdoor Track'],
    sportPrograms: [
      { sport: 'Basketball', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', record: '26-5', nationalRanking: 12, championships: 4 },
      { sport: 'Soccer', gender: 'Boys', grade: 'A', season: 'Fall', level: 'Varsity', record: '15-2-2', championships: 2 },
      { sport: 'Track', gender: 'Coed', grade: 'A', season: 'Spring', level: 'Varsity', championships: 3 },
      { sport: 'Rowing', gender: 'Coed', grade: 'A-', season: 'Spring', level: 'Varsity' },
      { sport: 'Volleyball', gender: 'Girls', grade: 'A-', season: 'Fall', level: 'Varsity', record: '14-3' },
      { sport: 'Swimming', gender: 'Coed', grade: 'B+', season: 'Winter', level: 'Varsity', record: '9-3' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '11-6' },
      { sport: 'Wrestling', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity' }
    ]
  },
  {
    schoolName: 'Williston Northampton School',
    city: 'Easthampton',
    state: 'MA',
    conference: 'NEPSAC',
    conferenceId: 'c5',
    varsitySportsCount: 30,
    strongestPrograms: ['Water Polo', 'Hockey', 'Swimming'],
    recentChampionships: [{ year: 2023, title: 'NEPSAC', sport: 'Water Polo' }],
    notableAlumni: [],
    facilitiesHighlights: ['Athletic Center', 'Lossone Rink', 'Babcock Pool'],
    sportPrograms: [
      { sport: 'Water Polo', gender: 'Coed', grade: 'A+', season: 'Fall', level: 'Varsity', record: '16-2', championships: 3 },
      { sport: 'Hockey', gender: 'Girls', grade: 'A+', season: 'Winter', level: 'Varsity', record: '22-2-1', championships: 2 },
      { sport: 'Hockey', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '15-9-2' },
      { sport: 'Swimming', gender: 'Coed', grade: 'A', season: 'Winter', level: 'Varsity', record: '11-1' },
      { sport: 'Football', gender: 'Boys', grade: 'A-', season: 'Fall', level: 'Varsity', record: '7-2' },
      { sport: 'Lacrosse', gender: 'Girls', grade: 'A-', season: 'Spring', level: 'Varsity', record: '13-3' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '16-7' },
      { sport: 'Track', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity' }
    ]
  },
  {
    schoolName: 'Canterbury School',
    city: 'New Milford',
    state: 'CT',
    conference: 'NEPSAC',
    conferenceId: 'c5',
    varsitySportsCount: 22,
    strongestPrograms: ['Hockey', 'Wrestling', 'Squash'],
    recentChampionships: [{ year: 2023, title: 'NEPSAC Class C', sport: 'Hockey' }],
    notableAlumni: [
      { name: 'Hal Gill', sport: 'Hockey', achievement: 'NHL' }
    ],
    facilitiesHighlights: ['Athletics Center', 'Ice Rink', 'Squash Courts'],
    sportPrograms: [
      { sport: 'Hockey', gender: 'Boys', grade: 'A', season: 'Winter', level: 'Varsity', record: '18-6-2', championships: 2 },
      { sport: 'Wrestling', gender: 'Boys', grade: 'A', season: 'Winter', level: 'Varsity', championships: 3 },
      { sport: 'Squash', gender: 'Coed', grade: 'A-', season: 'Winter', level: 'Varsity', record: '10-4' },
      { sport: 'Football', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '6-3' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '15-8' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '11-6' },
      { sport: 'Soccer', gender: 'Girls', grade: 'B+', season: 'Fall', level: 'Varsity', record: '10-4-3' },
      { sport: 'Crew', gender: 'Coed', grade: 'B', season: 'Spring', level: 'Varsity' }
    ]
  },
  {
    schoolName: 'Cushing Academy',
    city: 'Ashburnham',
    state: 'MA',
    conference: 'NEPSAC',
    conferenceId: 'c5',
    varsitySportsCount: 22,
    strongestPrograms: ['Hockey', 'Basketball'],
    recentChampionships: [{ year: 2023, title: 'NEPSAC Elite 8', sport: 'Hockey' }],
    notableAlumni: [
      { name: 'Keith Yandle', sport: 'Hockey', achievement: 'NHL' }
    ],
    facilitiesHighlights: ['Watkins Field House', 'Iorio Arena', 'Quimby Field'],
    sportPrograms: [
      { sport: 'Hockey', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', record: '23-4-2', championships: 4 },
      { sport: 'Basketball', gender: 'Boys', grade: 'A', season: 'Winter', level: 'Varsity', record: '20-6', championships: 2 },
      { sport: 'Soccer', gender: 'Boys', grade: 'A-', season: 'Fall', level: 'Varsity', record: '13-3-2' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '12-5' },
      { sport: 'Football', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '6-3' },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'B', season: 'Fall', level: 'Varsity', record: '8-6-2' },
      { sport: 'Baseball', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity', record: '14-5' },
      { sport: 'Volleyball', gender: 'Girls', grade: 'B+', season: 'Fall', level: 'Varsity', record: '11-5' }
    ]
  },
  {
    schoolName: 'Kimball Union Academy',
    city: 'Meriden',
    state: 'NH',
    conference: 'Lakes Region',
    conferenceId: 'c6',
    varsitySportsCount: 24,
    strongestPrograms: ['Hockey', 'Soccer', 'Rugby'],
    recentChampionships: [{ year: 2022, title: 'NEPSAC Elite 8', sport: 'Hockey' }],
    notableAlumni: [],
    facilitiesHighlights: ['Akerstrom Arena', 'Carver Athletic Center', 'Pope Field'],
    sportPrograms: [
      { sport: 'Hockey', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', record: '25-3-2', championships: 5 },
      { sport: 'Soccer', gender: 'Boys', grade: 'A', season: 'Fall', level: 'Varsity', record: '16-2-1', championships: 2 },
      { sport: 'Rugby', gender: 'Boys', grade: 'A', season: 'Spring', level: 'Varsity', record: '8-1' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity', record: '13-4' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '17-7' },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'B+', season: 'Fall', level: 'Varsity', record: '11-5' },
      { sport: 'Skiing', gender: 'Coed', grade: 'A-', season: 'Winter', level: 'Varsity' },
      { sport: 'Tennis', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity', record: '10-3' }
    ]
  },
  {
    schoolName: 'Proctor Academy',
    city: 'Andover',
    state: 'NH',
    conference: 'Lakes Region',
    conferenceId: 'c6',
    varsitySportsCount: 28,
    strongestPrograms: ['Skiing', 'Hockey', 'Mountain Biking'],
    recentChampionships: [{ year: 2023, title: 'NEPSAC', sport: 'Skiing' }],
    notableAlumni: [],
    facilitiesHighlights: ['Proctor Ski Area', 'Teddy Maloney Rink', 'Farrell Field House'],
    sportPrograms: [
      { sport: 'Skiing', gender: 'Coed', grade: 'A+', season: 'Winter', level: 'Varsity', championships: 7 },
      { sport: 'Mountain Biking', gender: 'Coed', grade: 'A+', season: 'Fall', level: 'Varsity', championships: 4 },
      { sport: 'Hockey', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '16-9-2' },
      { sport: 'Hockey', gender: 'Girls', grade: 'A-', season: 'Winter', level: 'Varsity', record: '17-7-1' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity', record: '12-4' },
      { sport: 'Soccer', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '10-5-2' },
      { sport: 'Basketball', gender: 'Girls', grade: 'B+', season: 'Winter', level: 'Varsity', record: '14-7' },
      { sport: 'Tennis', gender: 'Coed', grade: 'B', season: 'Spring', level: 'Varsity', record: '8-5' }
    ]
  },
  {
    schoolName: 'New Hampton School',
    city: 'New Hampton',
    state: 'NH',
    conference: 'Lakes Region',
    conferenceId: 'c6',
    varsitySportsCount: 22,
    strongestPrograms: ['Basketball', 'Hockey', 'Lacrosse'],
    recentChampionships: [{ year: 2022, title: 'NEPSAC AAA', sport: 'Basketball' }],
    notableAlumni: [
      { name: 'Noah Vonleh', sport: 'Basketball', achievement: 'NBA' },
      { name: 'Tyler Lydon', sport: 'Basketball', achievement: 'NBA' }
    ],
    facilitiesHighlights: ['Jacobson Arena', 'Moore Center', 'Kennedy Field'],
    sportPrograms: [
      { sport: 'Basketball', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', record: '25-6', nationalRanking: 18, championships: 3 },
      { sport: 'Hockey', gender: 'Boys', grade: 'A', season: 'Winter', level: 'Varsity', record: '19-7-2' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity', record: '14-4' },
      { sport: 'Football', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '6-3' },
      { sport: 'Soccer', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '11-4-2' },
      { sport: 'Basketball', gender: 'Girls', grade: 'A-', season: 'Winter', level: 'Varsity', record: '18-5' },
      { sport: 'Mountain Biking', gender: 'Coed', grade: 'A-', season: 'Fall', level: 'Varsity' },
      { sport: 'Tennis', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity', record: '9-4' }
    ]
  },
  {
    schoolName: 'Brewster Academy',
    city: 'Wolfeboro',
    state: 'NH',
    conference: 'Lakes Region',
    conferenceId: 'c6',
    varsitySportsCount: 20,
    strongestPrograms: ['Basketball', 'Crew', 'Soccer'],
    recentChampionships: [{ year: 2023, title: 'National Prep', sport: 'Basketball' }],
    notableAlumni: [
      { name: 'Donovan Mitchell', sport: 'Basketball', achievement: 'NBA' },
      { name: 'TJ Warren', sport: 'Basketball', achievement: 'NBA' }
    ],
    facilitiesHighlights: ['Smith Center', 'Pinckney Boathouse', 'Brown Field'],
    sportPrograms: [
      { sport: 'Basketball', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', record: '31-3', nationalRanking: 4, championships: 7 },
      { sport: 'Crew', gender: 'Coed', grade: 'A', season: 'Spring', level: 'Varsity', championships: 2 },
      { sport: 'Soccer', gender: 'Boys', grade: 'A-', season: 'Fall', level: 'Varsity', record: '14-3-2' },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'B+', season: 'Spring', level: 'Varsity', record: '11-5' },
      { sport: 'Hockey', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '13-9-2' },
      { sport: 'Basketball', gender: 'Girls', grade: 'B+', season: 'Winter', level: 'Varsity', record: '15-7' },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'B', season: 'Fall', level: 'Varsity', record: '9-6-1' },
      { sport: 'Tennis', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity', record: '10-3' }
    ]
  },
  {
    schoolName: 'Episcopal High School',
    city: 'Alexandria',
    state: 'VA',
    conference: 'IAC',
    conferenceId: 'c7',
    varsitySportsCount: 25,
    strongestPrograms: ['Football', 'Lacrosse', 'Track'],
    recentChampionships: [{ year: 2022, title: 'IAC', sport: 'Football' }],
    notableAlumni: [
      { name: 'Tim Hightower', sport: 'Football', achievement: 'NFL' }
    ],
    facilitiesHighlights: ['Flippin Field House', 'Hummel Bowl', 'Goodwin Athletics Center'],
    sportPrograms: [
      { sport: 'Football', gender: 'Boys', grade: 'A+', season: 'Fall', level: 'Varsity', record: '8-1', championships: 5 },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A', season: 'Spring', level: 'Varsity', record: '15-4' },
      { sport: 'Track', gender: 'Coed', grade: 'A+', season: 'Spring', level: 'Varsity', championships: 4 },
      { sport: 'Basketball', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '18-6' },
      { sport: 'Soccer', gender: 'Boys', grade: 'A-', season: 'Fall', level: 'Varsity', record: '13-3-2' },
      { sport: 'Wrestling', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity' },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'A-', season: 'Fall', level: 'Varsity', record: '14-4' },
      { sport: 'Tennis', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity', record: '10-4' }
    ]
  },
  {
    schoolName: 'Woodberry Forest School',
    city: 'Woodberry Forest',
    state: 'VA',
    conference: 'VPL',
    conferenceId: 'c8',
    varsitySportsCount: 18,
    strongestPrograms: ['Football', 'Track', 'Golf'],
    recentChampionships: [{ year: 2023, title: 'VPL', sport: 'Football' }],
    notableAlumni: [
      { name: 'CJ Prosise', sport: 'Football', achievement: 'NFL' }
    ],
    facilitiesHighlights: ['Barbee Center', 'Johnson Stadium', 'Golf Course'],
    sportPrograms: [
      { sport: 'Football', gender: 'Boys', grade: 'A+', season: 'Fall', level: 'Varsity', record: '8-1', championships: 6 },
      { sport: 'Track', gender: 'Boys', grade: 'A+', season: 'Spring', level: 'Varsity', championships: 5 },
      { sport: 'Golf', gender: 'Boys', grade: 'A', season: 'Spring', level: 'Varsity', record: '14-1', championships: 3 },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity', record: '13-4' },
      { sport: 'Wrestling', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '16-8' },
      { sport: 'Soccer', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '11-4-2' },
      { sport: 'Swimming', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '8-2' }
    ]
  },
  {
    schoolName: 'Culver Academies',
    city: 'Culver',
    state: 'IN',
    conference: 'Independent',
    conferenceId: 'c13',
    varsitySportsCount: 27,
    strongestPrograms: ['Hockey', 'Lacrosse', 'Equestrian'],
    recentChampionships: [{ year: 2023, title: 'National Prep', sport: 'Hockey' }],
    notableAlumni: [
      { name: 'Ryan Suter', sport: 'Hockey', achievement: 'NHL' }
    ],
    facilitiesHighlights: ['Henderson Arena', 'Oliver Field', 'Equestrian Center'],
    sportPrograms: [
      { sport: 'Hockey', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', record: '28-4-1', nationalRanking: 6, championships: 4 },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A+', season: 'Spring', level: 'Varsity', record: '19-2', nationalRanking: 9, championships: 3 },
      { sport: 'Equestrian', gender: 'Coed', grade: 'A+', season: 'Spring', level: 'Varsity', championships: 8 },
      { sport: 'Fencing', gender: 'Coed', grade: 'A', season: 'Winter', level: 'Varsity', championships: 2 },
      { sport: 'Rowing', gender: 'Coed', grade: 'A-', season: 'Spring', level: 'Varsity' },
      { sport: 'Basketball', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '18-5' },
      { sport: 'Football', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '7-3' },
      { sport: 'Soccer', gender: 'Girls', grade: 'A-', season: 'Fall', level: 'Varsity', record: '14-3-1' }
    ]
  },
  {
    schoolName: "St. Andrew's School",
    city: 'Middletown',
    state: 'DE',
    conference: 'DISC',
    conferenceId: 'c9',
    varsitySportsCount: 21,
    strongestPrograms: ['Crew', 'Lacrosse', 'Field Hockey'],
    recentChampionships: [{ year: 2022, title: 'State', sport: 'Crew' }],
    notableAlumni: [],
    facilitiesHighlights: ['Sipprelle Field House', 'Noxontown Pond Boathouse', 'Turf Fields'],
    sportPrograms: [
      { sport: 'Crew', gender: 'Coed', grade: 'A+', season: 'Spring', level: 'Varsity', championships: 5 },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A', season: 'Spring', level: 'Varsity', record: '14-3' },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'A', season: 'Fall', level: 'Varsity', record: '15-2-1', championships: 2 },
      { sport: 'Basketball', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '17-6' },
      { sport: 'Soccer', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '11-4-2' },
      { sport: 'Squash', gender: 'Coed', grade: 'B+', season: 'Winter', level: 'Varsity', record: '9-4' },
      { sport: 'Cross Country', gender: 'Coed', grade: 'A-', season: 'Fall', level: 'Varsity' },
      { sport: 'Tennis', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity', record: '10-3' }
    ]
  },
  {
    schoolName: 'Brunswick School',
    city: 'Greenwich',
    state: 'CT',
    conference: 'FAA',
    conferenceId: 'c10',
    varsitySportsCount: 19,
    strongestPrograms: ['Lacrosse', 'Squash', 'Crew'],
    recentChampionships: [{ year: 2023, title: 'National Prep', sport: 'Squash' }],
    notableAlumni: [
      { name: 'Kevin Shattenkirk', sport: 'Hockey', achievement: 'NHL' }
    ],
    facilitiesHighlights: ['Sampson Athletic Center', 'Hartong Rink', 'Squash Courts'],
    sportPrograms: [
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A+', season: 'Spring', level: 'Varsity', record: '18-2', nationalRanking: 4, championships: 4 },
      { sport: 'Squash', gender: 'Boys', grade: 'A+', season: 'Winter', level: 'Varsity', record: '15-0', nationalRanking: 1, championships: 6 },
      { sport: 'Crew', gender: 'Boys', grade: 'A', season: 'Spring', level: 'Varsity', championships: 2 },
      { sport: 'Hockey', gender: 'Boys', grade: 'A', season: 'Winter', level: 'Varsity', record: '21-6-1' },
      { sport: 'Football', gender: 'Boys', grade: 'A-', season: 'Fall', level: 'Varsity', record: '8-1' },
      { sport: 'Water Polo', gender: 'Boys', grade: 'A-', season: 'Fall', level: 'Varsity', record: '14-3' },
      { sport: 'Soccer', gender: 'Boys', grade: 'B+', season: 'Fall', level: 'Varsity', record: '12-4-2' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '15-7' }
    ]
  },
  {
    schoolName: 'Hackley School',
    city: 'Tarrytown',
    state: 'NY',
    conference: 'Ivy Prep',
    conferenceId: 'c11',
    varsitySportsCount: 23,
    strongestPrograms: ['Lacrosse', 'Soccer', 'Track'],
    recentChampionships: [{ year: 2023, title: 'NYSAIS', sport: 'Lacrosse' }],
    notableAlumni: [],
    facilitiesHighlights: ['Johnson Center for Health and Wellness', 'Pickert Field', 'Zetkov Athletics Center'],
    sportPrograms: [
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A+', season: 'Spring', level: 'Varsity', record: '15-2', championships: 3 },
      { sport: 'Soccer', gender: 'Boys', grade: 'A', season: 'Fall', level: 'Varsity', record: '14-2-1', championships: 2 },
      { sport: 'Track', gender: 'Coed', grade: 'A+', season: 'Spring', level: 'Varsity', championships: 4 },
      { sport: 'Fencing', gender: 'Coed', grade: 'A-', season: 'Winter', level: 'Varsity' },
      { sport: 'Basketball', gender: 'Boys', grade: 'A-', season: 'Winter', level: 'Varsity', record: '16-6' },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'B+', season: 'Fall', level: 'Varsity', record: '11-5' },
      { sport: 'Squash', gender: 'Coed', grade: 'B+', season: 'Winter', level: 'Varsity', record: '10-4' },
      { sport: 'Tennis', gender: 'Coed', grade: 'B+', season: 'Spring', level: 'Varsity', record: '9-3' }
    ]
  },
  {
    schoolName: 'The Pingry School',
    city: 'Basking Ridge',
    state: 'NJ',
    conference: 'Skyland',
    conferenceId: 'c12',
    varsitySportsCount: 28,
    strongestPrograms: ['Soccer', 'Swimming', 'Tennis'],
    recentChampionships: [{ year: 2022, title: 'State Group', sport: 'Soccer' }],
    notableAlumni: [],
    facilitiesHighlights: ['Bugliari Athletics Center', 'Beinecke Pool', 'Parsons Field'],
    sportPrograms: [
      { sport: 'Soccer', gender: 'Boys', grade: 'A+', season: 'Fall', level: 'Varsity', record: '18-1-2', championships: 5 },
      { sport: 'Swimming', gender: 'Coed', grade: 'A+', season: 'Winter', level: 'Varsity', record: '11-0', championships: 4 },
      { sport: 'Tennis', gender: 'Coed', grade: 'A', season: 'Spring', level: 'Varsity', record: '15-2', championships: 2 },
      { sport: 'Lacrosse', gender: 'Boys', grade: 'A-', season: 'Spring', level: 'Varsity', record: '14-4' },
      { sport: 'Track', gender: 'Coed', grade: 'A-', season: 'Spring', level: 'Varsity' },
      { sport: 'Field Hockey', gender: 'Girls', grade: 'B+', season: 'Fall', level: 'Varsity', record: '12-4-1' },
      { sport: 'Basketball', gender: 'Boys', grade: 'B+', season: 'Winter', level: 'Varsity', record: '16-7' },
      { sport: 'Fencing', gender: 'Coed', grade: 'A-', season: 'Winter', level: 'Varsity' }
    ]
  }
];

export function getSchoolByName(name: string): SchoolSports | undefined {
  return SCHOOL_SPORTS_DATA.find(school => school.schoolName.toLowerCase() === name.toLowerCase() || school.schoolName.toLowerCase().includes(name.toLowerCase()));
}

export function getSchoolsByConference(conferenceId: string): SchoolSports[] {
  return SCHOOL_SPORTS_DATA.filter(school => school.conferenceId === conferenceId);
}
