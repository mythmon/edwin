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
3. run `DJANGO_CONFIGURATION=Dev ./manage.py migrate`
4. run `npm install`

> **Note**
>
> You'll be using the `Dev` configuration, so you'll want to set:
>
> ```
> DJANGO_CONFIGURATION=Dev
> ```
>
> in your environment.


# Run tests

## Python tests

1. run `DJANGO_CONFIGURATION=Dev ./manage.py test` to run tests for the backend.

## JS tests

1. run `npm test` to run Jest tests for frontend code.


# Deployments

Edwin is designed to be deployed with [Heroku Docker][].
This section assumes you have Heroku set up already.

To install set up the Heroku Docker tools, run `heroku plugins:install heroku-docker`.

To run in a Heroku-like environment locally, run `heroku docker:start`.

To deploy to Heroku using docker, run `heroku docker:release`.

[Heroku Docker]: https://devcenter.heroku.com/articles/introduction-local-development-with-docker
