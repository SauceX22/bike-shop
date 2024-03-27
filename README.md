# React Bike Rentals 🏍️

## Overview

React Bike Rentals is a dynamic web application designed to facilitate the process of renting bikes. Built with the T3 Stack, this project leverages a suite of modern technologies to deliver a seamless and intuitive user experience. 
The application caters to two user roles: **Manager** and **User**, each with distinct functionalities tailored to their needs.

## Features

### General

- React-based (using NextJS) frontend for a responsive, user-friendly interface.
- Comprehensive user authentication system.
- NextJS hosted on Vercel and database on Railyway.

### For Managers

- CRUD operations on bikes and user profiles.
- Oversight on bike reservations, including details like the user and the rental period.
- Management of user roles and permissions.

### For Users

- Browse available bikes for specific dates.
- Advanced filters based on model, color, location, or rating.
- Option to reserve bikes for specified durations.
- Ability to rate bikes on a scale of 1 to 5.
- Flexibility to cancel reservations.

## Online Demo 💻

Access our live demo with the following credentials:

- **Manager Account**
  - Email: `manager@gmail.com`
  - Password: `123456`

- **User Account**
  - Email: `user@gmail.com`
  - Password: `123456`

You can also register new users with fake emails as per the requirements, these are simply starter accounts.
Demo available at [**This Link**](https://bike-shop-saucex22.vercel.app/home)

**Note: The credentials above are only for demo purposes, and are not real emails that you can contact.**

## Getting Started 🌟

To get this project up and running on your local machine, follow these steps:

1. **Clone the repository**: `git clone https://github.com/SauceX22/bike-shop.git`
2. **Install dependencies**: Navigate to the project directory and run `npm install`.
3. **Set up environment variables**: Before starting the development server, you need to configure the environment variables defined in `env.mjs`. Create a `.env.local` file in the root of your project and define the following variables:
   - `DATABASE_URL`: The URL to your database. Ensure it's a valid URL and not the placeholder `YOUR_MYSQL_URL_HERE`.
   - `NODE_ENV`: Set to `development`, `test`, or `production` depending on your environment.
   - `NEXTAUTH_SECRET`: A secret key for NextAuth.js, required in production. Refer to [Next-Auth Docs](https://next-auth.js.org/configuration/options#secret) for aquirement.
   - `NEXTAUTH_URL`: The base URL of your site for NextAuth.js callbacks. If deploying on Vercel, this can be left as is to automatically use `VERCEL_URL`.
   - `NEXT_PUBLIC_APP_URL`: The public-facing URL of your application.

   For more details on each environment variable and instructions on how to set them up, please refer to the [Environment Variables Setup Guide](https://github.com/SauceX22/bike-shop/wiki/Environment-Variables-Setup) on our GitHub wiki.

4. **Start the development server**: Execute `npm run dev` and visit `http://localhost:3000` in your web browser.

## Technologies Used

- **[Next.js](https://nextjs.org)**: Main framework providing routing and server-side rendering capabilities.
- **[NextAuth.js](https://next-auth.js.org)**: Secure and flexible user authentication.
- **[Railway](https://railway.app)**: Production Database Hosting.
- **[Prisma](https://prisma.io)**: ORM for database interactions.
- **[Tailwind CSS](https://tailwindcss.com) & [Shadcn UI](https://ui.shadcn.com/)**: Styling and customizable UI components.
- **[tRPC](https://trpc.io)**: End-to-end typesafe API operations.
- **[Zod](https://zod.dev/)**: Input validation to ensure robustness.
- **[React Hook Form](https://react-hook-form.com/)**: Efficient and easy handling of form states.
- **[Sonner](https://sonner.emilkowal.ski/)**: Engaging notification system for user feedback.

## Contributing

We welcome contributions and feedback on our project. Please visit our [GitHub repository](https://github.com/SauceX22/bike-shop) to report issues, suggest improvements, or view the contribution guidelines.

## Deployment

This project is preconfigured for deployment on [Vercel](https://vercel.com) with database hosting on [Railway](https://railway.app). Follow the deployment instructions specific to your chosen platform to get React Bike Rentals live.

## Learn More

For project-specific details, including setup instructions, API references, and development guidelines, please refer to the [project's GitHub wiki](https://github.com/SauceX22/bike-shop/wiki)

For a more detailed understanding of the [T3 Stack](https://create.t3.gg/) and the technologies used in this project, please refer to the following:

- [T3 Stack Documentation](https://create.t3.gg/) — General T3 Stack Documentation of the main tools used in this project.
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials
- [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — They welcome feedback and contributions!
