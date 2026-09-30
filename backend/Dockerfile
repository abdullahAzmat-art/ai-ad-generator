FROM node:24

WORKDIR /app

# Hugging Face Spaces expects the app on port 7860 — bake it in so you don't forget
ENV PORT=7860

# Install deps first — npm ci is reproducible from the lockfile, and --omit=dev
# keeps dev-only packages (nodemon, etc.) out of the image
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of the backend (node_modules and .env are excluded via .dockerignore)
COPY . .

EXPOSE 7860

CMD ["node", "src/server.js"]
