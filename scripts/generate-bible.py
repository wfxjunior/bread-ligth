#!/usr/bin/env python3
# Gera os 66 livros da Bíblia (WEB inglês + Almeida português, ambos domínio
# público via seven1m/open-bibles, formato USFX) no shape do app:
#   { id, name, englishName, testament, chapters: { n: [{v, en, pt}] } }
import re, html, os, urllib.request

# Public-domain sources (see docs/bible-text-provenance.md)
WEB_URL = "https://raw.githubusercontent.com/seven1m/open-bibles/master/eng-web.usfx.xml"
ALM_URL = "https://raw.githubusercontent.com/seven1m/open-bibles/master/por-almeida.usfx.xml"

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(REPO, ".bible-src-cache")
WEB = os.path.join(CACHE, "web.usfx.xml")
ALM = os.path.join(CACHE, "almeida.usfx.xml")
OUT = os.path.join(REPO, "artifacts", "mobile", "constants", "bible")

def _ensure(path, url):
    if os.path.exists(path):
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    print("baixando", url)
    urllib.request.urlretrieve(url, path)

# USFX code -> (appId, ptName, englishName, testament)
BOOKS = [
    ("GEN","genesis","Gênesis","Genesis","old"),
    ("EXO","exodus","Êxodo","Exodus","old"),
    ("LEV","leviticus","Levítico","Leviticus","old"),
    ("NUM","numbers","Números","Numbers","old"),
    ("DEU","deuteronomy","Deuteronômio","Deuteronomy","old"),
    ("JOS","joshua","Josué","Joshua","old"),
    ("JDG","judges","Juízes","Judges","old"),
    ("RUT","ruth","Rute","Ruth","old"),
    ("1SA","1samuel","1 Samuel","1 Samuel","old"),
    ("2SA","2samuel","2 Samuel","2 Samuel","old"),
    ("1KI","1kings","1 Reis","1 Kings","old"),
    ("2KI","2kings","2 Reis","2 Kings","old"),
    ("1CH","1chronicles","1 Crônicas","1 Chronicles","old"),
    ("2CH","2chronicles","2 Crônicas","2 Chronicles","old"),
    ("EZR","ezra","Esdras","Ezra","old"),
    ("NEH","nehemiah","Neemias","Nehemiah","old"),
    ("EST","esther","Ester","Esther","old"),
    ("JOB","job","Jó","Job","old"),
    ("PSA","psalms","Salmos","Psalms","old"),
    ("PRO","proverbs","Provérbios","Proverbs","old"),
    ("ECC","ecclesiastes","Eclesiastes","Ecclesiastes","old"),
    ("SNG","songofsolomon","Cânticos","Song of Solomon","old"),
    ("ISA","isaiah","Isaías","Isaiah","old"),
    ("JER","jeremiah","Jeremias","Jeremiah","old"),
    ("LAM","lamentations","Lamentações","Lamentations","old"),
    ("EZK","ezekiel","Ezequiel","Ezekiel","old"),
    ("DAN","daniel","Daniel","Daniel","old"),
    ("HOS","hosea","Oseias","Hosea","old"),
    ("JOL","joel","Joel","Joel","old"),
    ("AMO","amos","Amós","Amos","old"),
    ("OBA","obadiah","Obadias","Obadiah","old"),
    ("JON","jonah","Jonas","Jonah","old"),
    ("MIC","micah","Miquéias","Micah","old"),
    ("NAM","nahum","Naum","Nahum","old"),
    ("HAB","habakkuk","Habacuque","Habakkuk","old"),
    ("ZEP","zephaniah","Sofonias","Zephaniah","old"),
    ("HAG","haggai","Ageu","Haggai","old"),
    ("ZEC","zechariah","Zacarias","Zechariah","old"),
    ("MAL","malachi","Malaquias","Malachi","old"),
    ("MAT","matthew","Mateus","Matthew","new"),
    ("MRK","mark","Marcos","Mark","new"),
    ("LUK","luke","Lucas","Luke","new"),
    ("JHN","john","João","John","new"),
    ("ACT","acts","Atos","Acts","new"),
    ("ROM","romans","Romanos","Romans","new"),
    ("1CO","1corinthians","1 Coríntios","1 Corinthians","new"),
    ("2CO","2corinthians","2 Coríntios","2 Corinthians","new"),
    ("GAL","galatians","Gálatas","Galatians","new"),
    ("EPH","ephesians","Efésios","Ephesians","new"),
    ("PHP","philippians","Filipenses","Philippians","new"),
    ("COL","colossians","Colossenses","Colossians","new"),
    ("1TH","1thessalonians","1 Tessalonicenses","1 Thessalonians","new"),
    ("2TH","2thessalonians","2 Tessalonicenses","2 Thessalonians","new"),
    ("1TI","1timothy","1 Timóteo","1 Timothy","new"),
    ("2TI","2timothy","2 Timóteo","2 Timothy","new"),
    ("TIT","titus","Tito","Titus","new"),
    ("PHM","philemon","Filemom","Philemon","new"),
    ("HEB","hebrews","Hebreus","Hebrews","new"),
    ("JAS","james","Tiago","James","new"),
    ("1PE","1peter","1 Pedro","1 Peter","new"),
    ("2PE","2peter","2 Pedro","2 Peter","new"),
    ("1JN","1john","1 João","1 John","new"),
    ("2JN","2john","2 João","2 John","new"),
    ("3JN","3john","3 João","3 John","new"),
    ("JUD","jude","Judas","Jude","new"),
    ("REV","revelation","Apocalipse","Revelation","new"),
]

