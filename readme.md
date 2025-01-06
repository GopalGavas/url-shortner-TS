# ⚡**QuickURL (URL Shortener)**

A backend application that enables users to generate shortened URLs for long links. The project incorporates modern web development practices, robust security measures, and advanced features for scalability and ease of use.

---

## **Table of Contents**

- [Overview](#overview)
- [Features](#features)
  - [User Management](#user-management)
  - [URL Management](#url-management)
  - [Admin Features](#admin-features)
  - [Security](#security)
- [Tech Stack](#️tech-stack)
- [Installation](#installation)
- [Contribution](#contribution)
- [License](#license)
- [Author](#author)

---

## 📖**Overview**

The **QuickURL** project provides users with the ability to shorten long URLs, making them easier to share and manage. It uses secure authentication, rate limiting, input validation, and advanced features like URL visibility control and user-specific URL management. Admin features ensure better management of users and URLs.

---

## ✨**Features**

### **User Management**

- **Authentication**: Secure user authentication using JWT.
- **Registration and Login**: Rate-limited endpoints to prevent abuse.
- **Password Management**: Secure endpoints for updating user details and passwords.

### **URL Management**

- **URL Shortening**: Create short, unique identifiers for long URLs.
- **Redirect Functionality**: Short URLs redirect to their original long links.
- **URL Analytics**: Check Total Clicks, and VisitHistory of ShortIds.
- **Visibility Management**: Toggle the visibility status of URLs.
- **User-Specific URLs**: Retrieve all URLs created by a user.
- **Pagination and Filtering**: Efficient retrieval of URLs for large datasets.

### **Admin Features**

- **Manage Users**: Admin can block, fetch or delete users.
- **Manage URLs**: Admin can delete or retrieve all URLs with advanced filters.

---

### 🔐**Security**

- **Rate Limiting**: Prevent excessive requests with global rate limiting and specific limits for login, registration, and URL creation.
- **Input Validation**: Ensure secure data handling with server-side validation.
- **Sanitization**: Prevent NoSQL injection attacks with **Express Mongo Sanitize**.
- **Helmet**: Set secure HTTP headers to mitigate web vulnerabilities.
- **CORS**: Controlled cross-origin resource sharing.

---

## 🛠️**Tech Stack**

- **Languages**: TypeScript, JavaScript.
- **Backend Framework**: Express.js.
- **Database**: MongoDB (Mongoose).
- **Authentication**: JWT (JSON Web Tokens).
- **Rate Limiting**: Express Rate Limiter.
- **Logger**: Morgan, Winston.
- **Sanitization**: Express Mongo Sanitize.
- **Security**: Helmet, CORS.

---

## 🔽**Installation**

To run the URL Shortener project locally:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/GopalGavas/url-shortner-TS.git
   ```

   cd url-shortener-TS

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Build Project**:

   ```bash
   npm run build
   ```

4. **Set up environment variables**:

   Copy the `.env.example` file to `.env` and update the values as necessary (e.g., MongoDB URI, JWT secret key).

5. **Start the server**:

   ```bash
   npm run dev
   ```

The application will now be running at `http://localhost:8000`.

---

## 📋**API Endpoints**

| Endpoint       | Description                                    |
| -------------- | ---------------------------------------------- |
| `/users`       | User registration, login, profile management   |
| `/urls`        | Generate shortids, redirectUrls, url analytics |
| `/admins`      | Admin actions                                  |
| `/healthcheck` | Backend health verification                    |

---

## 🤝**Contribution**

We welcome contributions to **QuickURL**! If you'd like to contribute, please follow these steps:

1. **Fork** the repository.

2. Create a **new branch**:

   ```bash
   git checkout -b feature-name
   ```

3. **Make your changes** and commit them:

   ```bash
   git commit -am 'Add feature'
   ```

4. **Push** to the branch:

   ```bash
   git push origin feature-name
   ```

5. **Create a new pull request** with a clear description of what changes you’ve made and why they are beneficial.

---

## 📜**License**

This project is licensed under the ISC License.

---

## 👤**Author**

**[Gopal Gavas](https://github.com/GopalGavas)**
