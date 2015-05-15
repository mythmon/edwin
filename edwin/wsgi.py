import os

# These need to be set before we start pulling in Django things.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "edwin.settings")
os.environ.setdefault("DJANGO_CONFIGURATION", "Base")

from configurations.wsgi import get_wsgi_application
from whitenoise.django import DjangoWhiteNoise

application = DjangoWhiteNoise(get_wsgi_application())
