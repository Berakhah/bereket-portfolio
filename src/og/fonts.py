"""Restore the Newsreader upright variable face from git history, instance it
to wght 500 (opsz axis kept) and subset to Latin. Writes
site/assets/fonts/newsreader-normal-500.woff2. Run: python src/og/fonts.py"""
import subprocess, tempfile
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "site" / "assets" / "fonts" / "newsreader-normal-500.woff2"
BLOB = "44f0c6a^:site/assets/fonts/newsreader-normal-400-700.woff2"

with tempfile.TemporaryDirectory() as td:
    src = Path(td) / "nr.woff2"
    src.write_bytes(subprocess.check_output(["git", "show", BLOB], cwd=ROOT))
    f = TTFont(src)
    f = instancer.instantiateVariableFont(f, {"wght": 500})
    opts = subset.Options(flavor="woff2", layout_features=["kern", "liga", "onum", "pnum", "tnum"])
    opts.unicodes = subset.parse_unicodes("U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD")
    s = subset.Subsetter(opts)
    s.populate(unicodes=opts.unicodes)
    s.subset(f)
    f.flavor = "woff2"
    f.save(OUT)
print("wrote", OUT, OUT.stat().st_size, "bytes")
