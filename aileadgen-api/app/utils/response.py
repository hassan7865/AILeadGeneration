from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    status: str
    message: str
    data: T | None = None


def ok(data: T | None = None, message: str = "Success") -> ApiResponse[T]:
    return ApiResponse(status="success", message=message, data=data)
