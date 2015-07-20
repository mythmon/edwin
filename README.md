# Summary

Edwin is a bug management system.

* **source** https://github.com/mythmon/edwin
* **issues** https://github.com/mythmon/edwin/issues
* **license** MPLv2
* **author** League of Assassins
* **status** [![Build Status](https://travis-ci.org/mythmon/edwin.svg?branch=master)](https://travis-ci.org/mythmon/edwin)


# Requirements

1. Python 3.4
2. npm
3. a monkey with a banana


# Install for hacking

1. create a virtual environment
2. run `pip install -r requirements.txt`
3. run `./manage.py migrate`
4. run `npm install`

> **Note**
>
> You'll be using the `Dev` configuration by default. Make sure to change this
> for deployments by setting the DJANGO_CONFIGURATION environment variable.


# Run tests

## Python tests

1. run `./manage.py test` to run tests for the backend.

## JS tests

1. run `npm test` to run Jest tests for frontend code.


# Deployments

Edwin is designed to be deployed on Heroku using the multi-buildpack.

## Environment Variables

For deployments, a few environment variables should be set.

* `DJANGO_CONFIGURATION` - This should be set to `Base` for most production
  deployments.
* `DJANGO_SECRET_KEY` - This should be a long random string.
* `DJANGO_ALLOWED_HOSTS` - This should be the hostname (and only the hostname)
  the deployment can be reached at. It may be multiple values separated by
  commas. Example: `edwin-dev.herokuapp.com,edwin.example.com`.
* `DJANGO_DATABASES` - This should be set to a DB URL for your database.
  Example: `sqlite://` for an in-memory sqlite storage. Heroku sets this
  automatically.

# Usage

## Creating a super user account

You need a super user account to log into the admin. Run:

    ./manage.py createsuperuser

and answer the questions.


## Creating and editing teams

1. Go to the admin `https://HOST/admin`.
1. Log in as the superuser.
1. Click on `Teams`.

You can create, edit and delete teams here.
