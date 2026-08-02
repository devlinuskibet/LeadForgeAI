"""
SQLite-compatible replacements for PostgreSQL-specific SQLAlchemy types.

When running on SQLite (development/testing), PostgreSQL-specific types like
UUID(as_uuid=True) and JSONB are not available. This module provides
TypeDecorators that work transparently on both SQLite and PostgreSQL.
"""
import uuid
import json
from sqlalchemy import String, Text, types


class UUIDType(types.TypeDecorator):
    """
    A platform-independent UUID type.
    - On PostgreSQL: stored as a native UUID column.
    - On SQLite: stored as a 36-char VARCHAR string (hyphenated form).

    Always returns Python uuid.UUID objects when reading from DB,
    and accepts both uuid.UUID objects and UUID strings on write.
    """
    impl = String(36)
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            from sqlalchemy.dialects.postgresql import UUID as PG_UUID
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            if dialect.name == "postgresql":
                return value
            return str(value)
        # Already a string — normalise to lowercase hyphenated
        try:
            return str(uuid.UUID(str(value)))
        except (ValueError, AttributeError):
            return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return value
        try:
            return uuid.UUID(str(value))
        except (ValueError, AttributeError):
            return value


class JSONType(types.TypeDecorator):
    """
    A platform-independent JSON type.
    - On PostgreSQL: stored as JSONB.
    - On SQLite: stored as TEXT, serialised/deserialised transparently.
    """
    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            from sqlalchemy.dialects.postgresql import JSONB
            return dialect.type_descriptor(JSONB())
        return dialect.type_descriptor(Text())

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if dialect.name == "postgresql":
            return value  # JSONB handles it natively
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, (dict, list)):
            return value  # Already deserialised (PostgreSQL JSONB)
        try:
            return json.loads(value)
        except (TypeError, ValueError):
            return value
