"""
Erzeuge Grafiken von LEGO Strassenplatten
"""

from pytamaro.de import (
    Grafik, Farbe,
    weiss, gelb, rgb_farbe, transparent,
    kreis_sektor, rechteck, ellipse, leere_grafik,
    ueberlagere, ueber, neben, fixiere, kombiniere, drehe,
    unten_links,
    zeige_grafik, speichere_grafik,
)

RASEN = rgb_farbe(0, 203, 109)
STRASSE = rgb_farbe(140, 140, 140)
RANDSTREIFEN = gelb
MITTELSTREIFEN = weiss
FUSSGAENGERSTREIFEN = weiss
BASIS_GRAU = rgb_farbe(193, 198, 183)

ZEICHNE_NOPPEN = False
ZEICHNE_RAND = False

def quadrat(seite: float, farbe: Farbe) -> Grafik:
    return rechteck(seite, seite, farbe)

def noppen3d(noppengroesse: float, farbe: Farbe) -> Grafik:
    """Nicht verwendet, da der 3D Effekt durch drehen verfälscht wird"""
    grund = quadrat(noppengroesse, farbe)
    # Ein Noppen ist 4.8 mm, das Rastermass ist 8 mm
    durchmesser = noppengroesse / 8 * 4.8
    offset_y = noppengroesse * 0.2
    top = ellipse(durchmesser, durchmesser, farbe)
    schatten_dunkel = ellipse(durchmesser, durchmesser, rgb_farbe(0, 0, 0, 0.5))
    schatten_hell = ellipse(durchmesser, durchmesser, rgb_farbe(255, 255, 255, 0.5))
    schatten_y = rechteck(1, offset_y, transparent)
    return ueberlagere(
        ueberlagere(
            top,
            ueberlagere(
                ueber(schatten_hell, schatten_y),
                ueber(schatten_y, schatten_dunkel)
            )
        ),
        grund
    )

def ueber_mehrere(grafik: Grafik, anzahl: int) -> Grafik:
    resultat = leere_grafik()
    for _ in range(anzahl):
        resultat = ueber(resultat, grafik)
    return resultat

def fussgaengerstreifen(noppengroesse: float) -> Grafik:
    streifen = rechteck(noppengroesse * 4, noppengroesse, FUSSGAENGERSTREIFEN)
    luecke = rechteck(1, noppengroesse, transparent)
    # 9 Streifen, 8 Lücken
    return ueber(ueber_mehrere(ueber(streifen, luecke), 8), streifen)

    
def noppen(noppengroesse: float, farbe: Farbe) -> Grafik:
    grund = quadrat(noppengroesse, transparent)
    # Ein Noppen ist 4.8 mm, das Rastermass ist 8 mm
    durchmesser = noppengroesse / 8 * 4.8
    schatten_durchmesser = durchmesser * 1.3
    top = ellipse(durchmesser, durchmesser, farbe)
    schatten = ellipse(schatten_durchmesser, schatten_durchmesser, rgb_farbe(0, 0, 0, 0.375))
    return ueberlagere(
        ueberlagere(
            top,
            schatten
        ),
        grund
    ) if ZEICHNE_NOPPEN else grund

def kombiniere_grafiken_unten_links(grafiken: list[Grafik]) -> Grafik:
    resultat = leere_grafik()
    for grafik in grafiken:
        resultat = kombiniere(resultat, fixiere(unten_links, grafik))
    return resultat

def rand(noppengroesse: float, breite: int, hoehe: int) -> Grafik:
    plattenbreite = noppengroesse * breite
    plattenhoehe = noppengroesse * hoehe
    randgroesse = noppengroesse / 10
    farbe = rgb_farbe(0, 0, 0, 0.125)
    h = rechteck(plattenbreite - 2 * randgroesse, randgroesse, farbe)
    v = rechteck(randgroesse, plattenhoehe - 2 * randgroesse, farbe)
    e = quadrat(randgroesse, farbe)
    m = rechteck(plattenbreite - 2 * randgroesse, plattenhoehe - 2 * randgroesse, transparent)
    return ueber(
        ueber(
            neben(neben(e, h), e),
            neben(neben(v, m), v)
        ),
        neben(neben(e, h), e)
    ) if ZEICHNE_RAND else leere_grafik()

