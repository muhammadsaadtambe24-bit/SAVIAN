"""
Telemetry Streaming & Pub/Sub Router for LINE CLEAR Railway Block Scheduling System.
Provides Server-Sent Events (SSE) for real-time solver convergence updates and status events.
"""

import asyncio
from collections import defaultdict
from datetime import datetime, timezone
import json
import logging
from typing import Any, AsyncGenerator, Dict, Optional, Set

from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse

logger = logging.getLogger("railway_block_scheduling.telemetry")
router = APIRouter()


class TelemetryManager:
    """
    In-memory asynchronous Pub/Sub manager for broadcasting solver execution
    telemetry to connected frontend client sessions using asyncio.Queue.
    """

    def __init__(self):
        # Map session_id -> set of subscriber Queues
        self._subscribers: Dict[str, Set[asyncio.Queue]] = defaultdict(set)
        self._global_subscribers: Set[asyncio.Queue] = set()
        self._lock = asyncio.Lock()

    def subscribe(self, session_id: str) -> asyncio.Queue:
        """Register a new subscriber queue for the given session_id."""
        q: asyncio.Queue = asyncio.Queue()
        self._subscribers[session_id].add(q)
        self._global_subscribers.add(q)
        logger.debug(f"Subscriber registered for session: {session_id} (total: {len(self._global_subscribers)})")
        return q

    def unsubscribe(self, session_id: str, queue: asyncio.Queue) -> None:
        """Remove a subscriber queue upon connection close or disconnect."""
        if session_id in self._subscribers:
            self._subscribers[session_id].discard(queue)
            if not self._subscribers[session_id]:
                del self._subscribers[session_id]
        self._global_subscribers.discard(queue)
        logger.debug(f"Subscriber removed for session: {session_id} (remaining: {len(self._global_subscribers)})")

    def broadcast(
        self,
        event: str,
        data: Any,
        session_id: Optional[str] = None,
    ) -> None:
        """
        Broadcast an event and payload to specific session subscribers,
        or globally to all listening clients if session_id is None.
        """
        payload = {
            "event": event,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        targets = (
            self._subscribers.get(session_id, set())
            if session_id
            else self._global_subscribers
        )

        for q in list(targets):
            try:
                q.put_nowait(payload)
            except Exception as ex:
                logger.debug(f"Failed to enqueue telemetry event: {ex}")


# Global telemetry bus instance
telemetry_bus = TelemetryManager()


@router.get("/stream/{session_id}", summary="SSE stream for solver progress telemetry")
async def stream_telemetry(session_id: str, request: Request) -> EventSourceResponse:
    """
    Server-Sent Events (SSE) telemetry endpoint.
    Emits:
    - `solver_progress`: Intermediate CP-SAT iterations (objective, bound, time)
    - `solution_found`: Intermediate feasible schedule discovered
    - `solve_complete`: Optimization finished and schedules persisted
    - `ping`: Keepalive heartbeat every 15 seconds
    """
    queue = telemetry_bus.subscribe(session_id)

    async def event_generator() -> AsyncGenerator[Dict[str, str], None]:
        try:
            # Yield initial connection handshake
            yield {
                "event": "connected",
                "data": json.dumps({
                    "session_id": session_id,
                    "message": "Connected to LINE CLEAR Telemetry Bus",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }),
            }

            while True:
                if await request.is_disconnected():
                    break

                try:
                    # Wait up to 15 seconds for next event
                    message = await asyncio.wait_for(queue.get(), timeout=15.0)
                    raw_data = message.get("data", {})
                    data_str = (
                        json.dumps(raw_data)
                        if isinstance(raw_data, (dict, list))
                        else str(raw_data)
                    )
                    yield {
                        "event": message.get("event", "message"),
                        "data": data_str,
                    }
                except asyncio.TimeoutError:
                    # Emit periodic keepalive heartbeat ping
                    yield {
                        "event": "ping",
                        "data": json.dumps({
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                            "status": "alive",
                        }),
                    }
        except asyncio.CancelledError:
            pass
        finally:
            telemetry_bus.unsubscribe(session_id, queue)

    return EventSourceResponse(event_generator())
