from pytamaro.de import (
    Grafik, hsl_farbe, ellipse, fixiere, drehe, zeige_grafik, mitte_links, speichere_grafik
)

def blatt(laenge: float, winkel: float) -> Grafik:
    return drehe(winkel, fixiere(mitte_links, ellipse(laenge, laenge / 2, hsl_farbe(winkel, 1, 0.5, 0.1))))

# rotes Blatt (Winkel = Farbton = 0)
zeige_grafik(blatt(200, 0))
from pytamaro.de import Grafik, weiss, hsl_farbe, ellipse, fixiere, drehe, kombiniere, zeige_grafik, leere_grafik

def blume(radius: float) -> Grafik:
    komposition = leere_grafik()
    for winkel in range(0, 360, 1):
        komposition = kombiniere(blatt(radius, winkel), komposition)
    return komposition

speichere_grafik("blume.svg", blume(200))
speichere_grafik("blume.png", blume(200)) 