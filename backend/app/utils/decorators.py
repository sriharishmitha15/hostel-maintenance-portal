"""
Custom authorization decorators for Role-Based Access Control (RBAC).
"""
from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from app.utils.response_helpers import error_response

def role_required(*allowed_roles):
    """
    Decorator to restrict endpoint access to specific user roles.
    Example: @role_required('admin', 'staff')
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role")
            
            if not user_role or user_role not in allowed_roles:
                return error_response(
                    message=f"Access forbidden: requires one of the following roles: {list(allowed_roles)}",
                    status_code=403
                )
            return fn(*args, **kwargs)
        return decorator
    return wrapper
