from ScheduleBrewer.settings.base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = [
    "ec2-54-83-17-12.compute-1.amazonaws.com",
    "54.83.17.12",
    "schedulebrewer.ml",
    "www.schedulebrewer.ml",
]

# CORS_ALLOW_CREDENTIALS = True

CSRF_COOKIE_SECURE = True

SESSION_COOKIE_SECURE = True

SESSION_COOKIE_HTTPONLY = False

CSRF_TRUSTED_ORIGINS = ["vassar.onelogin.com"]

CORS_ORIGIN_WHITELIST = [
    "https://vassar.onelogin.com",
]

# CORS_REPLACE_HTTPS_REFERER = False
