FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev

COPY src ./src

ENV PYTHONPATH=/app/src
EXPOSE 8000

CMD ["uv", "run", "dev"]