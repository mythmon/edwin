# This is Dockerfile designed to be run as a part of Heroku's new Docker
# infrastructure. By itself it won't do much. It relies on the Procfile in the
# repo and some extra machinery provided by Heroku.
# See here for more details: https://devcenter.heroku.com/articles/introduction-local-development-with-docker

FROM heroku/cedar:14

# Bootstrap
RUN useradd -d /app -m app
USER app
WORKDIR /app

# Set up environment
ENV HOME /app
ENV NODE_ENGINE 0.12.2
ENV PYTHON_VERSION 3.4.3
ENV PORT 3000
ENV LANG en_US.UTF-8
ENV LC_ALL en_US.UTF-8

RUN mkdir -p /app/src

# Install Node
RUN mkdir -p /app/.heroku/node
RUN curl -s https://s3pository.heroku.com/node/v$NODE_ENGINE/node-v$NODE_ENGINE-linux-x64.tar.gz | tar --strip-components=1 -xz -C /app/.heroku/node
ENV PATH /app/.heroku/node/bin:$PATH

# Install Python, and make a virtualenv so we have Pip
RUN mkdir -p /app/.heroku/python
RUN mkdir -p /app/.heroku/python-venv/bin
RUN curl -s https://lang-python.s3.amazonaws.com/cedar-14/runtimes/python-$PYTHON_VERSION.tar.gz | tar -xz -C /app/.heroku/python
ENV LD_LIBRARY_PATH /app/.heroku/python/lib:$LD_LIBRARY_PATH
ENV PATH /app/.heroku/python/bin:$PATH
RUN pyvenv /app/.heroku/python-venv
ENV PATH /app/.heroku/python-venv/bin:$PATH

# Set up PATH in the profile
RUN echo "export PATH=\"/app/.heroku/node/bin:/app/bin:/app/src/node_modules/.bin:\$PATH\"" >> /app/.profile
RUN echo "export PATH=\"/app/.heroku/python-venv/bin:/app/.heroku/python/bin:/app/.heroku/node/bin:/app/bin:\$PATH\"" >> /app/.profile
RUN echo "export PATH=\"/app/bin:$PATH\"" >> /app/.profile
RUN echo "cd /app/src" >> /app/.profile
RUN echo "export LD_LIBRARY_PATH=/app/.heroku/python/lib:$LD_LIBRARY_PATH" >> /app/.profile

WORKDIR /app/src
EXPOSE 3000

# Copy app filers
ONBUILD COPY . /app/src

# chown all app files to "app" user. Copy always copies as UID 0 (aka root)
ONBUILD USER root
ONBUILD RUN chown -R app:app /app/src
ONBUILD USER app

# Remove non-tracked files from the repo.
ONBUILD RUN git clean -fXd

# Install dependencies
ONBUILD RUN npm install
ONBUILD RUN pip install -r requirements.txt

# Compile static assets
ONBUILD RUN DJANGO_CONFIGURATION=Build ./manage.py collectstatic --noinput
