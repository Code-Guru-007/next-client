FROM node:16

# Set working directory
WORKDIR /usr/app

# Install PM2 globally
RUN yarn global add pm2

# Copying all files
COPY . .

# Expose the listening port
EXPOSE 3000

# Run container as non-root (unprivileged) user
# The node user is provided in the Node.js Alpine base image
USER node

# Run npm start script with PM2 when container starts
CMD pm2-runtime npm -- start