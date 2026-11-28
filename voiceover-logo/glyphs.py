import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
import os
F=os.path.join(os.path.dirname(os.path.abspath(__file__)),'fonts')+'/'  # Alexandria + Montserrat, SIL OFL (Google Fonts)
_c={}
def _load(font):
    if font not in _c:
        blob=hb.Blob.from_file_path(F+font); tt=TTFont(F+font); _c[font]=(hb.Font(hb.Face(blob)),tt)
    return _c[font]
def text_path(txt,font,size,features=None,tracking=0):
    hf,tt=_load(font); buf=hb.Buffer(); buf.add_str(txt); buf.guess_segment_properties(); hb.shape(hf,buf,features or {})
    gs=tt.getGlyphSet(); order=tt.getGlyphOrder(); s=size/tt['head'].unitsPerEm
    sp=SVGPathPen(gs); bp=BoundsPen(gs); x=0
    for info,pos in zip(buf.glyph_infos,buf.glyph_positions):
        g=order[info.codepoint]; m=(s,0,0,-s,(x+pos.x_offset)*s,-pos.y_offset*s)
        gs[g].draw(TransformPen(sp,m)); gs[g].draw(TransformPen(bp,m)); x+=pos.x_advance+tracking*tt['head'].unitsPerEm
    return sp.getCommands(), bp.bounds
def place(txt,font,size,x,y,anchor='end',fill='#000',**kw):
    d,(x0,y0,x1,y1)=text_path(txt,font,size,**kw)
    dx={'end':x-x1,'start':x-x0,'middle':x-(x0+x1)/2}[anchor]
    return f'<path transform="translate({dx:.2f},{y:.2f})" fill="{fill}" d="{d}"/>',(x0+dx,y0+y,x1+dx,y1+y)
