// Kérdésbank váz (easy, medium, hard blokkok)
export type Question = {
  id: number;
  question: string;
  options: string[];
  answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
};

export const questionBank: Question[] = [
  // Példa kérdések, később bővíthető
  {
    id: 1,
    question: 'Melyik agyterület felelős leginkább a munkamemóriáért?',
    options: ['Prefrontális kéreg', 'Hipokampusz', 'Cerebellum', 'Amygdala'],
    answer: 0,
    difficulty: 'easy',
  },
  {
    id: 2,
    question: 'Mi a szenzitív periódus a fejlődési kognitív idegtudományban?',
    options: ['Egy életkori szakasz, amikor a tanulás különösen hatékony', 'Az agy öregedési folyamata', 'A szinapszisok pusztulása', 'A motoros fejlődés stagnálása'],
    answer: 0,
    difficulty: 'medium',
  },
  {
    id: 3,
    question: 'Melyik módszerrel mérhető legpontosabban a csecsemők agyi aktivitása?',
    options: ['fMRI', 'EEG', 'PET', 'CT'],
    answer: 1,
    difficulty: 'hard',
  },
  // ... további kérdések
];
