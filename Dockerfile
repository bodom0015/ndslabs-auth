#
# Build: docker build -t ndslabs/login-ui .
#
FROM ndslabs/ng-base:latest

# Set build information here before building (or at build time with --build-args version=X.X.X)
ARG version="1.0.13"

# Set up necessary environment variables
ENV DEBIAN_FRONTEND="noninteractive" \
    TERM="xterm"

# Copy in the manifests and the app source
WORKDIR /app
COPY package.json /app

# Install dependencies
RUN npm install

COPY server.js Dockerfile /app/
COPY static/ /app/static

# Expose port 3000 for ExpressJS
EXPOSE 3000

# The command to run our app when the container is run
CMD [ "node", "server.js" ]
