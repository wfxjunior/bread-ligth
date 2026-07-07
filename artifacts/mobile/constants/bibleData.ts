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

export const BIBLE_DATA: Record<string, BibleBook> = {
  john: johnBook,
  proverbs: proverbsBook,
  genesis: {
    id: 'genesis',
    name: 'Gênesis',
    englishName: 'Genesis',
    testament: 'old',
    chapters: {
      1: [
        { v: 1, en: 'In the beginning God created the heaven and the earth.', pt: 'No princípio, criou Deus os céus e a terra.' },
        { v: 2, en: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.', pt: 'A terra era sem forma e vazia; trevas cobriam a face do abismo, e o Espírito de Deus se movia sobre a face das águas.' },
        { v: 3, en: 'And God said, Let there be light: and there was light.', pt: 'E disse Deus: Haja luz. E houve luz.' },
        { v: 4, en: 'And God saw the light, that it was good: and God divided the light from the darkness.', pt: 'E viu Deus que a luz era boa; e fez Deus separação entre a luz e as trevas.' },
        { v: 5, en: 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.', pt: 'E Deus chamou à luz Dia, e às trevas chamou Noite. E foi a tarde e a manhã, o dia primeiro.' },
        { v: 6, en: 'And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters.', pt: 'E disse Deus: Haja uma expansão no meio das águas, e haja separação entre águas e águas.' },
        { v: 7, en: 'And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so.', pt: 'E fez Deus a expansão, e separou as águas que estavam debaixo da expansão das que estavam sobre a expansão. E assim se fez.' },
        { v: 8, en: 'And God called the firmament Heaven. And the evening and the morning were the second day.', pt: 'E chamou Deus à expansão Céus; e foi a tarde e a manhã, o dia segundo.' },
        { v: 9, en: 'And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so.', pt: 'E disse Deus: Ajuntem-se as águas que estão debaixo dos céus num lugar, e apareça a porção seca. E assim se fez.' },
        { v: 10, en: 'And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good.', pt: 'E chamou Deus à porção seca Terra, e ao ajuntamento das águas chamou Mares; e viu Deus que isso era bom.' },
        { v: 11, en: 'And God said, Let the earth bring forth grass, the herb yielding seed, and the fruit tree yielding fruit after his kind, whose seed is in itself, upon the earth: and it was so.', pt: 'E disse Deus: Produza a terra erva verde, erva que dê semente, árvore frutífera que dê fruto segundo a sua espécie, cuja semente esteja nela sobre a terra. E assim se fez.' },
        { v: 12, en: 'And the earth brought forth grass, and herb yielding seed after his kind, and the tree yielding fruit, whose seed was in itself, after his kind: and God saw that it was good.', pt: 'E a terra produziu erva, erva dando semente segundo a sua espécie, e árvore dando fruto, cuja semente estava nela, segundo a sua espécie; e viu Deus que isso era bom.' },
        { v: 13, en: 'And the evening and the morning were the third day.', pt: 'E foi a tarde e a manhã, o dia terceiro.' },
        { v: 14, en: 'And God said, Let there be lights in the firmament of the heaven to divide the day from the night; and let them be for signs, and for seasons, and for days, and years.', pt: 'E disse Deus: Haja luminares na expansão dos céus, para separar o dia da noite; e sejam eles para sinais, e para estações, e para dias, e para anos.' },
        { v: 15, en: 'And let them be for lights in the firmament of the heaven to give light upon the earth: and it was so.', pt: 'E sejam luminares na expansão dos céus para iluminar a terra. E assim se fez.' },
        { v: 16, en: 'And God made two great lights; the greater light to rule the day, and the lesser light to rule the night: he made the stars also.', pt: 'E fez Deus os dois grandes luminares: o luminar maior para governar o dia, e o luminar menor para governar a noite; e também as estrelas.' },
        { v: 17, en: 'And God set them in the firmament of the heaven to give light upon the earth.', pt: 'E Deus os pôs na expansão dos céus para iluminar a terra.' },
        { v: 18, en: 'And to rule over the day and over the night, and to divide the light from the darkness: and God saw that it was good.', pt: 'E para governar o dia e a noite, e para separar a luz das trevas; e viu Deus que era bom.' },
        { v: 19, en: 'And the evening and the morning were the fourth day.', pt: 'E foi a tarde e a manhã, o dia quarto.' },
        { v: 20, en: 'And God said, Let the waters bring forth abundantly the moving creature that hath life, and fowl that may fly above the earth in the open firmament of heaven.', pt: 'E disse Deus: Produzam as águas abundantemente répteis, seres vivos, e aves que voem sobre a terra na aberta expansão dos céus.' },
        { v: 21, en: 'And God created great whales, and every living creature that moveth, which the waters brought forth abundantly, after their kind, and every winged fowl after his kind: and God saw that it was good.', pt: 'E criou Deus as grandes baleias, e todo o réptil vivente que as águas produziram abundantemente segundo as suas espécies, e toda ave de asas segundo a sua espécie; e viu Deus que era bom.' },
        { v: 22, en: 'And God blessed them, saying, Be fruitful, and multiply, and fill the waters in the seas, and let fowl multiply in the earth.', pt: 'E Deus os abençoou, dizendo: Sede fecundos e multiplicai-vos, e enchei as águas nos mares; e as aves se multipliquem na terra.' },
        { v: 23, en: 'And the evening and the morning were the fifth day.', pt: 'E foi a tarde e a manhã, o dia quinto.' },
        { v: 24, en: 'And God said, Let the earth bring forth the living creature after his kind, cattle, and creeping thing, and beast of the earth after his kind: and it was so.', pt: 'E disse Deus: Produza a terra seres vivos segundo as suas espécies: animais domésticos, répteis e feras da terra segundo as suas espécies. E assim se fez.' },
        { v: 25, en: 'And God made the beast of the earth after his kind, and cattle after their kind, and every thing that creepeth upon the earth after his kind: and God saw that it was good.', pt: 'E fez Deus as feras da terra segundo as suas espécies, e os animais domésticos segundo as suas espécies, e todos os répteis da terra segundo as suas espécies; e viu Deus que era bom.' },
        { v: 26, en: 'And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth.', pt: 'E disse Deus: Façamos o homem à nossa imagem, conforme a nossa semelhança; e domine sobre os peixes do mar, e sobre as aves dos céus, e sobre o gado, e sobre toda a terra.' },
        { v: 27, en: 'So God created man in his own image, in the image of God created he him; male and female created he them.', pt: 'E criou Deus o homem à sua imagem; à imagem de Deus o criou; homem e mulher os criou.' },
        { v: 28, en: 'And God blessed them, and God said unto them, Be fruitful, and multiply, and replenish the earth, and subdue it: and have dominion over the fish of the sea, and over the fowl of the air.', pt: 'E Deus os abençoou, e Deus lhes disse: Sede fecundos, multiplicai-vos, enchei a terra e sujeitai-a; e dominai sobre os peixes do mar, e sobre as aves dos céus.' },
        { v: 29, en: 'And God said, Behold, I have given you every herb bearing seed, which is upon the face of all the earth, and every tree, in the which is the fruit of a tree yielding seed; to you it shall be for meat.', pt: 'E disse Deus: Eis que vos tenho dado toda a erva que dá semente, que está sobre a face de toda a terra, e toda a árvore em que há fruto com semente; isso vos será para alimento.' },
        { v: 30, en: 'And to every beast of the earth, and to every fowl of the air, and to every thing that creepeth upon the earth, wherein there is life, I have given every green herb for meat: and it was so.', pt: 'E a todo o animal da terra, e a toda a ave dos céus, e a todo o réptil da terra em que há vida, toda a erva verde servirá de alimento. E assim se fez.' },
        { v: 31, en: 'And God saw every thing that he had made, and, behold, it was very good. And the evening and the morning were the sixth day.', pt: 'E viu Deus tudo quanto tinha feito, e eis que era muito bom; e foi a tarde e a manhã, o dia sexto.' },
      ],
    },
  },
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
