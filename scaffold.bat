@echo off
echo Scaffolding Next.js app in web2...
call npx -y create-next-app@latest web2 --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
echo Entering web2 and installing dependencies...
cd web2
call npm install framer-motion lucide-react clsx tailwind-merge
echo Done.
