# BeyondChats Frontend

This is the frontend application for the **BeyondChats Blog Platform**, built using React.  
It consumes a REST API hosted on Render and displays blog articles with SEO-friendly routing.

---

## 🌐 Live Website

👉 https://beyond-frontend-nine.vercel.app

---

## 🧰 Tech Stack

- React
- React Router DOM
- Axios
- React Helmet Async
- Vercel (Deployment)

---

## ✨ Features

- Blog listing page
- Search functionality
- Pagination support
- Dynamic blog detail pages using slug
- SEO-friendly meta tags
- Loading and error handling
- Responsive UI
- API-based architecture
- Production-ready setup

---

## 🔗 Backend API

The frontend consumes data from the backend API hosted on Render:
https://beyond-backend-6.onrender.com/


## 📁 Project Structure
src/
├── api/
│ └── api.js
├── pages/
│ ├── Home.jsx
│ ├── Article.jsx
├── components/
├── App.jsx
├── main.jsx


## ⚙️ Environment Variables

Create a `.env` file in the root of the frontend project:

```env
REACT_APP_API_URL=https://beyond-backend-6.onrender.com





