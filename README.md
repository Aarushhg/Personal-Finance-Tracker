# Cashly

**Cashly** is a modern, intuitive finance tracker app that helps users manage expenses, track budgets, set financial goals, and view transaction history. With AI assistance, dark mode, and a responsive design, Cashly provides a seamless experience for smart personal finance management.  

---

## Features

- **Expense Tracking** – Add, edit, and delete transactions easily.  
- **Budgets & Goals** – Set budgets and track progress towards financial goals.  
- **Transaction History** – View past transactions with filtering options.  
- **AI Assistant** – Get financial insights and suggestions using AI.  
- **Notifications** – Receive reminders and alerts for budgets and goals.  
- **Dark Mode** – Toggle between light and dark themes for better readability.  
- **Responsive Design** – Works smoothly on desktop and mobile devices.  

---

## Tech Stack

- **Frontend:** React, Tailwind CSS, React Router  
- **Backend:** Node.js, Express  
- **Database:** MongoDB  
- **Authentication:** JWT  
- **APIs:** Gemini

---

## Installation

1. **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/cashly.git
    cd cashly
    ```

2. **Backend setup**
    ```bash
    cd backend
    npm install
    ```
    - Create a `.env` file:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    GEMINI_API_KEY=your_api_key (if using AI)
    ```
    - Start the backend:
    ```bash
    npm run dev
    ```

3. **Frontend setup**
    ```bash
    cd ../frontend
    npm install
    npm start
    ```
    - App will run on: `http://localhost:3000`