def basis_noppen(noppengroesse: float, breite: int, hoehe: int, farbe: Farbe) -> Grafik:
    flaeche = leere_grafik()
    for r in range(hoehe):
        reihe = leere_grafik()
        for c in range(breite):
            reihe = neben(reihe, noppen(noppengroesse, farbe))
        flaeche = ueber(flaeche, reihe)
    return flaeche

def basisplatte(noppengroesse: float, breite: int, hoehe: int, farbe: Farbe) -> Grafik:
    return ueberlagere(
        rand(noppengroesse, breite, hoehe),
        ueberlagere(
            basis_noppen(noppengroesse, breite, hoehe, farbe),
            rechteck(noppengroesse * breite, noppengroesse * hoehe, farbe)
        )
    )

def gerade(noppengroesse: float) -> Grafik:
    plattengroesse = noppengroesse * 32
    streifenbreite = noppengroesse * 0.5
    rasen = ueberlagere(
        basis_noppen(noppengroesse, 32, 32, RASEN),
        quadrat(plattengroesse, RASEN)
    )
    mittelstreifen = rechteck(plattengroesse, streifenbreite, MITTELSTREIFEN)
    randstreifen = rechteck(plattengroesse, streifenbreite, RANDSTREIFEN)
    strassenbelag = rechteck(plattengroesse, noppengroesse * 20, STRASSE)
    luecke = rechteck(plattengroesse, noppengroesse * 18, transparent)
    randstreifenpaar = ueber(randstreifen, ueber(luecke, randstreifen))
    strasse = ueberlagere(mittelstreifen, ueberlagere(randstreifenpaar, strassenbelag))
    return ueberlagere(
        rand(noppengroesse, 32, 32), 
        ueberlagere(strasse, rasen)
    )

# Anzahl Noppen in the Rasenfläche links und rechts der Strasse
# für eine Kurve von unten nach rechts.
KURVEN_NOPPEN = [
    (6, 6),
    (5, 6),
    (5, 6),
    (4, 6),
    (3, 6),
    (1, 6),
    (0, 6),
    (0, 7),
    (0, 7),
    (0, 7),
    (0, 8),
    (0, 8),
    (0, 9),
    (0, 9),
    (0, 10),
    (0, 11),
    (0, 11),
    (0, 12),
    (0, 13),
    (0, 14),
    (0, 15),
    (0, 17),
    (0, 18),
    (0, 20),
    (0, 22),
    (0, 25),
    (0, 32),
    (0, 32),
    (0, 32),
    (0, 32),
    (0, 32),
    (0, 32),
]

def kurven_noppen(noppengroesse: float) -> Grafik:
    n = noppen(noppengroesse, RASEN)
    t = quadrat(noppengroesse, transparent)
    board = leere_grafik()
    for r in range(32):
        (vorher, nachher) = KURVEN_NOPPEN[r]
        row = leere_grafik()
        for c in range(32):
            row = neben(row, n if c < vorher or c >= 32 - nachher else t)
        board = ueber(board, row)
    return board

def kurve(noppengroesse: float) -> Grafik:
    streifenbreite = noppengroesse * 0.5
    plattengroesse = noppengroesse * 32
    kombiniert = kombiniere_grafiken_unten_links([
        kurven_noppen(noppengroesse),
        kreis_sektor(noppengroesse * 6, 90, RASEN),
        kreis_sektor(noppengroesse * (6 + 1) - streifenbreite, 90, STRASSE),
        kreis_sektor(noppengroesse * (6 + 1), 90, RANDSTREIFEN),
        kreis_sektor(noppengroesse * (6 + 10) - streifenbreite / 2, 90, STRASSE),
        kreis_sektor(noppengroesse * (6 + 10) + streifenbreite / 2, 90, MITTELSTREIFEN),
        kreis_sektor(noppengroesse * (6 + 19), 90, STRASSE),
        kreis_sektor(noppengroesse * (6 + 19) + streifenbreite, 90, RANDSTREIFEN),
        kreis_sektor(noppengroesse * (6 + 20), 90, STRASSE),
        quadrat(plattengroesse, RASEN),
    ])
    return ueberlagere(rand(noppengroesse, 32, 32), kombiniert)

