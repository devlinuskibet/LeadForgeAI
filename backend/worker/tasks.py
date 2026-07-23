from worker.celery_app import celery_app

@celery_app.task(name="worker.tasks.test_task")
def test_task(word: str) -> str:
    return f"Test task executed with {word}"
