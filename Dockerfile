FROM node:20-bookworm

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies, this will build sqlite3 from source against the container's glibc
RUN npm install --production --build-from-source=sqlite3

# Bundle app source
COPY . .

# Expose the correct port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
