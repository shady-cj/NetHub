from django.forms import model_to_dict
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Model
import base64
import io
import os
import uuid
from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile


class ExtendedEncoder(DjangoJSONEncoder):

    def default(self, o):

        if isinstance(o, Model):
            return model_to_dict(o)

        return super().default(o)


class ConvertB64ToImage:
    def __init__(self,data,user):
        self.data = data
        self.user = user


    def ProcessImage(self):
        
        try:
            
            data = base64.b64decode(self.data + '==')
            buf = io.BytesIO(data)
            img = Image.open(buf)
            img_io = io.BytesIO()
            img.save(img_io, format='PNG')
            if (self.user.profile_picture.path.split("\\")[-1] != 'default.png'):
                os.remove(self.user.profile_picture.path)
            print(self.user.profile_picture.path.split("\\")[-1])   
            print(self.user.profile_picture)
            pic_name =f'{self.user.username}-{uuid.uuid4()}'
            self.user.profile_picture = InMemoryUploadedFile(img_io, field_name=None, name=pic_name+".png", content_type='image/png', size=img_io.tell, charset=None)
            self.user.save()
            return self.user.profile_picture
        except Exception as e:
            print(e)
            return None 

        
