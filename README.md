# NutriPrep

Subscription-based healthy meal delivery platform where users can customize weekly meal prep plans based on specific dietary goals (e.g., low-carb, high-protein).

## Target Users

- Health-conscious individuals
- Fitness enthusiasts and athletes
- Busy professionals
- Students seeking convenient healthy meals
- Customers with specific dietary goals (e.g., low-carb, high-protein)

## Problem Statement

Many people struggle to maintain a healthy diet due to limited time for meal planning and preparation. Existing meal delivery services often lack personalized nutrition and efficient management of subscriptions, inventory, and deliveries.

## Project Objectives

- Develop a delivery management module.
- Integrate AI-powered personalized meal suggestions.
- Develop a target macronutrient tracking module.
- Implement an inventory management module.

## Expected Features

- **User Management** — Authentication, profile, goal setting, personal goals (weight, height, body fat %)
- **Subscription** — Plan management and billing
- **Meal Planning** — Filter meals, schedule meals, automated meal planning, add customized meals
- **Order & Tracking** — Cart, buy, auto pay, delivery tracking, email invoice
- **Macro Tracking** — Target macronutrient tracking with analytical charts (weekly/monthly)
- **CMS Meal Admin** — Meal management

## Architecture

NutriPrep follows a **layered architecture** that separates concerns across presentation, application, and infrastructure layers.

```
nutriprep/
├── client/     # Frontend (presentation layer) — React + Vite + Tailwind
│   └── src/
│       ├── assets/        # Static assets (images, fonts)
│       ├── components/    # Reusable UI components
│       └── layouts/       # Page layouts
└── server/     # Backend (application & infrastructure layers) — FastAPI
    ├── main.py            # Application entry point
    ├── pyproject.toml     # Python dependencies
    └── README.md
```

### Layers

| Layer | Responsibility | Tech |
| --- | --- | --- |
| **Presentation** | User interface, rendering, client-side state | React, Tailwind CSS |
| **Application** | Business logic, API routing, use-case orchestration | FastAPI (server) |
| **Data / Infrastructure** | Persistence, external services, delivery/inventory systems | TBD |

### Frontend (client/)

React single-page application built with Vite and Tailwind CSS, organized around reusable `components` and `layouts`.

### Backend (server/)

FastAPI application exposing RESTful APIs that implement the business logic for meals, subscriptions, orders, and tracking. Python dependencies are managed with `uv`.

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router, Clerk
- **Backend:** Python 3.14+, FastAPI, Clerk Backend API
- **Package Managers:** npm (client), uv (server)

## Getting Started

### Prerequisites

- Node.js
- Python 3.14+
- [uv](https://docs.astral.sh/uv/)

### Run the client

```bash
cd client
npm install
npm run dev
```

### Run the server

```bash
cd server
uv sync
uv run main.py
```

## SDLC Methodology: Agile

### Why Agile?

We chose the Agile methodology because it allows our team to develop the system quickly throughout the project. Agile breaks the development process into smaller parts, making it easier to plan and improve. It encourages regular communication among team members, ensuring that requirements are clearly understood and changes can be accommodated. This approach helps us identify and resolve issues early.

### Advantages for NutriPrep

Agile provides several advantages for our project. It offers flexibility by allowing the team to continuously improve features such as meal planning, subscription management, and dietary goals. Agile enhances team collaboration through regular communication among developers. It reduces risks by identifying issues early through iterative development.

### Possible Challenges

Choosing Agile as our methodology came with its challenges, such as a lack of documentation and ensuring accurate nutritional information. The platform must also address data security concerns, balance meal quality with operational costs, and maintainability. Overcoming these challenges is essential to providing a consistent, personalized, and satisfying meal prep experience for customers.

### Why Agile over Other SDLC Models?

Agile is more suitable for our proposed system because it focuses on continuous development. Unlike the Waterfall model, which requires all requirements to be finalized before development begins, Agile allows changes to be made even during the development process. Agile also enables the team to deliver working features regularly and fast.
