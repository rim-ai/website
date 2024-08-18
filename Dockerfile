# Use official node image as the base image
FROM node:lts as build

ADD ./package.json /tmp/package.json
RUN cd /tmp && npm install --force
RUN mkdir -p /usr/local/app && cp -a /tmp/node_modules /usr/local/app/

WORKDIR /usr/local/app

# Add the source code to app
COPY ./ /usr/local/app/

# Generate the build of the application
RUN npm run build

ENV HOST 0.0.0.0
ENV PORT 8080
# Stage 2: Serve app with nginx server
# Use official nginx image as the base image
FROM nginx:latest

# Copy the build output to replace the default nginx contents.
COPY --from=build /usr/local/app/dist/build/browser /usr/share/nginx/html


# This line is IMPORTANT, we will breakdown it on a minute.
# COPY ./entrypoint.sh /usr/local/app/entrypoint.sh

COPY ./nginx.conf  /etc/nginx/conf.d/default.conf

# COPY /usr/share/nginx/html/config/app-config.prod.json /usr/share/nginx/html/app-config.json

# Expose ports
EXPOSE 8080
