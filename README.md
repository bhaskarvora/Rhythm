Rhythm is a full-stack music streaming web application that allows users to browse albums, listen to songs, manage playlists, and perform admin operations such as uploading and deleting songs or albums.
It’s built using a microservice architecture with a modern React + TypeScript frontend and three backend services — User Service, Admin Service, and Song Service.


## 🚀 Features

### 🎧 **User Features**
- User registration & login with **JWT authentication**  
- View all albums and songs  
- Play songs directly in the web player  
- Add or remove songs from personal playlist  
- View profile details  

---

### 🎛️ **Admin Features**
- Create new albums with **thumbnail upload**  
- Add new songs to albums (**audio file upload via Cloudinary**)  
- Update song thumbnails  
- Delete albums or songs (with **Redis cache invalidation**)  
- Automatic database creation for **PostgreSQL (Neon)** on first launch  

---

### ⚙️ **Technical Features**
- **Microservices architecture** (User, Song, Admin)  
- **Caching layer with Redis** for fast album/song retrieval  
- **Cloudinary integration** for media file storage (songs & thumbnails)  
- **PostgreSQL (Neon serverless)** for structured music data  
- **MongoDB** for user management & playlist tracking  
- **Axios-based communication** between services  
- **CORS enabled** for frontend-backend communication  
- **Error-handling middleware (TryCatch wrapper)**  
- **TypeScript everywhere** for type safety  

---

## 🧩 Tech Stack

### 🎨 **Frontend**
- ⚛️ **React 18 (Vite + TypeScript)**  
- 🎨 **TailwindCSS / CSS Modules**  
- 🔁 **React Context API** (User & Song Context)  
- 🔊 **HTML5 Audio API**  
- 🔗 **Axios** for API communication  

