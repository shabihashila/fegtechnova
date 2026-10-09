from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import os
source=Path(os.environ['TEMP'])/'fegn-navigation-review'
dest=Path('docs');dest.mkdir(exist_ok=True)
for theme in ['light','dark']:
    desktop=Image.open(source/f'navigation-final-1440-{theme}.png').convert('RGB')
    mobile=Image.open(source/f'navigation-final-390-{theme}.png').convert('RGB')
    desktop.save(dest/f'navigation-desktop-{theme}.jpg',quality=90,optimize=True)
    mobile.save(dest/f'navigation-mobile-{theme}.jpg',quality=90,optimize=True)
print('Saved four navigation previews to docs/.')
