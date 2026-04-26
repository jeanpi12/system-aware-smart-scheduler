from sqlalchemy import text

from app.db.base import Base
from app.db.session import engine
import app.models  # noqa: F401


def init_db():
    Base.metadata.create_all(bind=engine)

    with engine.begin() as connection:
        connection.execute(
            text("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS owner_id INTEGER")
        )