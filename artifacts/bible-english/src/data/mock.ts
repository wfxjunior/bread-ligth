export const MOCK_VERSES = [
  {
    id: 1,
    verseNumber: 1,
    english: "In the beginning was the Word, and the Word was with God, and the Word was God.",
    portuguese: "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus."
  },
  {
    id: 2,
    verseNumber: 2,
    english: "The same was in the beginning with God.",
    portuguese: "Ele estava no princípio com Deus."
  },
  {
    id: 3,
    verseNumber: 3,
    english: "All things were made by him; and without him was not any thing made that was made.",
    portuguese: "Todas as coisas foram feitas por intermédio dele, e sem ele nada do que foi feito se fez."
  },
  {
    id: 4,
    verseNumber: 4,
    english: "In him was life; and the life was the light of men.",
    portuguese: "Nele estava a vida, e a vida era a luz dos homens."
  },
  {
    id: 5,
    verseNumber: 5,
    english: "And the light shineth in darkness; and the darkness comprehended it not.",
    portuguese: "E a luz resplandece nas trevas, e as trevas não a compreenderam."
  },
  {
    id: 6,
    verseNumber: 6,
    english: "There was a man sent from God, whose name was John.",
    portuguese: "Houve um homem enviado de Deus cujo nome era João."
  },
  {
    id: 7,
    verseNumber: 7,
    english: "The same came for a witness, to bear witness of the Light, that all men through him might believe.",
    portuguese: "Este veio para testemunho, para que testificasse da Luz, a fim de que todos cressem por intermédio dele."
  },
  {
    id: 8,
    verseNumber: 8,
    english: "He was not that Light, but was sent to bear witness of that Light.",
    portuguese: "Ele não era a Luz, mas veio para que testificasse da Luz."
  },
  {
    id: 9,
    verseNumber: 9,
    english: "That was the true Light, which lighteth every man that cometh into the world.",
    portuguese: "A Luz verdadeira que ilumina a todo homem estava vindo ao mundo."
  },
  {
    id: 10,
    verseNumber: 10,
    english: "He was in the world, and the world was made by him, and the world knew him not.",
    portuguese: "Ele estava no mundo, e o mundo foi feito por meio dele, mas o mundo não o conheceu."
  },
  {
    id: 11,
    verseNumber: 11,
    english: "He came unto his own, and his own received him not.",
    portuguese: "Veio para o que era seu, e os seus não o receberam."
  },
  {
    id: 12,
    verseNumber: 12,
    english: "But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name.",
    portuguese: "Mas, a todos quantos o receberam, deu-lhes o poder de se tornarem filhos de Deus, a saber, aos que creem no seu nome."
  },
  {
    id: 13,
    verseNumber: 13,
    english: "Which were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God.",
    portuguese: "Os quais não nasceram do sangue, nem da vontade da carne, nem da vontade do homem, mas de Deus."
  },
  {
    id: 14,
    verseNumber: 14,
    english: "And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.",
    portuguese: "E o Verbo se fez carne e habitou entre nós, e vimos a sua glória, como a glória do Unigênito do Pai, cheio de graça e de verdade."
  }
];

export const MOCK_VOCABULARY = [
  { word: "Word", pronunciation: "/wɜːrd/", translation: "Verbo / Palavra", status: "Mastered", source: "John 1" },
  { word: "Light", pronunciation: "/laɪt/", translation: "Luz", status: "Learning", source: "John 1" },
  { word: "Grace", pronunciation: "/ɡreɪs/", translation: "Graça", status: "Learning", source: "John 1" },
  { word: "Truth", pronunciation: "/truːθ/", translation: "Verdade", status: "New", source: "John 1" },
  { word: "Believe", pronunciation: "/bɪˈliːv/", translation: "Crer / Acreditar", status: "Learning", source: "John 3" },
  { word: "Witness", pronunciation: "/ˈwɪtnɪs/", translation: "Testemunha", status: "New", source: "John 1" },
  { word: "Flesh", pronunciation: "/flɛʃ/", translation: "Carne", status: "New", source: "John 1" },
];

export const MOCK_NOTES = [
  { id: 1, reference: "John 1:1", date: "Oct 24, 2023", snippet: "The Greek word 'Logos' implies reason and speech, a profound concept." },
  { id: 2, reference: "John 1:4", date: "Oct 25, 2023", snippet: "Life is inextricably linked to light here. Light reveals truth." },
  { id: 3, reference: "John 1:14", date: "Oct 26, 2023", snippet: "The incarnation is the ultimate act of grace." },
];

export const MOCK_FAVORITES = [
  { id: 1, reference: "John 1:5", text: "And the light shineth in darkness; and the darkness comprehended it not." },
  { id: 2, reference: "John 1:14", text: "And the Word was made flesh, and dwelt among us..." },
  { id: 3, reference: "John 1:12", text: "But as many as received him, to them gave he power..." },
];

export const MOCK_CHAPTER_FAVORITES = [
  { id: 1, book: "John", chapter: 1, verseCount: 14, snippet: "In the beginning was the Word..." },
  { id: 2, book: "Psalms", chapter: 23, verseCount: 6, snippet: "The Lord is my shepherd; I shall not want." },
];

export const MOCK_BOOK_FAVORITES = [
  { id: 1, name: "John", chapters: 21, testament: "New Testament" },
  { id: 2, name: "Psalms", chapters: 150, testament: "Old Testament" },
];
