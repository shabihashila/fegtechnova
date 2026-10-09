"""Create review sheets from the localhost browser captures."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import os
source=Path(os.environ['TEMP'])/'fegn-portfolio-review'
target=Path('docs');target.mkdir(exist_ok=True)
groups={'website':['website','domain-hosting','web-design','ecommerce','shopify'],'marketing':['whatsapp-marketing','email-marketing','sms-voice-marketing','seo','telemarketing','social-media-management','paid-advertising','2d-3d-animation','business-profile','graphic-design','corporate-video','contact']}
for group,slugs in groups.items():
    for width in [1440,390]:
        cols=4 if group=='marketing' else 3
        cellw=400 if width==1440 else 260
        cellh=350 if width==1440 else 740
        rows=(len(slugs)+cols-1)//cols
        sheet=Image.new('RGB',(cols*cellw,rows*cellh),'#e7edf5');draw=ImageDraw.Draw(sheet)
        for index,slug in enumerate(slugs):
            img=Image.open(source/f'{slug}-{width}.png');x=index%cols*cellw;y=index//cols*cellh
            crop=img.crop((0,0,img.width,min(img.height,1080 if width==1440 else 1100)))
            draw.text((x+8,y+8),slug,fill='#123455');thumb=ImageOps.contain(crop,(cellw-16,cellh-40));sheet.paste(thumb,(x+8,y+30))
        sheet.save(target/f'{group}-preview-{width}.jpg',quality=90,optimize=True)
for width in [1440,390]:
    Image.open(source/f'contact-{width}.png').convert('RGB').save(target/f'contact-preview-{width}.jpg',quality=90,optimize=True)
print('Saved Website, Marketing and Contact previews.')
