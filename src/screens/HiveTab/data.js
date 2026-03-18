// ─────────────────────────────────────────────────────────────────────────────
// DATA MODEL
// ─────────────────────────────────────────────────────────────────────────────

export const PEOPLE = {
  shubham: {
    id: 'shubham',
    name: 'Shubham Seth',
    photo: 'https://randomuser.me/api/portraits/men/75.jpg',
    gender: 'male',
    birthDate: 'Jan 15, 1960',
    deathDate: 'Feb 18, 2026',
    profession: 'Doctor',
    city: 'Noida',
    country: 'India',
    flag: '🇮🇳',
    flagCode: 'IN',
    followers: 3,
  },
  maya: {
    id: 'maya',
    name: 'Maya Seth',
    photo: 'https://randomuser.me/api/portraits/women/44.jpg',
    gender: 'female',
    birthDate: 'Mar 11, 1968',
    deathDate: null,
    profession: 'Housewife',
    city: 'Noida',
    country: 'India',
    flag: '🇮🇳',
    flagCode: 'IN',
    followers: 15,
  },
  sandhya: {
    id: 'sandhya',
    name: 'Sandhya Kohli',
    photo: 'https://randomuser.me/api/portraits/women/68.jpg',
    gender: 'female',
    birthDate: 'Feb 19, 1998',
    deathDate: null,
    profession: 'Doctor',
    city: 'Noida',
    country: 'India',
    flag: '🇮🇳',
    flagCode: 'IN',
    followers: 245,
  },
  arjun: {
    id: 'arjun',
    name: 'Arjun Kohli',
    photo: 'https://randomuser.me/api/portraits/men/46.jpg',
    gender: 'male',
    birthDate: 'Apr 5, 1993',
    deathDate: null,
    profession: 'Engineer',
    city: 'Delhi',
    country: 'India',
    flag: '🇮🇳',
    flagCode: 'IN',
    followers: 312,
  },
  priya: {
    id: 'priya',
    name: 'Priya Kohli',
    photo: 'https://randomuser.me/api/portraits/women/55.jpg',
    gender: 'female',
    birthDate: 'Jun 10, 1995',
    deathDate: null,
    profession: 'Architect',
    city: 'Mumbai',
    country: 'India',
    flag: '🇮🇳',
    flagCode: 'IN',
    followers: 189,
  },
  raghav: {
    id: 'raghav',
    name: 'Raghav Kohli',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    gender: 'male',
    birthDate: 'Feb 19, 1998',
    deathDate: null,
    profession: 'Student (BBA)',
    city: 'Bangalore',
    country: 'India',
    flag: '🇮🇳',
    flagCode: 'IN',
    followers: 842,
  },
  shruti: {
    id: 'shruti',
    name: 'Shruti Kohli',
    photo: 'https://randomuser.me/api/portraits/women/29.jpg',
    gender: 'female',
    birthDate: 'Feb 19, 1998',
    deathDate: null,
    profession: 'Student (MBBS)',
    city: 'Kyiv',
    country: 'Ukraine',
    flag: '🇺🇦',
    flagCode: 'UA',
    followers: 1000,
  },
  vikram: {
    id: 'vikram',
    name: 'Vikram Seth',
    photo: 'https://randomuser.me/api/portraits/men/60.jpg',
    gender: 'male',
    birthDate: 'Dec 3, 1930',
    deathDate: 'Jul 22, 2010',
    profession: 'Retired Judge',
    city: 'Allahabad',
    country: 'India',
    flag: '🇮🇳',
    flagCode: 'IN',
    followers: 5,
  },
  kamla: {
    id: 'kamla',
    name: 'Kamla Seth',
    photo: 'https://randomuser.me/api/portraits/women/60.jpg',
    gender: 'female',
    birthDate: 'Mar 8, 1935',
    deathDate: 'Nov 14, 2018',
    profession: 'Teacher',
    city: 'Allahabad',
    country: 'India',
    flag: '🇮🇳',
    flagCode: 'IN',
    followers: 2,
  },
};

// Relationship graph: who is related to whom and how
export const RELATIONSHIPS = [
  // Vikram & Kamla are Shubham's parents
  { type: 'parent', sourceId: 'vikram',  targetId: 'shubham' },
  { type: 'parent', sourceId: 'kamla',   targetId: 'shubham' },
  // Shubham & Maya are spouses
  { type: 'spouse', sourceId: 'shubham', targetId: 'maya' },
  // Shubham & Maya are Sandhya's parents
  { type: 'parent', sourceId: 'shubham', targetId: 'sandhya' },
  { type: 'parent', sourceId: 'maya',    targetId: 'sandhya' },
  // Sandhya has two spouses: Arjun (primary) and Priya (second)
  { type: 'spouse', sourceId: 'sandhya', targetId: 'arjun' },
  { type: 'spouse', sourceId: 'sandhya', targetId: 'priya' },
  // Sandhya & Arjun are parents of Raghav & Shruti
  { type: 'parent', sourceId: 'sandhya', targetId: 'raghav' },
  { type: 'parent', sourceId: 'sandhya', targetId: 'shruti' },
  { type: 'parent', sourceId: 'arjun',   targetId: 'raghav' },
  { type: 'parent', sourceId: 'arjun',   targetId: 'shruti' },
];

// ─────────────────────────────────────────────────────────────────────────────
// GRAPH QUERY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns parents of a person (people who have a 'parent' relationship targeting this person).
 */
export function getParents(personId) {
  return RELATIONSHIPS
    .filter(r => r.type === 'parent' && r.targetId === personId)
    .map(r => r.sourceId)
    .filter((id, idx, arr) => arr.indexOf(id) === idx); // dedupe
}

/**
 * Returns spouses of a person (people who have a 'spouse' relationship with this person).
 */
export function getSpouses(personId) {
  return RELATIONSHIPS
    .filter(r => r.type === 'spouse' && (r.sourceId === personId || r.targetId === personId))
    .map(r => r.sourceId === personId ? r.targetId : r.sourceId)
    .filter((id, idx, arr) => arr.indexOf(id) === idx);
}

/**
 * Returns children of a person (people who have this person as a parent).
 */
export function getChildren(personId) {
  // Find all children where this person is listed as a parent
  const directChildren = RELATIONSHIPS
    .filter(r => r.type === 'parent' && r.sourceId === personId)
    .map(r => r.targetId);
  return [...new Set(directChildren)];
}
