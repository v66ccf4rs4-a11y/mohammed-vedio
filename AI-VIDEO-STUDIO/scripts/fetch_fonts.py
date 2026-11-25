"""Download free OFL-licensed Arabic fonts from the official Google Fonts repository.

Usage: python fetch_fonts.py [dest_dir]
Fonts already present are skipped (never overwritten).
"""
import sys
import urllib.parse
import urllib.request
from pathlib import Path

BASE = "https://raw.githubusercontent.com/google/fonts/main/ofl/"
FONTS = {
    "arefruqaa": ["ArefRuqaa-Regular.ttf", "ArefRuqaa-Bold.ttf"],
    "arefruqaaink": ["ArefRuqaaInk-Regular.ttf", "ArefRuqaaInk-Bold.ttf"],
    "amiri": ["Amiri-Regular.ttf", "Amiri-Bold.ttf", "Amiri-Italic.ttf"],
    "cairo": ["Cairo[slnt,wght].ttf"],
    "tajawal": ["Tajawal-Regular.ttf", "Tajawal-Bold.ttf", "Tajawal-ExtraBold.ttf"],
    "notonaskharabic": ["NotoNaskhArabic[wght].ttf"],
    "notosansarabic": ["NotoSansArabic[wdth,wght].ttf"],
    "reemkufi": ["ReemKufi[wght].ttf"],
    "ibmplexsansarabic": ["IBMPlexSansArabic-Regular.ttf", "IBMPlexSansArabic-Bold.ttf"],
}


def main(dest: Path) -> int:
    dest.mkdir(parents=True, exist_ok=True)
    failed = 0
    for family, files in FONTS.items():
        for name in files:
            out = dest / name.replace("[", "-").replace("]", "").replace(",", "-")
            if out.exists() and out.stat().st_size > 0:
                print(f"  skip  {out.name}")
                continue
            url = BASE + family + "/" + urllib.parse.quote(name)
            try:
                with urllib.request.urlopen(url, timeout=60) as r:
                    out.write_bytes(r.read())
                print(f"  ok    {out.name}")
            except Exception as e:  # noqa: BLE001
                failed += 1
                print(f"  FAIL  {name}: {e}")
        lic = dest / f"OFL-{family}.txt"
        if not lic.exists():
            try:
                with urllib.request.urlopen(BASE + family + "/OFL.txt", timeout=60) as r:
                    lic.write_bytes(r.read())
            except Exception:  # noqa: BLE001
                pass
    return failed


if __name__ == "__main__":
    d = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1] / "fonts"
    sys.exit(1 if main(d) else 0)
