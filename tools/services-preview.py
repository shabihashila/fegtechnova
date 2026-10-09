"""Build compact review sheets from the browser screenshots (Pillow required)."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import os

source=Path(os.environ['TEMP'])/'fegn-services-review'
target=Path('docs')
target.mkdir(exist_ok=True)
slugs=['saas-development','web-application-development','mobile-app-development','crm','ui-ux-design','ai-automation','ai-chatbot']
for width in [1440,390]:
 sheet=Image.new('RGB',(1600,960),'#e7edf5')
 draw=ImageDraw.Draw(sheet)
 for index,slug in enumerate(slugs):
  image=Image.open(source/f'{slug}-{width}.png')
  x=(index%4)*400;y=(index//4)*480
  crop=image.crop((0,0,image.width,min(image.height,1000 if width==1440 else 1200)))
  draw.text((x+8,y+8),slug,fill='#123455')
  thumb=ImageOps.contain(crop,(384,440))
  sheet.paste(thumb,(x+8,y+30))
 sheet.save(target/f'services-preview-{width}.jpg',quality=90,optimize=True)
print('Saved desktop and mobile service previews to docs/.')
