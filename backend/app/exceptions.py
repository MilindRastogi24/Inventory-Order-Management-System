class AppError(Exception):
    status_code: int = 400

    def __init__(self, message: str, code: str | None = None):
        self.message = message
        self.code = code
        super().__init__(message)


class NotFoundError(AppError):
    status_code = 404


class ConflictError(AppError):
    status_code = 409


class InsufficientStockError(AppError):
    status_code = 409
