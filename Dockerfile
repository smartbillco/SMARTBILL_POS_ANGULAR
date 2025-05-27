# Use the Node 10.24 as the base image
FROM node:10.24 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (if present)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Build the Angular app for production
RUN npm run build --prod

# Use Nginx to serve the built Angular application
FROM nginx:alpine

# Copy the built Angular app from the build container
COPY --from=build /app/dist/smartbill /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx to serve the app
CMD ["nginx", "-g", "daemon off;"]
