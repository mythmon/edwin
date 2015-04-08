import os

from configurations import Configuration
from configurations import values

from edwin import bundles


def path(*components):
    root = os.path.dirname(os.path.dirname(__file__))
    return os.path.abspath(os.path.join(root, *components))


class ConstantSettings(Configuration):
    """
    These settings are unlikely to need changing in an environment.

    These are more like constants that make the app work. They may change as
    the app is developed, but they likely should not be overridden by the
    environment.
    """

    INSTALLED_APPS = [
        'django.contrib.admin',
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.messages',
        'django.contrib.staticfiles',

        'rest_framework',
        'pipeline',

        'edwin.teams',
        'edwin.client',
    ]

    MIDDLEWARE_CLASSES = [
        'django.contrib.sessions.middleware.SessionMiddleware',
        'django.middleware.common.CommonMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware',
        'django.middleware.clickjacking.XFrameOptionsMiddleware',
        'django.middleware.security.SecurityMiddleware',
    ]

    STATICFILES_DIRS = [
        path('node_modules'),
    ]

    STATICFILES_FINDERS = [
        'django.contrib.staticfiles.finders.FileSystemFinder',
        'django.contrib.staticfiles.finders.AppDirectoriesFinder',
        'pipeline.finders.PipelineFinder',
    ]


    ROOT_URLCONF = 'edwin.urls'
    USE_TZ = True
    USE_L10N = False

    PIPELINE_COMPILERS = [
        'pipeline.compilers.less.LessCompiler',
        'edwin.lib.pipeline_compilers.BrowserifyCompiler',
    ]
    PIPELINE_CSS = bundles.PIPELINE_CSS
    PIPELINE_JS = bundles.PIPELINE_JS
    PIPELINE_DISABLE_WRAPPER = True
    PIPELINE_JS_COMPRESSOR = 'pipeline.compressors.uglifyjs.UglifyJSCompressor'
    PIPELINE_UGLIFYJS_BINARY = path('node_modules/.bin/uglifyjs')
    PIPELINE_CSS_COMPRESSOR = 'pipeline.compressors.cssmin.CSSMinCompressor'
    PIPELINE_CSSMIN_BINARY = path('node_modules/.bin/cssmin')
    PIPELINE_LESS_BINARY = path('node_modules/.bin/lessc')
    PIPELINE_BROWSERIFY_BINARY = path('node_modules/.bin/browserify')
    PIPELINE_BROWSERIFY_ARGUMENTS = '-t babelify'


class Base(ConstantSettings):
    """
    These settings will likely need to be customized to an environment.
    """
    DEBUG = values.BooleanValue(False)
    DATABASES = values.DatabaseURLValue('sqlite:///db.sqlite')
    SECRET_KEY = values.SecretValue()
    SECRET_KEY = 'not a secret'
    TIME_ZONE = values.Value('UTC')
    LANGUAGE_CODE = values.Value('en-us')
    STATIC_URL = values.Value('/static/')
    STATIC_ROOT = values.Value(path('static'))
    STATICFILES_STORAGE = 'pipeline.storage.PipelineCachedStorage'


class Dev(Base):
    DEBUG = True
    SECRET_KEY = 'not a secret'
