from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel
from datetime import datetime

T = TypeVar("T")

class APIEnvelope(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    message: str = "Operation completed successfully"
    error_code: Optional[str] = None
    timestamp: str

    @classmethod
    def success_response(cls, data: T, message: str = "Success") -> "APIEnvelope[T]":
        return cls(
            success=True,
            data=data,
            message=message,
            timestamp=datetime.utcnow().isoformat() + "Z"
        )

    @classmethod
    def error_response(cls, error_code: str, message: str, data: Optional[Any] = None) -> "APIEnvelope[Any]":
        return cls(
            success=False,
            data=data,
            message=message,
            error_code=error_code,
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
