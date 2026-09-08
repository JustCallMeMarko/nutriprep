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
