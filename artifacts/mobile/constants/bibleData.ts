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

export const BIBLE_DATA: Record<string, BibleBook> = {
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
  john: {
    id: 'john',
    name: 'João',
    englishName: 'John',
    testament: 'new',
    chapters: {
      3: [
        { v: 1, en: 'There was a man of the Pharisees, named Nicodemus, a ruler of the Jews.', pt: 'E havia entre os fariseus um homem chamado Nicodemos, príncipe dos judeus.' },
        { v: 2, en: 'The same came to Jesus by night, and said unto him, Rabbi, we know that thou art a teacher come from God: for no man can do these miracles that thou doest, except God be with him.', pt: 'Este foi ter com Jesus de noite e disse-lhe: Rabi, sabemos que és Mestre vindo da parte de Deus, porque ninguém pode fazer estes sinais que tu fazes, se Deus não estiver com ele.' },
        { v: 3, en: 'Jesus answered and said unto him, Verily, verily, I say unto thee, Except a man be born again, he cannot see the kingdom of God.', pt: 'Jesus respondeu e disse-lhe: Em verdade, em verdade te digo que aquele que não nascer de novo não pode ver o reino de Deus.' },
        { v: 4, en: 'Nicodemus saith unto him, How can a man be born when he is old? can he enter the second time into his mother\'s womb, and be born?', pt: 'Nicodemos disse-lhe: Como pode um homem nascer, sendo velho? Pode entrar segunda vez no ventre de sua mãe e nascer?' },
        { v: 5, en: 'Jesus answered, Verily, verily, I say unto thee, Except a man be born of water and of the Spirit, he cannot enter into the kingdom of God.', pt: 'Jesus respondeu: Em verdade, em verdade te digo que aquele que não nascer da água e do Espírito não pode entrar no reino de Deus.' },
        { v: 6, en: 'That which is born of the flesh is flesh; and that which is born of the Spirit is spirit.', pt: 'O que é nascido da carne é carne, e o que é nascido do Espírito é espírito.' },
        { v: 7, en: 'Marvel not that I said unto thee, Ye must be born again.', pt: 'Não te maravilhes de eu te dizer: Tendes de nascer de novo.' },
        { v: 8, en: 'The wind bloweth where it listeth, and thou hearest the sound thereof, but canst not tell whence it cometh, and whither it goeth: so is every one that is born of the Spirit.', pt: 'O vento sopra onde quer, e ouves a sua voz, mas não sabes de onde vem nem para onde vai; assim é todo o que é nascido do Espírito.' },
        { v: 9, en: 'Nicodemus answered and said unto him, How can these things be?', pt: 'Nicodemos respondeu e disse-lhe: Como podem ser assim estas coisas?' },
        { v: 10, en: 'Jesus answered and said unto him, Art thou a master of Israel, and knowest not these things?', pt: 'Respondeu-lhe Jesus: Tu és mestre em Israel e não sabes estas coisas?' },
        { v: 11, en: 'Verily, verily, I say unto thee, We speak that we do know, and testify that we have seen; and ye receive not our witness.', pt: 'Em verdade, em verdade te digo que falamos do que sabemos e testificamos do que vimos; mas não aceitais o nosso testemunho.' },
        { v: 12, en: 'If I have told you earthly things, and ye believe not, how shall ye believe, if I tell you of heavenly things?', pt: 'Se vos falei de coisas terrenas e não credes, como crereis se vos falar das celestiais?' },
        { v: 13, en: 'And no man hath ascended up to heaven, but he that came down from heaven, even the Son of man which is in heaven.', pt: 'Ninguém sobe ao céu, senão o que desceu do céu, o Filho do homem, que está no céu.' },
        { v: 14, en: 'And as Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted up.', pt: 'E, assim como Moisés levantou a serpente no deserto, assim importa que o Filho do homem seja levantado.' },
        { v: 15, en: 'That whosoever believeth in him should not perish, but have eternal life.', pt: 'Para que todo aquele que nele crê não pereça, mas tenha a vida eterna.' },
        { v: 16, en: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.', pt: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.' },
        { v: 17, en: 'For God sent not his Son into the world to condemn the world; but that the world through him might be saved.', pt: 'Porque Deus enviou o seu Filho ao mundo, não para que condenasse o mundo, mas para que o mundo fosse salvo por ele.' },
        { v: 18, en: 'He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God.', pt: 'Quem crê nele não é condenado; mas quem não crê já está condenado, porquanto não crê no nome do unigênito Filho de Deus.' },
        { v: 19, en: 'And this is the condemnation, that light is come into the world, and men loved darkness rather than light, because their deeds were evil.', pt: 'E é este o julgamento: que a luz veio ao mundo, e os homens amaram mais as trevas do que a luz, porque as suas obras eram más.' },
        { v: 20, en: 'For every one that doeth evil hateth the light, neither cometh to the light, lest his deeds should be reproved.', pt: 'Pois todo aquele que faz o mal odeia a luz e não vem para a luz, para que as suas obras não sejam reprovadas.' },
        { v: 21, en: 'But he that doeth truth cometh to the light, that his deeds may be made manifest, that they are wrought in God.', pt: 'Mas quem pratica a verdade vem para a luz, a fim de que as suas obras sejam manifestas, porque são feitas em Deus.' },
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
  { bookId: 'genesis', chapter: 1, titlePt: 'A Criação', titleEn: 'The Creation', gradient: ['#1B3A6B', '#2A5298'] },
  { bookId: 'psalms', chapter: 23, titlePt: 'O Bom Pastor', titleEn: 'The Good Shepherd', gradient: ['#3D6B41', '#5A9E60'] },
  { bookId: 'john', chapter: 3, titlePt: 'Nascer de Novo', titleEn: 'Born Again', gradient: ['#6B3A1B', '#A0582A'] },
  { bookId: 'matthew', chapter: 5, titlePt: 'Bem-aventuranças', titleEn: 'The Beatitudes', gradient: ['#4A1B6B', '#7B3FAA'] },
  { bookId: '1corinthians', chapter: 13, titlePt: 'O Amor', titleEn: 'The Love Chapter', gradient: ['#6B1B3A', '#AA3F5F'] },
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
