import os

from configurations.wsgi import get_wsgi_application
from whitenoise.django import DjangoWhiteNoise

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "edwin.settings")
os.environ.setdefault("DJANGO_CONFIGURATION", "Base")

application = DjangoWhiteNoise(get_wsgi_application())
