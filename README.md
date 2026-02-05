# School Management System

This is a School Management System built with HTML, CSS, and JavaScript.

## Deployment

### Deploy to Vercel

1.  Initialize Git (if not already done):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Push to GitHub.
3.  Import the project in Vercel.
    -   **Root Directory**: Leave empty (unless you put this inside a subfolder).
    -   **Build Command**: None (it's a static site).
    -   **Output Directory**: None.

## Data & Storage Note
This application uses **Browser LocalStorage** for data persistence. 
- **Demo Data**: When you first open the deployed site, it will automatically populate with demo students, teachers, and classes.
- **Data Privacy**: Any data you add (new students, uploaded photos) is stored ONLY in your browser. It is not sent to any server and will not persist if you clear your cache or open the site on a different device.
- **Uploads**: You do **not** need to upload any files separately to GitHub or Vercel. Everything needed for the site to run is included in the repository.

## Troubleshooting

If the UI is not loading:
1.  Ensure the `css`, `js`, and `assets` folders are uploaded to GitHub.
2.  Check for case-sensitivity issues (e.g., `css` folder named `CSS`).
