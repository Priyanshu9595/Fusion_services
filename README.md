# FusionDocs 🚀

**FusionDocs** is a comprehensive, modern SaaS platform designed for **Fusion Services**. It streamlines the process of generating Bill of Materials (BOM), Tax Invoices, Quotes, and Delivery Challans for manufacturing and production workflows.

## 🌟 Features

- **Premium SaaS Dashboard**: A highly responsive, aesthetically pleasing interface built with Tailwind CSS.
- **Document Generation**: Create Quotes, Invoices, and Delivery Challans with an easy-to-use Grid UI.
- **Automated Tax Calculations**: Real-time calculation of sub-totals, GST percentages, and discounts.
- **Customer Management**: Maintain a registry of customers for quick selection during document creation.
- **Document History**: Track all generated documents in a centralized company repository.
- **PDF Generation**: Instantly download professional PDF versions of the documents.
- **Role-Based Access**: 
  - **Staff**: Can generate and manage their own documents.
  - **Admin/Manager**: Has full overview of company analytics and all documents.

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Lucide React (Icons), React Router.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (Neon DB).
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Priyanshu9595/Fusion_services.git
   cd FusionDocs
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory and configure your environment variables:
   ```env
   PORT=5000
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret
   ```
   Run the backend development server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```
   Run the frontend development server:
   ```bash
   npm run dev
   ```

## 🔒 Security & Access

- Registration is restricted to specific domains (e.g., `@staff.co.in`).
- Passwords are securely hashed.
- Protected API routes ensure that users can only access their authorized data.

---
*Built with ❤️ for Fusion Services.*
