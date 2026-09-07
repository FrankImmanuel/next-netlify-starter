"""Trace Samuel's supplied letter specimen into a first review font.
Requires fonttools, brotli, opencv-python-headless, Pillow, numpy.
Source stays outside the public site. Coordinates use a 1344px-wide reference.
"""
import sys
from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString

HERE=Path(__file__).resolve().parent
source=Path(sys.argv[1]) if len(sys.argv)>1 else Path('/Users/sam/Desktop/handstil.jpg')
im=Image.open(source).convert('RGB')
factor=im.width/1344
arr=np.array(im.convert('L'))
# Boundaries between handwritten glyphs, in the supplied specimen.
caps=[99,140,177,210,248,289,341,394,432,462,495,532,573,621,662,694,727,763,802,835,868,904,935,976,1010,1045,1085,1125,1155,1197]
low=[108,156,196,230,273,298,339,376,407,425,460,502,527,562,596,628,663,702,737,766,801,837,865,901,933,963,1005,1044,1080,1135]
# Each glyph has a tight row band, to exclude adjoining rows and smudges.
items=[]
for c,l,r in zip('ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ',caps,caps[1:]):
 items.append((c,l,130+(l-100)*.025,r,202+(l-100)*.025,700,0))
for c,l,r in zip('abcdefghijklmnopqrstuvwxyzåäö',low,low[1:]):
 top=392+(l-100)*.022; bottom=451+(l-100)*.022
 asc=c in 'bdfhklt'; desc=c in 'gjpqy'
 height=700 if asc else 460
 if desc: height+=220
 if c in 'åäö': height=660
 if c=='i': height=640
 if c=='j':height=840
 items.append((c,l,top,r,bottom,height,220 if desc else 0))
