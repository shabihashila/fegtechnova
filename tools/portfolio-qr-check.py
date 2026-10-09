"""Decode the official asset and browser QR crops (zxing-cpp + Pillow)."""
from pathlib import Path
import os,sys,hashlib,json
from PIL import Image
sys.path.insert(0,str(Path(os.environ['TEMP'])/'fegn-qr-tools'))
import zxingcpp
source=Path(r'C:\Users\HP\Downloads\QR Codes of All Companies\QR Codes of All Companies\FEG TechNova\qr-code.png')
copy=Path('wp-content/themes/extendable-child/assets/images/feg-technova-official-qr.png')
assert hashlib.sha256(source.read_bytes()).digest()==hashlib.sha256(copy.read_bytes()).digest()
review=Path(os.environ['TEMP'])/'fegn-portfolio-review'
results=[]
for file in [copy,*sorted(review.glob('qr-*.png'))]:
    decoded=zxingcpp.read_barcodes(Image.open(file))
    assert len(decoded)==1 and decoded[0].text=='https://linktr.ee/fegtechnova',str(file)
    results.append({'file':str(file),'destination':decoded[0].text,'size':Image.open(file).size})
assert len(results)>=5,'Run browser QA to produce all responsive QR crops first.'
(review/'qr-results.json').write_text(json.dumps(results,indent=2))
print(json.dumps({'decoded':len(results),'destination':'https://linktr.ee/fegtechnova','source_preserved':True},indent=2))