def extract_book_block(xml, code):
    # <book id="CODE" ...> ... </book>
    m = re.search(r'<book id="%s"[^>]*>(.*?)</book>' % re.escape(code), xml, re.S)
    return m.group(1) if m else None

# tags whose entire content (incl. inner text) must be dropped
DROP_WITH_CONTENT = re.compile(
    r'<(f|x|fig|rem|note|ref)\b[^>]*>.*?</\1>', re.S)
SELFCLOSE_DROP = re.compile(r'<(ve|fe|xe|optionalLineBreak|milestone)\b[^>]*/>')
ANY_TAG = re.compile(r'<[^>]+>')
WS = re.compile(r'\s+')

def clean(text):
    text = DROP_WITH_CONTENT.sub(' ', text)
    text = SELFCLOSE_DROP.sub(' ', text)
    text = ANY_TAG.sub(' ', text)
    text = html.unescape(text)
    # remove footnote/verse-number cross-ref leftover markers
    text = text.replace('¶', ' ')  # pilcrow
    text = WS.sub(' ', text).strip()
    return text

def parse(xml_path):
    xml = open(xml_path, encoding='utf-8').read()
    data = {}  # code -> {chap:int -> {verse:int -> text}}
    for code, *_ in BOOKS:
        block = extract_book_block(xml, code)
        if block is None:
            continue
        chapters = {}
        # split by chapter marker
        parts = re.split(r'<c id="(\d+)"[^>]*/?>', block)
        # parts[0] is preamble before ch1; then pairs (num, content)
        for i in range(1, len(parts), 2):
            cnum = int(parts[i])
            content = parts[i+1]
            verses = {}
            # find verses: <v id="N" ...> up to next <v id= or end
            vmatches = list(re.finditer(r'<v id="([\d\-,]+)"[^>]*/?>', content))
            for j, vm in enumerate(vmatches):
                vid = vm.group(1)
                vnum = int(re.match(r'\d+', vid).group(0))
                start = vm.end()
                end = vmatches[j+1].start() if j+1 < len(vmatches) else len(content)
                raw = content[start:end]
                txt = clean(raw)
                if txt:
                    # if verse id was a range like 1-2, still key on first num
                    verses[vnum] = txt
            if verses:
                chapters[cnum] = verses
        data[code] = chapters
    return data

def esc(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")

def camel(appid):
    # 1corinthians -> firstCorinthians style not needed; use safe const via default export
    return appid

def main():
    _ensure(WEB, WEB_URL)
    _ensure(ALM, ALM_URL)
    web = parse(WEB)
    alm = parse(ALM)
    os.makedirs(OUT, exist_ok=True)
    stats = []
    total_verses = 0
    total_en_missing = 0
    total_pt_missing = 0
    for code, appid, ptname, enname, testament in BOOKS:
        wch = web.get(code, {})
        ach = alm.get(code, {})
        all_ch = sorted(set(wch) | set(ach))
        book_verses = 0
        en_missing = 0
        pt_missing = 0
        chap_lines = []
        for c in all_ch:
            wv = wch.get(c, {})
            av = ach.get(c, {})
            vnums = sorted(set(wv) | set(av))
            vlines = []
            for v in vnums:
                en = wv.get(v, "")
                pt = av.get(v, "")
                if not en and pt:
                    en = pt      # fallback: keep verse visible
                    en_missing += 1
                if not pt and en:
                    pt = wv.get(v, "") or en
                    pt_missing += 1
                if not en and not pt:
                    continue
                book_verses += 1
                vlines.append("      { v: %d, en: '%s', pt: '%s' }," % (v, esc(en), esc(pt)))
            if vlines:
                chap_lines.append("    %d: [\n%s\n    ]," % (c, "\n".join(vlines)))
        total_verses += book_verses
        total_en_missing += en_missing
        total_pt_missing += pt_missing
        stats.append((appid, len(all_ch), book_verses, en_missing, pt_missing))
        ts = (
            "import type { BibleBook } from '../bibleData';\n\n"
            "// Auto-generated from public-domain sources: World English Bible (WEB, EN)\n"
            "// and João Ferreira de Almeida (Almeida, PT), via seven1m/open-bibles (USFX).\n"
            "// Do not edit by hand — regenerate with scripts/generate-bible.\n\n"
            "const book: BibleBook = {\n"
            "  id: '%s',\n  name: '%s',\n  englishName: '%s',\n  testament: '%s',\n"
            "  chapters: {\n%s\n  },\n};\n\nexport default book;\n"
        ) % (esc(appid), esc(ptname), esc(enname), testament, "\n".join(chap_lines))
        with open(os.path.join(OUT, appid + ".ts"), "w", encoding="utf-8") as f:
            f.write(ts)
    print("=== STATS por livro (id | caps | versiculos | en_faltando | pt_faltando) ===")
    for s in stats:
        flag = "  <-- CHECAR" if (s[3] or s[4]) else ""
        print("%-16s %3d caps  %5d vs  en_falta=%d pt_falta=%d%s" % (s[0], s[1], s[2], s[3], s[4], flag))
    print("\nTOTAL: %d livros, %d versiculos, en_faltando=%d, pt_faltando=%d"
          % (len(stats), total_verses, total_en_missing, total_pt_missing))

if __name__ == "__main__":
    main()
