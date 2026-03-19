# Green Justice

Green Justice is a small web application that helps citizens report environmental law violations and gives authorities a live dashboard to manage complaints.

## Features

- **Citizen side**
  - Welcome page with **language selection**
  - **Map-style explanation** page describing what Green Justice does
  - Step to **choose the type of violation**
  - Ability to **attach a photo or video** of the violation
  - **Location** input for where the violation happened
  - Optional **text box** for extra details
  - Clear **thank-you message** for helping keep the environment clean

- **Authority side**
  - **Mandatory sign-up or login** for authority members
  - Protected **dashboard** listing complaints with multiple **sort options** (e.g. most recent, highly reported, oldest open)
  - Ability to **update complaint status** (open, in progress, resolved)
  - Ability to **delete fake allegations**
  - **Real-time feel** through periodic automatic refresh of the complaint list
  - **Reminder logic** in the backend if a complaint has not been addressed for a week
  - **Database connection** with relevant councils/committees/departments
  - When viewing a complaint, the dashboard shows the **suggested office contact** (name, phone, address, email) based on the violation type

## Tech stack

- **Backend**: Node.js + Express + SQLite
- **Frontend**: Plain HTML, CSS, and JavaScript (no build tooling required)

## Getting started

1. **Install dependencies**

   ```bash
   cd "c:\Users\danud\Desktop\New folder (2)"
   npm install
   ```

2. **Run the server**

   ```bash
   npm start
   ```

3. **Open the site**

   Visit `http://localhost:3000` in your browser.

## Using the app

- **As a citizen**
  - Go to the landing page and click **"I am a citizen / witness"**.
  - Choose your language, read the map-based explanation, then fill in the short form:
    - Select the violation type
    - Provide the location
    - Optionally upload a photo or video
    - Optionally add extra details
  - After submission you will see a **thank-you message**.

- **As an authority member**
  - From the landing page, click **"I am an authority member"**.
  - On the authority page:
    - Either **sign up** (mandatory fields: name, email, password)
    - Or **log in** with an existing account
  - After authentication you are redirected to the **dashboard**:
    - Change sort order using the sort dropdown
    - Update complaint status (open / in progress / resolved)
    - Delete a complaint if it is a **fake allegation**
    - See **office contact details** suggested for each complaint based on its violation type

## Notes

- The reminder mechanism runs in the backend and logs to the console when a complaint is older than 7 days and still not resolved or deleted. In a production system you would connect this to email or notification services.
- The SQLite database file is created automatically in the `server` folder on first run, and some example offices are seeded for common violation types.