def obere_linke_ecke(noppengroesse: float) -> Grafik:
    streifenbreite = noppengroesse * 0.5
    return kombiniere_grafiken_unten_links([
        basis_noppen(noppengroesse, 6, 6, RASEN),
        quadrat(noppengroesse * 6, RASEN),
        quadrat(noppengroesse * (6 + 1) - streifenbreite, STRASSE),
        quadrat(noppengroesse * (6 + 1), RANDSTREIFEN),
        quadrat(noppengroesse * 16, STRASSE),
    ])

def kreuzung(noppengroesse: float) -> Grafik:
    ecke = obere_linke_ecke(noppengroesse)
    ecken = ueber(
        neben(drehe(270, ecke), drehe(180, ecke)),
        neben(drehe(0, ecke), drehe(90, ecke))
    )
    streifen = fussgaengerstreifen(noppengroesse)
    luecke = rechteck(noppengroesse * 22, 1, transparent)
    zwei_streifen = neben(neben(streifen, luecke), streifen)
    vier_streifen = ueberlagere(zwei_streifen, drehe(90, zwei_streifen))
    return ueberlagere(
        rand(noppengroesse, 32, 32), 
        ueberlagere(vier_streifen, ecken)
    )

def untere_haelfte(noppengroesse: float) -> Grafik:
    plattengroesse = noppengroesse * 32
    streifenbreite = noppengroesse * 0.5
    return drehe(180, kombiniere_grafiken_unten_links([
        basis_noppen(noppengroesse, 32, 6, RASEN),
        rechteck(plattengroesse, noppengroesse * 6, RASEN),
        rechteck(plattengroesse, noppengroesse * (6 + 1) - streifenbreite, STRASSE),
        rechteck(plattengroesse, noppengroesse * (6 + 1), RANDSTREIFEN),
        rechteck(plattengroesse, noppengroesse * 16, STRASSE),
    ]))

def abzweigung(noppengroesse: float) -> Grafik:
    plattengroesse = noppengroesse * 32
    streifenbreite = noppengroesse * 0.5
    ecke = obere_linke_ecke(noppengroesse)
    unten = neben(drehe(0, ecke), drehe(90, ecke))
    oben = untere_haelfte(noppengroesse)
    grund = ueber(oben, unten)
    mittelstreifen = rechteck(plattengroesse, streifenbreite, MITTELSTREIFEN)
    streifen = fussgaengerstreifen(noppengroesse)
    luecke = rechteck(noppengroesse * (22 + 4), 1, transparent)
    streifen_plus_luecke = drehe(90, neben(streifen, luecke))
    return ueberlagere(
        rand(noppengroesse, 32, 32), 
        ueberlagere(streifen_plus_luecke, ueberlagere(mittelstreifen, grund))
    )

MAP = {
    '-': lambda n: gerade(n),
    '|': lambda n: drehe(90, gerade(n)),
    '+': lambda n: kreuzung(n),
    'J': lambda n: drehe(270, kurve(n)),
    'L': lambda n: drehe(180, kurve(n)),
    'P': lambda n: drehe(90, kurve(n)),
    '7': lambda n: drehe(0, kurve(n)),
    'v': lambda n: abzweigung(n),
    '^': lambda n: drehe(180, abzweigung(n)),
    '}': lambda n: drehe(90, abzweigung(n)),
    '{': lambda n: drehe(270, abzweigung(n)),
    ' ': lambda n: basisplatte(n, 32, 32, RASEN),
    '.': lambda n: basisplatte(n, 32, 32, BASIS_GRAU),
}

def strasse(spezifikation: str, noppengroesse: float) -> Grafik:
    board = leere_grafik()
    for line in spezifikation.splitlines():
        row = leere_grafik()
        for c in line:
            row = neben(row, MAP[c](noppengroesse))
        board = ueber(board, row)
    return board

NOPPENGROESSE = 5

strassensystem = strasse(
"""
 Pvv-7
P^+{ |
|.|}-J
L-^J  
""", NOPPENGROESSE)
zeige_grafik(strassensystem)

speichere_grafik("x-strasse-gerade.png", gerade(NOPPENGROESSE))
speichere_grafik("x-strasse-kurve.png", kurve(NOPPENGROESSE))
speichere_grafik("x-strasse-abzweigung.png", abzweigung(NOPPENGROESSE))
speichere_grafik("x-strasse-kreuzung.png", kreuzung(NOPPENGROESSE))
speichere_grafik("x-strasse-basisplatte.png", basisplatte(NOPPENGROESSE, 32, 32, RASEN))

speichere_grafik("x-strassensystem.png", strassensystem)
