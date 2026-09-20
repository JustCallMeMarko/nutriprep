FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim

WORKDIR /app

COPY pyproject.toml uv.lock README.md ./
COPY src ./src

RUN uv sync --locked --no-dev

ENV PYTHONPATH=/app/src
EXPOSE 8000

CMD ["uv", "run", "dev"]