"""Fetch reviewed stock photography and encode local website assets."""
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
from urllib.request import urlopen,Request
from io import BytesIO
import json
root=Path('wp-content/themes/extendable-child/assets/images/portfolio')
root.mkdir(exist_ok=True)
photos=[
 ('commerce',29502362,'https://www.pexels.com/photo/e-commerce-shopping-on-laptop-and-smartphone-29502362/','Julio Lopez'),
 ('film',7709678,'https://www.pexels.com/photo/video-camera-on-tripod-in-studio-7709678/','Caleb Oquendo'),
 ('motion',30004067,'https://www.pexels.com/photo/abstract-3d-blue-minimalist-art-render-30004067/','Steve A Johnson'),
 ('conversation',7709199,'https://www.pexels.com/photo/a-close-up-shot-of-a-woman-wearing-a-headset-7709199/','MART PRODUCTION'),
 ('messaging',4189445,'https://www.pexels.com/photo/person-using-cellphone-in-front-of-a-laptop-4189445/','Edwin Nava'),
 ('design',16284690,'https://www.pexels.com/photo/graphic-designer-home-office-studio-16284690/','Jakub Zerdzicki'),
 ('studio',36363138,'https://www.pexels.com/photo/modern-home-office-setup-with-dual-monitors-36363138/','Josh Sorenson'),
 ('planning',942872,'https://www.pexels.com/photo/notebook-with-blank-pages-942872/','MESSALA CIULLA'),
]
records=[]
sheet=Image.new('RGB',(1200,620),'white');draw=ImageDraw.Draw(sheet)
for i,(name,id,url,credit) in enumerate(photos):
 dest=root/f'{name}.webp'
 if not dest.exists():
  req=Request(f'https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&cs=tinysrgb&w=1600',headers={'User-Agent':'Mozilla/5.0'})
  with urlopen(req,timeout=40) as response: im=Image.open(BytesIO(response.read())).convert('RGB')
  im.thumbnail((1600,1600))
  im.save(dest,'WEBP',quality=82,method=6)
 im=Image.open(dest)
 x=(i%4)*300;y=(i//4)*310
 sheet.paste(ImageOps.fit(im,(292,270)),(x,y));draw.text((x+6,y+277),name,fill='#173c64')
 records.append({'file':f'{name}.webp','source':url,'photographer':credit,'license':'https://www.pexels.com/license/','dimensions':f'{im.width}x{im.height}','bytes':dest.stat().st_size})
 print(name,im.size,dest.stat().st_size)
(root/'sources.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8')
sheet.save('portfolio-photo-review.jpg',quality=90)
