FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies -- build for the correct architecture takes place here
RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start command
CMD ["node", "index.js"]
