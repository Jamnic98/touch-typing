from uuid import UUID
from typing import List, Optional
import strawberry
from strawberry.types import Info

from ...controllers.user_stats_controller import get_all_user_stats_sessions, get_user_stats_session_by_id
from ...controllers.users_controller import get_all_users
from ...models.user_model import User
from ...schemas.user_graphql import UserType
from ...schemas.user_stats_session_graphql import UserStatsSessionType


@strawberry.type
class UsersQuery:
    @strawberry.field()
    async def users(self, info: Info) -> List[UserType]:
        async_session_maker = info.context["db"]
        async with async_session_maker() as db:
            users = await get_all_users(db)
            return [
                UserType(
                    id=user.id,
                    user_name=user.user_name,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    email=user.email
                )
                for user in users
            ]

    @strawberry.field()
    async def user(self, info: Info, user_id: UUID) -> Optional[UserType]:
        async_session_maker = info.context["db"]
        async with async_session_maker() as db:
            user = await db.get(User, user_id)
            return UserType(
                id=user.id,
                user_name=user.user_name,
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
            ) if user else None

    @strawberry.field(name="userStatsSessions")
    async def user_stats_sessions(self, info: Info) -> list[UserStatsSessionType]:
        async_session_maker = info.context["db"]
        async with async_session_maker() as db:
            sessions = await get_all_user_stats_sessions(db)
            return [
                UserStatsSessionType(
                    id=session.id,
                    user_id=session.user_id,
                    wpm=session.wpm,
                    accuracy=session.accuracy,
                    practice_duration=session.practice_duration,
                    created_at=session.created_at,
                    ended_at=session.ended_at,
                )
                for session in sessions
            ]

    @strawberry.field()
    async def user_stats_session(self, info: Info, session_id: UUID) -> Optional[UserStatsSessionType]:
        async_session_maker = info.context["db"]
        async with async_session_maker() as db:
            session = await get_user_stats_session_by_id(db, session_id)
            if not session:
                return None
            return UserStatsSessionType(
                id=session.id,
                user_id=session.user_id,
                wpm=session.wpm,
                accuracy=session.accuracy,
                practice_duration=session.practice_duration,
                created_at=session.created_at,
                ended_at=session.ended_at,
            )
