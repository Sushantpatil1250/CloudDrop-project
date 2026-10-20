# ☁️ CloudDrop — Cloud-Based File Storage System

A simple and beginner-friendly cloud storage web application built using HTML, CSS, JavaScript, and Supabase. CloudDrop allows users to create an account, log in, and manage their files securely through cloud storage.

## 📌 About the Project

CloudDrop is a web-based cloud storage system that helps users upload, download, view, and delete files from anywhere using an internet connection.

The project uses **Supabase Authentication** for user authentication and **Supabase Storage** to store files in the cloud.

This project was developed as a college Cloud Computing project to understand cloud storage, authentication, and backend-as-a-service (BaaS).

## ✨ Features

- 🔐 User Registration and Login
- ☁️ Cloud-Based File Storage
- 📤 Upload Files
- 📥 Download Files
- 🗑️ Delete Files
- 🌐 Access Files Through a Web Browser
- 📱 Simple and User-Friendly Interface
- 🔑 Authentication Using Supabase

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Web page structure |
| CSS3 | Styling and responsive design |
| JavaScript | Application logic |
| Supabase | Backend and cloud services |
| Supabase Auth | User authentication |
| Supabase Storage | Cloud file storage |
| Python HTTP Server | Run the application locally |
| Git & GitHub | Version control and project hosting |

## 🏗️ Project Architecture

```text
             User
               |
               v
        CloudDrop Website
       (HTML, CSS, JavaScript)
               |
               v
            Supabase
          /          \
         v            v
   Authentication   Cloud Storage
         |            |
         v            v
    User Account    User Files
```

## 📂 Project Structure

```text
CloudDrop/
│
├── index.html
├── style.css
├── app.js
├── animations.js
├── bg.svg
├── supabase-config.js
├── setup.sql
└── README.md

*Note: Adjust the file structure above to match your actual project files.*

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/CloudDrop.git
```

### 2. Open the Project Folder

```bash
cd CloudDrop
```

### 3. Create a Supabase Project

1. Visit [Supabase](https://supabase.com/).
2. Create a new project.
3. Open **Project Settings → API Keys**.
4. Copy your Project URL and publishable key.

### 4. Configure Supabase

Open `supabase-config.js` and add your own project credentials:

```javascript
export const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
export const SUPABASE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";
export const BUCKET = "files";
```

**Important:** Never upload your Supabase secret key or `service_role` key to GitHub.

### 5. Configure the Database and Storage

- Open the Supabase SQL Editor.
- Run the SQL commands provided in `setup.sql`.
- Ensure that the `files` storage bucket exists.
- Configure appropriate Row Level Security (RLS) policies so users can access only their authorized files.

### 6. Run the Application

Make sure Python is installed. Open a terminal in the project folder and run:

```bash
python -m http.server 8000
```

Open your browser and visit:

http://localhost:8000

## 🔒 Security

- Use Supabase publishable keys for frontend applications.
- Never expose secret or `service_role` keys.
- Enable Row Level Security and configure appropriate storage policies.
- Restrict file access so users can access only their own files.
- Do not commit passwords or private credentials to GitHub.

## 🎯 Learning Outcomes

Through this project, I learned about:

- Cloud computing fundamentals.
- Cloud-based file storage.
- Backend-as-a-Service (BaaS).
- User authentication and authorization.
- REST APIs and JavaScript integration.
- Database security and Row Level Security.
- Version control using Git and GitHub.

## 🚀 Future Enhancements

- File sharing through secure links.
- File search and filtering.
- File type and size validation.
- Storage usage dashboard.
- File previews.
- Improved mobile responsiveness.

## 👨‍💻 Author

**Sushant Patil**

Third-Year B.Tech Computer Science and Engineering Student

## 📄 License

This project is created for educational purposes. You may add an MIT License if you want to distribute it under that license.

---

⭐ If you find this project useful, consider giving the repository a star!
