# SMF's Backpack: A Memory Archive

## Overview

SMF's Backpack is a full-stack app for authenticated users to perform CRUD operations on memories of a deceased loved one, including physical items and significant life events. Inspired by the concept of "what's in my backpack," and the thought experiment "Schrodinger's Cat", this app provides a sentimental space for users to reflect on how those memories exist in a state of uncertainty until actively acknowledged and celebrated.

## Table of Contents

- [Technologies](#technologies)
- [Features](#features)
- [Project Directory Structure](#project-directory-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Git Commit Message Guidelines](#git-commit-message-guidelines)
- [Branches](#branches)
- [How to Switch Branches](#switch-branches#)
- [Roadmap of Features](#roadmap-of-features)
- [Accessibility Considerations](#accessibility-considerations)
- [Contributing and Contact Info](#contributing-and-contact-info)
- [Acknowledgements](#acknowledgements)
- [Debugging](#debugging)

## Technologies

- **Frontend**: Vite, React
- **Backend**: Express.js, PostgreSQL

## Features

- User authentication with hashed passwords
- Submit memories with titles, descriptions, images, and context
- CRUD operations for managing users and memories
- Intuitive interface for memory browsing

## Project Directory Structure

* _uses ES6 module syntax for modular code organization_
* _organized to facilitate clear separation of concerns_


```plaintext
schrodingers_backpack_fullstack/

├── client/         # Frontend code (React, Vite, etc.)
|                   # npm run dev
│   ├── public/     # Static files for the client
│   ├── src/        # Source code for the client
│   │   ├── assets/        # Images and other assets
│   │   ├── components/    # Child components
│   │   ├── css/           # Styling for the child components
│   │   └── App.jsx        # Parent application file
│   └── package.json       # Client-side dependencies and scripts
│
└── server/         # Backend code (Express, Node.js, etc.)
 |                  # npm run seed:dev, npm run start:dev
 ├── api/                  # Defined API route functions and handlers per table
 |    └── utils.js         # Utility functions, incl. auth middleware
 ├── db/                  
 |    └── index.js         # Database model functions using CRUD operations
 |    └── seed.js          # Database connection management and 
                              seeding script to populate initial data
 ├── .env                  # Environment variables for configuration
 ├── server.js             # Main server file to start the application
 └── package.json          # Server-side dependencies and scripts
```

## Installation

To set up the project, follow these steps:

1. Clone repo
2. Navigate to project directory
3. Set up backend / server

```bash
# initializes node application
npm init -y # for general install,
npm init # for customizable install

# Install Express and other dependencies
npm install --save-dev nodemon && # nodemon as a development dependency; to allow Node.js app to automatically restart for detected directory file change instances
# && a shell operator that allows run of multiple commands in sequence. The next command will only run if the previous one is successful
npm install --save express # Node.js web framework handling API routing, middleware, HTTP requests
npm install --save pg # PostgreSQL client for Node.js to interact with psql database
npm install --save bcrypt # secure password hashing library for user authentication
npm install jsonwebtoken # creation and verification of JWTs for authentication and session management; Library for creating and verifying JSON Web Tokens (JWT)
npm install --save uuid # Library for generating unique identifiers (UUIDs) for database record
npm install morgan # middleware for HTTP requests logging in Express apps; for tracking server activity
npm install dotenv # module that loads environment variables from a .env file into process.env; to configure  application without hardcoding sensitive data (like API keys, database passwords, etc.) directly into  source code; separation makes it easier to manage configuration settings for different environments (development, testing, production) by changing the .env file instead of modifying code
npm install cors # security feature for web applications to facilitate safe API sharing

# Or, this shortcut:
npm install --save express pg bcrypt jsonwebtoken uuid morgan dotenv cors
```
4. Confirm start scripts in package.json

```javascript
{
    "scripts": {
        "start": "node server.js",
        "start:dev": "nodemon server.js"
    }
}
```
5. Set up frontend / client with dependencies:

```bash
npm install vite@latest
npm install # Install all dependencies listed in package.json
npm run dev # starts Vite development server, which should detail running the server in terminal

# install dependencies
npm install react-router-dom
```

## Usage

1. After installing, run the server in a terminal:

```bash
npm run start:dev 
# at http://localhost:3000 (or other specified port in your environment variables)
# CTRL + C to quit

```
2. To run client and access app through browser 
```bash
# open a second terminal
cd client
npm run dev 
# at http://localhost:5173
# CTRL + C to quit
```
## Git Commit Message Guidelines

1. **Add/Update/Delete/Remove**:

   - `git commit -m "Add user authentication"`
   - `git commit -m "Update README with installation instructions"`
   - `git commit -m "Remove unused images"`

2. **Fix**:

   - `git commit -m "Fix bug in user login logic"`
   - `git commit -m "Fix typo in the homepage header"`

3. **Improve**:

   - `git commit -m "Improve performance of data fetching function"`

4. **Refactor**:

   - `git commit -m "Refactor user profile component for better readability"`

5. **Feature/Enhancement**:

   - `git commit -m "Add search functionality to user profiles"`

6. **Documentation**:

   - `git commit -m "Document API endpoints in README"`

7. **Chore**:

   - `git commit -m "Chore: update dependencies"`

8. **Initial Commit**:
   - `git commit -m "Initial commit"`

# Best Practices for Commit Messages

- **Use Imperative Mood**: Write messages in the imperative (e.g., "Fix bug", "Add feature").
- **Be Descriptive**: Provide clarity; add more context if needed:
  ```bash
  git commit -m "Add image upload feature" -m "This feature allows users to upload images to their profiles."
  ```

## Branches

This repository contains two primary branches:

### `main`

- **Purpose**: This branch represents the stable production-ready version of the application. Changes that have been thoroughly tested and are ready for deployment are merged into this branch.
- **Usage**: Use this branch if you want to run or deploy the application in a production environment.

### `feature`

- **Purpose**: This branch serves as the development branch where new features, bug fixes, and other changes are integrated and tested before they are merged into the `main` branch.
- **Usage**: You can check out this branch to explore the latest features, contribute code, or help with testing.

## How to Switch Branches

To switch between branches, use the following Git commands:

```bash
# To switch to the feature branch
git checkout feature

# To switch back to the main branch
git checkout main
1. Main branch has clean code
2. console.log branch has console.logs and other notes.
```

## Roadmap of Features

1. Minimum Viable Product (March 2025)
2. Tier 2 (TBD)
3. Tier 3 (TBD) including accessbility considerations

## Accessibility Considerations (Tier 3)

Key practices to follow for designing for accessibility to ensure as many users can effectively interact with the app:

To ensure our application is accessible to all users, implement the following directives:

1. **Use Semantic HTML**:

   - Utilize HTML5 elements like `<header>`, `<nav>`, `<main>`, `<article>`, and `<footer>` to give structure and meaning to your content.

2. **Implement ARIA Roles**:

   - Use ARIA attributes where necessary:
     - Assign `role` attributes such as `role="button"` for non-button elements that act like buttons.
     - Use `aria-label` to provide descriptions where the visual presentation does not convey meaning.

3. **Ensure High Text Contrast**:

   - Check color contrast ratios to ensure text is readable. Aim for a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.

4. **Keyboard Navigation**:

   - Ensure all interactive elements (buttons, links, form inputs) are focusable and usable via keyboard actions (`Tab`, `Enter`, `Space`).
   - Use `tabindex` to control the tab order of elements when necessary.

5. **Forms and Labels**:

   - Ensure each form input has a corresponding `<label>` element.
   - Implement accessible error handling: Use `aria-live` to announce validation messages to assistive technologies.

6. **Add Alt Text to Images**:

   - Provide meaningful alternative text (`alt` attribute) that describes the image’s content or function.
   - Avoid using phrases like "image of" or "picture of"; just describe what it is.

7. **Responsive and Accessible Design**:

   - Use media queries in your CSS to ensure layouts work well on various screen sizes.
   - Make sure modal dialogs can be navigated with the keyboard and can be closed using the `Esc` key.

8. **Use Accessibility Testing Tools**:

   - Run accessibility checks using tools like [Axe](https://www.deque.com/axe/) or [Wave](https://wave.webaim.org/) to identify issues.
   - Test your application with screen readers (like NVDA for Windows or VoiceOver for macOS) to ensure content is read correctly.

9. **Get User Feedback**:
   - Involve users with disabilities in testing to gather feedback on usability and accessibility issues.

Implementing these features will help create a more inclusive user experience and ensure that everyone can access and enjoy our application.

## Contributing and Contact Info

If you have any questions or suggestions, or have submitted pull requests, feel free to reach out to me:

- GitHub: [fishglitch](https://github.com/fishglitch)

## Acknowledgements

Thank you Grace Hopper Program!

## Debugging

# Notes
- Features for TAGS and FAVORITES are disabled for further development and testing
