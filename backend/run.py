#!/usr/bin/env python3
"""Find available port and start Uvicorn server."""

import socket
import sys
from contextlib import closing


def find_available_port(start_port=8000, max_attempts=50):
    """Find an available port starting from start_port."""
    for port in range(start_port, start_port + max_attempts):
        with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
            try:
                sock.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    raise RuntimeError(f"No available ports found between {start_port} and {start_port + max_attempts}")


if __name__ == "__main__":
    import uvicorn

    port = find_available_port()
    print(f"🚀 Starting Nautilus backend on http://127.0.0.1:{port}")
    print(f"   Make sure your frontend env has: VITE_API_URL=http://127.0.0.1:{port}")
    
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=port,
        reload=True,
    )