nums=[120,158,190,231,272,308,339,374,409,438,472]
for c,l,r in zip('0123456789',nums,nums[1:]):items.append((c,l,710,r,767,680,0))
# Punctuation from first row, with explicit baseline/height appropriate to marks.
for c,l,t,r,b,h,d in [('.',128,966,151,990,65,0),(',',160,969,191,1001,155,65),(':',197,961,223,997,300,0),(';',225,962,254,1004,370,65),('!',257,947,290,1004,700,0),('?',296,949,336,1010,700,0),('–',335,978,382,996,75,-230),('-',393,978,432,996,75,-230),('(',449,956,482,1005,760,80),(')',498,956,529,1009,760,80),('/',538,957,580,1010,700,0),('&',588,953,628,1015,700,0),('+',637,960,681,1005,450,-90),('=',701,969,747,1002,210,-160),('%',751,944,816,1003,700,0),('"',828,947,862,980,200,-500),("'",884,948,919,980,200,-500)]:items.append((c,l,t,r,b,h,d))
glyphs={}; metrics={}; cmap={}; order=['.notdef','space']; atlas=[]; base_bodies={}; shared_marks={}
pen=TTGlyphPen(None);pen.moveTo((80,0));pen.lineTo((80,700));pen.lineTo((450,700));pen.lineTo((450,0));pen.closePath()
glyphs['.notdef']=pen.glyph();metrics['.notdef']=(530,80)
glyphs['space']=TTGlyphPen(None).glyph();metrics['space']=(520,0);cmap[32]='space'
for c,l,t,r,b,height,desc in items:
 if c=='F': l,t,r,b=292,263,333,299  # Third specimen row: distinct top and middle arms.
 crop=arr[round(t*factor):round(b*factor),round(l*factor):round(r*factor)]
 mask=np.uint8(crop<160)*255
 if c in 'ij':
  # These dots slant across the neighboring letter's column; isolate them explicitly.
  regions = [(417,429,428,445),(433,416,440,423)] if c=='i' else [(424,428,452,465),(458,412,465,421)]
  l=min(z[0] for z in regions);t=min(z[1] for z in regions)
  r=max(z[2] for z in regions);b=max(z[3] for z in regions)
  crop=arr[round(t*factor):round(b*factor),round(l*factor):round(r*factor)]
  mask=np.zeros_like(crop)
  for x1,y1,x2,y2 in regions:
   yy=slice(round((y1-t)*factor),round((y2-t)*factor));xx=slice(round((x1-l)*factor),round((x2-l)*factor))
   mask[yy,xx]=np.uint8(crop[yy,xx]<160)*255
 n,labels,stats,_=cv2.connectedComponentsWithStats(mask)
 keep=np.zeros_like(mask)
 # Keep detached dots and accents, reject dust.
 largest=1+int(np.argmax(stats[1:,cv2.CC_STAT_AREA]))
 main=stats[largest]
 for i in range(1,n):
  st=stats[i]
  preserve = i==largest
  if c in 'ijÅÄÖåäö':
   preserve |= st[1] + st[3] <= main[1]+main[3]*.35 and st[4] >= main[4]*.15 and st[0]+st[2]/2 >= main[0]+main[2]*.25
  if c in ':;!?%=\"':
   preserve |= st[4] >= main[4]*.13
  if preserve:keep[labels==i]=255
 if c in 'AOao':
  yy,xx=np.where(keep)
  base_bodies[c]=keep[yy.min():yy.max()+1,xx.min():xx.max()+1].copy()
 if c in 'ijÅÄÖåäö':
  # Normalize the body independently: accents must not shrink a/o or the i stem.
  body=np.uint8(labels==largest)*255
  marks=keep.copy();marks[labels==largest]=0
  by,bx=np.where(body);my,mx=np.where(marks)
  if len(mx):
   body=body[by.min():by.max()+1,bx.min():bx.max()+1]
   marks=marks[my.min():my.max()+1,mx.min():mx.max()+1]
   if c in 'Öö': body=base_bodies['O' if c=='Ö' else 'o'].copy()
   if c in 'ÄÖ': shared_marks[c]=marks.copy()
   if c in 'äö': marks=shared_marks[c.upper()].copy()
   target=70 if c.isupper() else (68 if c=='j' else 46)
   bw=round(body.shape[1]*target/body.shape[0]);mh=11 if c in 'ij' else 18
   mw=round(marks.shape[1]*mh/marks.shape[0])
   # Follow the rightward slant above the body rather than its bounding-box centre.
   ax=max(0,bw//2-mw//2+(23 if c=='j' else (19 if c=='Å' else 14)))
   w=max(bw,ax+mw)+8
   canvas=np.zeros((target+mh+8,w),dtype=np.uint8)
   canvas[mh+8:,:bw]=cv2.resize(body,(bw,target))
   accent=cv2.resize(marks,(mw,mh))
   if c in 'ijÅÄÖäö':
    accent=cv2.dilate(accent,np.ones((2,2),dtype=np.uint8))
   canvas[:mh,ax:ax+mw]=accent
   keep=np.uint8(canvas>127)*255
   height=(target+mh+8)*10
 ys,xs=np.where(keep)
 if not len(xs):raise ValueError(f'Empty glyph {c}')
 keep=keep[ys.min():ys.max()+1,xs.min():xs.max()+1]
 h,w=keep.shape
 scale=height/h
 # Consistent sidebearings leave the specimen's slant intact.
 bearing=65
 contours,hierarchy=cv2.findContours(keep,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)
 pen=TTGlyphPen(None)
 for contour in contours:
  points=cv2.approxPolyDP(contour,.55*factor,True).reshape(-1,2)
  if len(points)<3:continue
  transformed=[(round(bearing+x*scale),round((h-1-y)*scale-desc)) for x,y in points]
  pen.moveTo(transformed[0])
  for point in transformed[1:]:pen.lineTo(point)
  pen.closePath()
 name=f'uni{ord(c):04X}';order.append(name);cmap[ord(c)]=name;glyphs[name]=pen.glyph();metrics[name]=(round(w*scale)+130,bearing)
 atlas.append((c,Image.fromarray(255-keep)))
for dest,src in [('’',"'"),('‘',"'"),('“','"'),('”','"'),('—','–'),('\u00a0',' ')]:cmap[ord(dest)]=cmap[ord(src)]
fb=FontBuilder(1000,isTTF=True);fb.setupGlyphOrder(order);fb.setupCharacterMap(cmap);fb.setupGlyf(glyphs);fb.setupHorizontalMetrics(metrics);fb.setupHorizontalHeader(ascent=1000,descent=-300)
fb.setupNameTable({'familyName':'Snabb Hand','styleName':'Regular','uniqueFontIdentifier':'SnabbHand-Review-0.5','fullName':'Snabb Hand Regular','psName':'SnabbHand-Regular','version':'Version 0.5; word spacing and da kerning','copyright':'Handwriting by Samuel Sjöblom. Private snabb.studio review.'})
fb.setupOS2(sTypoAscender=1000,sTypoDescender=-300,sTypoLineGap=0,usWinAscent=1000,usWinDescent=300,sxHeight=460,sCapHeight=700)
fb.setupPost();fb.setupMaxp()
addOpenTypeFeaturesFromString(fb.font, 'feature kern { pos uni0064 uni0061 -110; } kern;')
fb.save(HERE/'SnabbHand-Regular.ttf')
font=TTFont(HERE/'SnabbHand-Regular.ttf');font.flavor='woff2';font.save(HERE/'SnabbHand-Regular.woff2')
sheet=Image.new('RGB',(1400,1100),'#f0f0ec');d=ImageDraw.Draw(sheet)
for x in range(20,1400,24):
 for y in range(20,1100,24):d.ellipse((x,y,x+1,y+1),fill='#ced0c9')
for y,size,s in [(70,64,'snabb.studio'),(180,50,'Morgonpromenad'),(275,50,'Personen gör bilden'),(370,50,'Färg, ljus och vanliga dagar.'),(470,35,'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ'),(545,42,'abcdefghijklmnopqrstuvwxyzåäö'),(630,42,'0123456789  . , : ; ! ? – ( ) / & + = %'),(745,48,'Photographs     Series     About'),(850,40,'View older photographs'),(950,42,'Återblick. Ögonblick. Små berättelser.')]:
 d.text((65,y),s,font=ImageFont.truetype(str(HERE/'SnabbHand-Regular.ttf'),size),fill='#383a35')
sheet.save(HERE/'specimen.png')
# Labeled extracted glyph sheet for visual QA.
sheet=Image.new('RGB',(1200,((len(atlas)+11)//12)*120),'white');d=ImageDraw.Draw(sheet)
for i,(c,img) in enumerate(atlas):
 x=(i%12)*100;y=(i//12)*120;img.thumbnail((75,80));sheet.paste(img,(x+10,y+25));d.text((x+10,y+4),c,fill='red')
sheet.save(HERE/'glyph-review.png')
print(f'{len(cmap)} mapped characters; TTF, WOFF2 and review sheets saved in {HERE}')
