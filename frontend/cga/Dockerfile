# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/engine/reference/builder/

ARG NODE_VERSION=20.5.1

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}

# Set working directory for all build stages.
WORKDIR /usr/src/app


################################################################################
# Copy the rest of the source files into the image.
COPY . .
# Run the build script.
RUN npm install 


################################################################################


# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD npm start
