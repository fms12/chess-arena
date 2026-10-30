import asyncio
import json
from contextlib import suppress
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, patch
from uuid import uuid4

from fastapi import WebSocket

import app.realtime.manager as realtime


class FakePubSub:
    def __init__(self):
        self.channels = set()
        self.messages = asyncio.Queue()

    async def subscribe(self, channel):
        await asyncio.sleep(0)
        self.channels.add(channel)

    async def unsubscribe(self, channel):
        self.channels.discard(channel)
        await self.messages.put({"type": "unsubscribe", "channel": channel})

    async def listen(self):
        while self.channels:
            yield await self.messages.get()


class FakeRedis:
    def __init__(self):
        self.subscribers = []

    def pubsub(self):
        subscriber = FakePubSub()
        self.subscribers.append(subscriber)
        return subscriber

    async def publish(self, channel, data):
        for subscriber in self.subscribers:
            if channel in subscriber.channels:
                await subscriber.messages.put({
                    "type": "message",
                    "channel": channel,
                    "data": data,
                })


class TestConnectionManager(IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.redis = FakeRedis()
        self.redis_patch = patch.object(realtime, "async_client", self.redis)
        self.redis_patch.start()
        self.managers = []

    async def asyncTearDown(self):
        for manager in self.managers:
            if manager.listener_task is not None:
                manager.listener_task.cancel()
                with suppress(asyncio.CancelledError):
                    await manager.listener_task
        self.redis_patch.stop()

    def make_manager(self):
        manager = realtime.ConnectionManager()
        self.managers.append(manager)
        return manager

    def make_socket(self):
        socket = AsyncMock(spec=WebSocket)
        messages = asyncio.Queue()
        socket.send_json.side_effect = messages.put
        return socket, messages

    async def receive(self, messages):
        return await asyncio.wait_for(messages.get(), timeout=1)

    async def test_listener_starts_after_subscription_is_ready(self):
        manager = self.make_manager()
        socket, messages = self.make_socket()
        game_id = str(uuid4())

        await manager.connect(game_id, socket)
        await manager.broadcast(game_id, {"type": "game_state"})

        self.assertEqual(await self.receive(messages), {"type": "game_state"})
        self.assertFalse(manager.listener_task.done())

    async def test_uuid_room_receives_black_join_event(self):
        manager = self.make_manager()
        socket, messages = self.make_socket()
        game_id = uuid4()
        # Isolate UUID routing from the listener startup regression.
        await manager.pubsub.subscribe(f"game:{game_id}")
        await manager.connect(game_id, socket)
        joined = {
            "type": "game_state",
            "game": {"black_player_name": "BlackPlayer", "status": "active"},
        }

        await manager.broadcast(game_id, joined)

        self.assertEqual(await self.receive(messages), joined)
        self.assertIn(str(game_id), manager.connections)

    async def test_broadcast_reaches_both_workers_but_not_other_rooms(self):
        white_manager = self.make_manager()
        black_manager = self.make_manager()
        white, white_messages = self.make_socket()
        black, black_messages = self.make_socket()
        spectator, other_messages = self.make_socket()
        game_id = uuid4()
        await white_manager.connect(game_id, white)
        await black_manager.connect(str(game_id), black)
        await black_manager.connect(uuid4(), spectator)
        update = {"type": "game_state", "game": {"status": "active"}}

        await black_manager.broadcast(game_id, update)

        self.assertEqual(await self.receive(white_messages), update)
        self.assertEqual(await self.receive(black_messages), update)
        self.assertTrue(other_messages.empty())

    async def test_disconnect_normalizes_uuid_and_keeps_remaining_player(self):
        manager = self.make_manager()
        game_id = uuid4()
        white, _ = self.make_socket()
        black, messages = self.make_socket()
        await manager.connect(game_id, white)
        await manager.connect(str(game_id), black)

        await manager.disconnect(str(game_id), white)
        self.assertEqual(manager.connections, {str(game_id): [black]})
        await manager.broadcast(game_id, {"type": "game_state"})
        self.assertEqual(await self.receive(messages), {"type": "game_state"})

        await manager.disconnect(game_id, black)
        self.assertEqual(manager.connections, {})
        self.assertNotIn(f"game:{game_id}", manager.pubsub.channels)

    async def test_connect_restarts_a_finished_listener(self):
        manager = self.make_manager()
        game_id = str(uuid4())
        first, _ = self.make_socket()
        await manager.connect(game_id, first)
        old_listener = manager.listener_task
        old_listener.cancel()
        with suppress(asyncio.CancelledError):
            await old_listener
        second, messages = self.make_socket()

        await manager.connect(game_id, second)
        await manager.broadcast(game_id, {"type": "game_state"})

        self.assertEqual(await self.receive(messages), {"type": "game_state"})
        self.assertIsNot(manager.listener_task, old_listener)

    async def test_closed_socket_does_not_stop_updates_for_other_players(self):
        manager = self.make_manager()
        game_id = str(uuid4())
        closed, _ = self.make_socket()
        closed.send_json.side_effect = RuntimeError("WebSocket is closed")
        healthy, messages = self.make_socket()
        await manager.connect(game_id, closed)
        await manager.connect(game_id, healthy)
        update = {"type": "game_state"}

        await manager.broadcast(game_id, update)

        self.assertEqual(await self.receive(messages), update)
        self.assertNotIn(closed, manager.connections[game_id])
        self.assertFalse(manager.listener_task.done())

    async def test_analysis_results_use_the_same_redis_channel(self):
        manager = self.make_manager()
        game_id = uuid4()
        socket, messages = self.make_socket()
        await manager.connect(game_id, socket)
        result = {"type": "analysis_result", "result": {"score": 0}}

        await self.redis.publish(f"game:{game_id}", json.dumps(result))

        self.assertEqual(await self.receive(messages), result)
