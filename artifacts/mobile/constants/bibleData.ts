export interface BibleVerse {
  v: number;
  en: string;
  pt: string;
}

export interface BibleBook {
  id: string;
  name: string;
  englishName: string;
  testament: 'old' | 'new';
  chapters: Record<number, BibleVerse[]>;
}

import { johnBook } from './bible/john';
import { proverbsBook } from './bible/proverbs';
import { genesisBook } from './bible/genesis';

export const BIBLE_DATA: Record<string, BibleBook> = {
  john: johnBook,
  proverbs: proverbsBook,
  genesis: genesisBook,
  psalms: {
    id: 'psalms',
    name: 'Salmos',
    englishName: 'Psalms',
    testament: 'old',
    chapters: {
      23: [
        { v: 1, en: 'The LORD is my shepherd; I shall not want.', pt: 'O Senhor é o meu pastor; de nada me faltará.' },
        { v: 2, en: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.', pt: 'Deitar-me faz em verdes prados e guia-me mansamente a águas tranquilas.' },
        { v: 3, en: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.', pt: 'Refrigera a minha alma; guia-me pelas veredas da justiça por amor do seu nome.' },
        { v: 4, en: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.', pt: 'Ainda que eu andasse pelo vale da sombra da morte, não temeria mal algum, porque tu estás comigo; o teu bordão e o teu cajado me consolam.' },
        { v: 5, en: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.', pt: 'Preparas uma mesa perante mim na presença dos meus inimigos, unges a minha cabeça com óleo, o meu cálice transborda.' },
        { v: 6, en: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.', pt: 'Certamente que a bondade e a misericórdia me seguirão todos os dias da minha vida, e habitarei na casa do Senhor por longos dias.' },
      ],
    },
  },
  matthew: {
    id: 'matthew',
    name: 'Mateus',
    englishName: 'Matthew',
    testament: 'new',
    chapters: {
      5: [
        { v: 1, en: 'And seeing the multitudes, he went up into a mountain: and when he was set, his disciples came unto him.', pt: 'Vendo Jesus as multidões, subiu ao monte; e, depois que se assentou, aproximaram-se dele os seus discípulos.' },
        { v: 2, en: 'And he opened his mouth, and taught them, saying,', pt: 'E ele passou a ensiná-los, dizendo:' },
        { v: 3, en: 'Blessed are the poor in spirit: for theirs is the kingdom of heaven.', pt: 'Bem-aventurados os pobres em espírito, porque deles é o reino dos céus.' },
        { v: 4, en: 'Blessed are they that mourn: for they shall be comforted.', pt: 'Bem-aventurados os que choram, porque serão consolados.' },
        { v: 5, en: 'Blessed are the meek: for they shall inherit the earth.', pt: 'Bem-aventurados os mansos, porque herdarão a terra.' },
        { v: 6, en: 'Blessed are they which do hunger and thirst after righteousness: for they shall be filled.', pt: 'Bem-aventurados os que têm fome e sede de justiça, porque serão fartos.' },
        { v: 7, en: 'Blessed are the merciful: for they shall obtain mercy.', pt: 'Bem-aventurados os misericordiosos, porque alcançarão misericórdia.' },
        { v: 8, en: 'Blessed are the pure in heart: for they shall see God.', pt: 'Bem-aventurados os limpos de coração, porque verão a Deus.' },
        { v: 9, en: 'Blessed are the peacemakers: for they shall be called the children of God.', pt: 'Bem-aventurados os pacificadores, porque serão chamados filhos de Deus.' },
        { v: 10, en: 'Blessed are they which are persecuted for righteousness\' sake: for theirs is the kingdom of heaven.', pt: 'Bem-aventurados os perseguidos por causa da justiça, porque deles é o reino dos céus.' },
        { v: 11, en: 'Blessed are ye, when men shall revile you, and persecute you, and shall say all manner of evil against you falsely, for my sake.', pt: 'Bem-aventurados sois quando vos injuriarem e perseguirem e, mentindo, disserem todo o mal contra vós por minha causa.' },
        { v: 12, en: 'Rejoice, and be exceeding glad: for great is your reward in heaven: for so persecuted they the prophets which were before you.', pt: 'Regozijai-vos e exultai, porque é grande o vosso galardão nos céus; pois assim perseguiram os profetas que vieram antes de vós.' },
      ],
    },
  },
  romans: {
    id: 'romans',
    name: 'Romanos',
    englishName: 'Romans',
    testament: 'new',
    chapters: {
      8: [
        { v: 1,  en: 'There is therefore now no condemnation to them which are in Christ Jesus, who walk not after the flesh, but after the Spirit.', pt: 'Portanto, agora nenhuma condenação há para os que estão em Cristo Jesus, que não andam segundo a carne, mas segundo o Espírito.' },
        { v: 2,  en: 'For the law of the Spirit of life in Christ Jesus hath made me free from the law of sin and death.',  pt: 'Porque a lei do Espírito de vida, em Cristo Jesus, me livrou da lei do pecado e da morte.' },
        { v: 6,  en: 'For to be carnally minded is death; but to be spiritually minded is life and peace.',                pt: 'Porque o pendor da carne é morte, mas o pendor do Espírito é vida e paz.' },
        { v: 14, en: 'For as many as are led by the Spirit of God, they are the sons of God.',                             pt: 'Porque todos os que são guiados pelo Espírito de Deus, esses são filhos de Deus.' },
        { v: 15, en: 'For ye have not received the spirit of bondage again to fear; but ye have received the Spirit of adoption, whereby we cry, Abba, Father.', pt: 'Porque não recebestes o espírito de escravidão para viverdes outra vez em temor, mas recebestes o Espírito de adoção de filhos, pelo qual clamamos: Aba, Pai.' },
        { v: 16, en: 'The Spirit itself beareth witness with our spirit, that we are the children of God.',               pt: 'O próprio Espírito testifica com o nosso espírito que somos filhos de Deus.' },
        { v: 18, en: 'For I reckon that the sufferings of this present time are not worthy to be compared with the glory which shall be revealed in us.', pt: 'Porque para mim tenho por certo que as aflições do tempo presente não são comparáveis com a glória que em nós há de ser revelada.' },
        { v: 28, en: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.', pt: 'E sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.' },
        { v: 31, en: 'What shall we then say to these things? If God be for us, who can be against us?',                  pt: 'Que diremos, pois, a estas coisas? Se Deus é por nós, quem será contra nós?' },
        { v: 32, en: 'He that spared not his own Son, but delivered him up for us all, how shall he not with him also freely give us all things?', pt: 'Aquele que não poupou o seu próprio Filho, antes o entregou por todos nós, como nos não dará também com ele todas as coisas?' },
        { v: 37, en: 'Nay, in all these things we are more than conquerors through him that loved us.',                  pt: 'Mas em todas estas coisas somos mais do que vencedores, por meio daquele que nos amou.' },
        { v: 38, en: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,', pt: 'Porque estou persuadido de que nem morte, nem vida, nem anjos, nem principados, nem potestades, nem o presente, nem o porvir,' },
        { v: 39, en: 'Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.', pt: 'Nem a altura, nem a profundeza, nem alguma outra criatura nos poderá separar do amor de Deus, que está em Cristo Jesus, nosso Senhor.' },
      ],
    },
  },
  philippians: {
    id: 'philippians',
    name: 'Filipenses',
    englishName: 'Philippians',
    testament: 'new',
    chapters: {
      4: [
        { v: 4,  en: 'Rejoice in the Lord always: and again I say, Rejoice.',                                              pt: 'Regozijai-vos sempre no Senhor; outra vez digo: Regozijai-vos.' },
        { v: 5,  en: 'Let your moderation be known unto all men. The Lord is at hand.',                                   pt: 'A vossa moderação seja conhecida de todos os homens. O Senhor está próximo.' },
        { v: 6,  en: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.', pt: 'Não andeis ansiosos por coisa alguma; antes, em tudo, pela oração e pela súplica, com ação de graças, apresentai as vossas petições a Deus.' },
        { v: 7,  en: 'And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.', pt: 'E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos pensamentos em Cristo Jesus.' },
        { v: 8,  en: 'Finally, brethren, whatsoever things are true, whatsoever things are honest, whatsoever things are just, whatsoever things are pure, whatsoever things are lovely, think on these things.', pt: 'Finalmente, irmãos, tudo o que é verdadeiro, tudo o que é honesto, tudo o que é justo, tudo o que é puro, tudo o que é amável, tudo o que é de boa fama, se há alguma virtude e se há algum louvor, nisso pensai.' },
        { v: 11, en: 'Not that I speak in respect of want: for I have learned, in whatsoever state I am, therewith to be content.', pt: 'Não porque deseje o presente, mas porque desejo o fruto que abunde em vossa conta; aprendi a contentar-me em qualquer estado em que me encontre.' },
        { v: 13, en: 'I can do all things through Christ which strengtheneth me.',                                         pt: 'Posso tudo naquele que me fortalece.' },
        { v: 19, en: 'But my God shall supply all your need according to his riches in glory by Christ Jesus.',           pt: 'O meu Deus, segundo as suas riquezas em glória, suprirá todas as vossas necessidades em Cristo Jesus.' },
      ],
    },
  },
  '1corinthians': {
    id: '1corinthians',
    name: '1 Coríntios',
    englishName: '1 Corinthians',
    testament: 'new',
    chapters: {
      13: [
        { v: 1, en: 'Though I speak with the tongues of men and of angels, and have not charity, I am become as sounding brass, or a tinkling cymbal.', pt: 'Ainda que eu falasse as línguas dos homens e dos anjos, se não tiver amor, serei como o bronze que soa ou como o címbalo que retine.' },
        { v: 2, en: 'And though I have the gift of prophecy, and understand all mysteries, and all knowledge; and though I have all faith, so that I could remove mountains, and have not charity, I am nothing.', pt: 'E ainda que eu tivesse o dom de profecia e conhecesse todos os mistérios e toda a ciência, e ainda que tivesse toda a fé, de maneira que transportasse os montes, se não tiver amor, nada serei.' },
        { v: 3, en: 'And though I bestow all my goods to feed the poor, and though I give my body to be burned, and have not charity, it profiteth me nothing.', pt: 'E ainda que distribuísse todos os meus bens em sustento dos pobres e ainda que entregasse o meu corpo para ser queimado, se não tiver amor, nada disso me aproveitará.' },
        { v: 4, en: 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up.', pt: 'O amor é paciente, é benigno; o amor não arde em ciúmes, não se vangloria, não se ensoberbece.' },
        { v: 5, en: 'Doth not behave itself unseemly, seeketh not her own, is not easily provoked, thinketh no evil.', pt: 'Não se porta com indecência, não procura os seus próprios interesses, não se irrita, não suspeita mal.' },
        { v: 6, en: 'Rejoiceth not in iniquity, but rejoiceth in the truth.', pt: 'Não se alegra com a injustiça, mas regozija-se com a verdade.' },
        { v: 7, en: 'Beareth all things, believeth all things, hopeth all things, endureth all things.', pt: 'Tudo sofre, tudo crê, tudo espera, tudo suporta.' },
        { v: 8, en: 'Charity never faileth: but whether there be prophecies, they shall fail; whether there be tongues, they shall cease; whether there be knowledge, it shall vanish away.', pt: 'O amor jamais acaba. Havendo profecias, desaparecerão; havendo línguas, cessarão; havendo ciência, desaparecerá.' },
        { v: 9, en: 'For now we know in part, and we prophesy in part.', pt: 'Porque, em parte, conhecemos e, em parte, profetizamos.' },
        { v: 10, en: 'But when that which is perfect is come, then that which is in part shall be done away.', pt: 'Quando, porém, vier o que é perfeito, então o que é parcial será posto de lado.' },
        { v: 11, en: 'When I was a child, I spake as a child, I understood as a child, I thought as a child: but when I became a man, I put away childish things.', pt: 'Quando eu era menino, falava como menino, sentia como menino, discorria como menino; quando cheguei a ser homem, acabei com as coisas de menino.' },
        { v: 12, en: 'For now we see through a glass, darkly; but then face to face: now I know in part; but then shall I know even as also I am known.', pt: 'Porque agora vemos como em espelho, obscuramente; então, veremos face a face; agora conheço em parte; então, conhecerei como também sou conhecido.' },
        { v: 13, en: 'And now abideth faith, hope, charity, these three; but the greatest of these is charity.', pt: 'Agora, pois, permanecem a fé, a esperança e o amor, estes três; mas o maior deles é o amor.' },
      ],
    },
  },
};

export interface FeaturedPassage {
  bookId: string;
  chapter: number;
  titlePt: string;
  titleEn: string;
  gradient: [string, string];
}

export const FEATURED_PASSAGES: FeaturedPassage[] = [
  { bookId: 'genesis',      chapter: 1,  titlePt: 'A Criação',          titleEn: 'The Creation',          gradient: ['#1B3A6B', '#2A5298'] },
  { bookId: 'psalms',       chapter: 23, titlePt: 'O Bom Pastor',       titleEn: 'The Good Shepherd',     gradient: ['#3D6B41', '#5A9E60'] },
  { bookId: 'john',         chapter: 1,  titlePt: 'O Verbo',            titleEn: 'The Word',              gradient: ['#2A1B4A', '#5B3FA0'] },
  { bookId: 'john',         chapter: 3,  titlePt: 'Nascer de Novo',     titleEn: 'Born Again',            gradient: ['#6B3A1B', '#A0582A'] },
  { bookId: 'john',         chapter: 14, titlePt: 'Eu Sou o Caminho',   titleEn: 'I Am the Way',          gradient: ['#1B3A4A', '#2E6B8E'] },
  { bookId: 'john',         chapter: 15, titlePt: 'A Videira',          titleEn: 'The True Vine',         gradient: ['#2A4A1B', '#4E8E2E'] },
  { bookId: 'proverbs',     chapter: 3,  titlePt: 'Confia no Senhor',   titleEn: 'Trust in the LORD',     gradient: ['#4A3A1B', '#8E6E2E'] },
  { bookId: 'proverbs',     chapter: 8,  titlePt: 'A Sabedoria Clama',  titleEn: 'Wisdom Cries Out',      gradient: ['#3A1B4A', '#7B3FAA'] },
  { bookId: 'romans',       chapter: 8,  titlePt: 'Mais que Vencedores', titleEn: 'More Than Conquerors', gradient: ['#1B4A3A', '#2E8B6E'] },
  { bookId: 'matthew',      chapter: 5,  titlePt: 'Bem-aventuranças',   titleEn: 'The Beatitudes',        gradient: ['#4A1B6B', '#7B3FAA'] },
  { bookId: 'philippians',  chapter: 4,  titlePt: 'A Paz de Deus',      titleEn: 'Peace of God',          gradient: ['#1B3A5A', '#2E6B9E'] },
  { bookId: '1corinthians', chapter: 13, titlePt: 'O Amor',             titleEn: 'The Love Chapter',      gradient: ['#6B1B3A', '#AA3F5F'] },
];

export function searchBible(query: string): Array<{ bookId: string; chapter: number; verse: BibleVerse }> {
  const q = query.toLowerCase().trim();
  if (q.length < 3) return [];
  const results: Array<{ bookId: string; chapter: number; verse: BibleVerse }> = [];
  for (const book of Object.values(BIBLE_DATA)) {
    for (const [chapterNum, verses] of Object.entries(book.chapters)) {
      for (const verse of verses) {
        if (verse.en.toLowerCase().includes(q) || verse.pt.toLowerCase().includes(q)) {
          results.push({ bookId: book.id, chapter: Number(chapterNum), verse });
        }
      }
    }
  }
  return results.slice(0, 40);
}
