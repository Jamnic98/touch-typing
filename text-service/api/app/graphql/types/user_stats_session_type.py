from typing import Optional
from uuid import UUID

import strawberry

from ..types.digraph_type import DigraphInput
from ..types.unigraph_type import UnigraphInput


@strawberry.input
class UserStatsSessionUpdateInput:
    wpm: Optional[int] = None
    accuracy: Optional[float] = None
    practice_duration: Optional[int] = strawberry.field(name="practiceDuration", default=None)


@strawberry.input
class UnigraphStatisticInput:
    count: int
    accuracy: int


@strawberry.input
class DigraphStatisticInput:
    count: int
    accuracy: int


@strawberry.type
class UserStatsSessionType:
    id: UUID
    user_id: UUID = strawberry.field(name="userId")
    wpm: Optional[int]
    accuracy: Optional[float]
    error_count: Optional[int] = strawberry.field(name="errorCount", default=None)

    start_time: Optional[float] = strawberry.field(name="startTime", default=None)
    end_time: Optional[float] = strawberry.field(name="endTime", default=None)
    practice_duration: Optional[int] = strawberry.field(name="practiceDuration")

    corrected_char_count: Optional[int] = strawberry.field(name="correctedCharCount", default=None)
    deleted_char_count: Optional[int] = strawberry.field(name="deletedCharCount", default=None)
    total_char_count: Optional[int] = strawberry.field(name="correctCharsTyped", default=None)
    total_keystrokes: Optional[int] = strawberry.field(name="totalCharsTyped", default=None)
    error_char_count: Optional[int] = strawberry.field(name="errorCharCount", default=None)


@strawberry.input
class UserStatsSessionInput:
    wpm: Optional[int] = None
    accuracy: Optional[float] = None

    start_time: Optional[float] = strawberry.field(name="startTime", default=None)
    end_time: Optional[float] = strawberry.field(name="endTime", default=None)
    practice_duration: Optional[int] = strawberry.field(name="practiceDuration", default=None)

    corrected_char_count: Optional[int] = strawberry.field(name="correctedCharCount", default=None)
    deleted_char_count: Optional[int] = strawberry.field(name="deletedCharCount", default=None)
    total_char_count: Optional[int] = strawberry.field(name="correctCharsTyped", default=None)
    total_keystrokes: Optional[int] = strawberry.field(name="totalCharsTyped", default=None)
    error_char_count: Optional[int] = strawberry.field(name="errorCharCount", default=None)

    unigraphs: Optional[list[UnigraphInput]] = None
    digraphs: Optional[list[DigraphInput]] = None


@strawberry.input
class UnigraphStatEntryInput:
    key: str
    count: int
    accuracy: int


@strawberry.input
class DigraphStatEntryInput:
    key: str
    count: int
    accuracy: int
    mean_interval: int = strawberry.field(name="meanInterval")
