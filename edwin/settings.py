import os

from configurations import Configuration
from configurations import values

from edwin import bundles


def path(*components):
    root = os.path.dirname(os.path.dirname(__file__))
    return os.path.abspath(os.path.join(root, *components))


class ConstantSettings(bundles.BundleConfiguration, Configuration):
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

    STATICFILES_FINDERS = [
        'django.contrib.staticfiles.finders.FileSystemFinder',
        'django.contrib.staticfiles.finders.AppDirectoriesFinder',
        'pipeline.finders.PipelineFinder',
        'npm.finders.NpmFinder',
    ]

    NPM_PREFIX_PATH = path()
    NPM_FILE_PATTERNS = {
        'flux': ['index.js', 'lib/*'],
        'immutable': ['dist/immutable.js'],
        'lodash': ['index.js'],
        'react': ['dist/react.js'],
        'font-awesome': ['css/font-awesome.css', 'fonts/*'],
    }

    ROOT_URLCONF = 'edwin.urls'
    USE_TZ = True
    USE_L10N = False

    PIPELINE_COMPILERS = [
        'pipeline.compilers.less.LessCompiler',
        'edwin.lib.pipeline_compilers.BrowserifyCompiler',
    ]
    PIPELINE_DISABLE_WRAPPER = True
    PIPELINE_JS_COMPRESSOR = 'pipeline.compressors.uglifyjs.UglifyJSCompressor'
    PIPELINE_UGLIFYJS_BINARY = path('node_modules/.bin/uglifyjs')
    PIPELINE_CSS_COMPRESSOR = 'pipeline.compressors.cssmin.CSSMinCompressor'
    PIPELINE_CSSMIN_BINARY = path('node_modules/.bin/cssmin')
    PIPELINE_LESS_BINARY = path('node_modules/.bin/lessc')
    PIPELINE_BROWSERIFY_BINARY = path('node_modules/.bin/browserify')
    PIPELINE_BROWSERIFY_ARGUMENTS = '-t babelify'

    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'verbose': {
                'format': ('%(asctime)s [%(process)d] [%(levelname)s] ' +
                           'pathname=%(pathname)s lineno=%(lineno)s ' +
                           'funcname=%(funcName)s %(message)s'),
                'datefmt': '%Y-%m-%d %H:%M:%S'
            },
        },
        'handlers': {
            'console': {
                'level': 'DEBUG',
                'class': 'logging.StreamHandler',
                'formatter': 'verbose'
            }
        },
        'loggers': {
            'django.request': {
                'handlers': ['console'],
                'level': 'INFO',
                'propagate': True,
            }
        }
    }


class Base(ConstantSettings):
    """
    These settings will likely need to be customized to an environment.
    """
    ALLOWED_HOSTS = values.ListValue(['*'])
    DEBUG = values.BooleanValue(False)
    DATABASES = values.DatabaseURLValue('sqlite:///db.sqlite')
    SECRET_KEY = values.SecretValue()
    TIME_ZONE = values.Value('UTC')
    LANGUAGE_CODE = values.Value('en-us')
    STATIC_URL = values.Value('/static/')
    STATIC_ROOT = values.Value(path('static'))
    STATICFILES_STORAGE = 'pipeline.storage.PipelineCachedStorage'


class Build(Base):
    """
    These settings are used at build time.
    """
    SECRET_KEY = 'not a secret'


class Dev(Base):
    DEBUG = True
    SECRET_KEY = 'not a secret'
    PIPELINE_BROWSERIFY_ARGUMENTS = '-t babelify -d'


class Test(Base):
    SECRET_KEY = 'not a secret'
    # Use an in-memory database
    DATABASES = values.DatabaseURLValue('sqlite://')
