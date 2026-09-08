# NutriPrep

Monorepo for the NutriPrep application.

## Structure

- `frontend/` - React + Vite web app
- `backend/` - FastAPI (Python / uv)

## Development

### Pre Requisites
1. NodeJS
2. Python
3. uv ( install by `pip install uv` or go to [uv installation guide](https://docs.astral.sh/uv/getting-started/installation/))

### Frontend

```sh
cd frontend
npm install
npm run dev
```

### Backend

```sh
cd backend
uv sync
uv run dev
```

## Contributing Guidelines

Follow these steps to contribute to the project:

1. Clone the repository  
   Clone the repo to your local machine and navigate into the project folder:
   ```sh
   git clone <REPO_URL>
   cd <REPO_FOLDER>
   ```

2. Create your branch
   Ensure your local `main` is up to date, then create a branch named after your first name (e.g., `firstname`):
   ```sh
   git checkout main
   git pull origin main
   git checkout -b <your-name>
   ```

3. Make and commit your changes
   Make your changes, test them locally, and stage them with a clear commit message:
   ```sh
   git add .
   git commit -m "brief description of changes"
   ```

4. **Push your branch**  
   Push your changes to GitHub and set upstream tracking:
   ```sh
   git push -u origin <your-name>
   ```

5. **Open a Pull Request (PR)**  
   * Go to the GitHub repository and open a PR from your branch (`<your-name>`) into `main`.
   * Add a concise summary of what you implemented and how you verified it.

6. **Wait for review and merge**  
   * Do not merge the PR yourself.
   * Wait for me to review your changes and merge them into `main`.
   * Address any requested feedback or comments on the PR thread if needed.