# Summary

Edwin is a bug management system.

* **source** https://github.com/mythmon/edwin
* **issues** https://github.com/mythmon/edwin/issues
* **license** MPLv2
* **author** League of Assassins
* **status** [![Build Status](https://travis-ci.org/mythmon/edwin.svg?branch=master)](https://travis-ci.org/mythmon/edwin)


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
