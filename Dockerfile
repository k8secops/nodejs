# Single-stage: the gitops-platform compile stage already runs `npm install`
# (with any private-registry credentials this app declares) before Kaniko
# ever runs, leaving node_modules/ in the workspace. This Dockerfile only
# packages the already-installed app -- it does not reinstall dependencies.
FROM node:20-alpine
WORKDIR /app
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
