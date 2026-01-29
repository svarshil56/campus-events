# Campus Events Management System 🎓

A modern, dynamic web application for managing campus events, verifying registrations, and engaging students. Built with React and Firebase.

![Campus Events Banner](src/assets/logo.png)

## 🚀 Key Features

*   **Dynamic Event Management**: Administrators (and authenticated users) can effortlessly add new events with custom details.
*   **Role-Based Access Control (RBAC)**: Distinct capabilities for Admins, Organizers, and Students.
    *   **Admins**: Full control over users and events, with a dedicated Dashboard and User Management system.
    *   **Organizers**: Create and manage their own events, view participant lists, and export data.
    *   **Students**: Browse events, register, and view digital tickets.
*   **Excel Export**: Organizers and Admins can export registration data to Excel (`.xlsx`) for easy management.
*   **Real-time Updates**: Participant counts and event details update instantly without refreshing the page.
*   **Secure Authentication**: Robust login and registration system powered by Firebase Auth.
*   **My Events & Digital Tickets**: Students can view their registered events as stylized, perforated digital tickets.
*   **Premium UI/UX**: "Stranger Things" inspired aesthetic with glassmorphism, Cinzel typography, and gold/red accents.

## 🛠️ Tech Stack

*   **Frontend**: React, Vite
*   **Styling**: CSS3 (Glassmorphism, Responsive)
*   **Backend**: Firebase (Firestore, Authentication)
*   **Utilities**: `xlsx` (Excel Export), `recharts` (Data Visualization)
*   **Routing**: React Router Dom
*   **Backend**: Firebase (Firestore, Authentication)
*   **Routing**: React Router Dom

## 📸 Screenshots

<!-- Add your screenshots here -->
| Event Details | Login Screen |
|:---:|:---:|
| ![alt text](image-1.png) | ![alt text](image-2.png) |
| My Events | Digital Ticket |
|:---:|:---:|
| ![alt text](image-3.png) | ![alt text](image-4.png) |

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/svarshil56/campus-events.git
    cd campus-events
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Firebase**
    *   Create a project in the [Firebase Console](https://console.firebase.google.com/).
    *   Enable **Authentication** (Email/Password, Google).
    *   Create a **Firestore Database** and publish the rules found in `firestore.rules`.
    *   Create a `.env` file in the root directory and add your Firebase config:
        ```env
        VITE_API_KEY=your_api_key
        VITE_AUTH_DOMAIN=your_auth_domain
        VITE_PROJECT_ID=your_project_id
        VITE_STORAGE_BUCKET=your_storage_bucket
        VITE_MESSAGING_SENDER_ID=your_messaging_sender_id
        VITE_APP_ID=your_app_id
        ```

4.  **Run the application**
    ```bash
    npm run dev
    ```

## 🛡️ Security Rules

The project uses tight Firestore security rules to ensure data integrity:
*   **Read**: Public access for events.
*   **Create/Update**: Authenticated users only.
*   **User Data**: Users can only modify their own profiles.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
*Built with ❤️ for the Campus Community*
