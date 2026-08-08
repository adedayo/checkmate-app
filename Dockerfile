# Multi-stage Dockerfile for checkmate-app.
#
# This no longer rewrites its own go.mod. The previous version ran
# `go mod edit -dropreplace`, `-droprequire`, then
# `go get github.com/adedayo/checkmate@main` — twice — which meant the image
# contents depended on the state of another repository's default branch at
# build time. A v2.1.0 image did not identify the code inside it, rebuilding
# the same tag produced a different image, and the SBOM the release attaches
# described a dependency graph that existed only during that one CI run.
#
# go.mod now pins a released checkmate version, and this builds the repository
# exactly as committed.

# Stage 1: Build the Angular frontend.
#
# Split from the Go stage so that a frontend change does not invalidate the Go
# module cache, and so the Node toolchain is absent from the stage that
# produces the binary.
FROM node:24-alpine AS frontend

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Go binary.
FROM golang:1.26-alpine AS builder

RUN apk add --no-cache git gcc g++ musl-dev pkgconfig \
    gtk+3.0-dev webkit2gtk-4.1-dev

WORKDIR /app

# Dependencies first, so that a source-only change reuses this layer.
COPY go.mod go.sum ./
RUN go mod download

COPY . .
COPY --from=frontend /app/dist/frontend ./frontend/dist/frontend

# Stamped so a running container can be asked what it is. An image tag says
# what someone meant to deploy; the binary says what is actually executing, and
# the two disagree more often than anyone expects.
ARG VERSION=dev
ARG COMMIT=""
ARG BUILD_DATE=""
RUN CGO_ENABLED=1 GOOS=linux go build -trimpath -tags webkit2_41 \
    -ldflags "-s -w \
      -X checkmate-app/pkg/version.Version=${VERSION} \
      -X checkmate-app/pkg/version.Commit=${COMMIT} \
      -X checkmate-app/pkg/version.BuildDate=${BUILD_DATE}" \
    -o CheckMate .

# Stage 3: Minimal runtime.
FROM alpine:3.22

RUN apk add --no-cache ca-certificates git tzdata \
    && adduser -D -u 10001 checkmate \
    && mkdir -p /data \
    && chown checkmate:checkmate /data

WORKDIR /app

COPY --from=builder /app/CheckMate /app/CheckMate

# Non-root. CheckMate reads source repositories and writes a local SQLite
# database; it has no need of root, and a scanner running as root is a scanner
# whose worst day is considerably worse.
USER checkmate

ENV PORT=8080 \
    CHECKMATE_DATA_DIR=/data

EXPOSE 8080

VOLUME ["/data"]

ENTRYPOINT ["/app/CheckMate"]
