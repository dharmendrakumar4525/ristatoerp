FROM node:16-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application files
COPY . .

# Expose the application's port
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
