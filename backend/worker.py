from core.config import get_settings


if __name__ == '__main__':
    from redis import Redis
    from rq import Worker

    settings = get_settings()
    redis = Redis.from_url(settings.redis_url)
    worker = Worker(['default'], connection=redis)
    worker.work()
