const ERROR_CODES = {
    UNAUTHORIZED: {
        code: 401,
        message: 'User not authenticated',
    },
    EMAIL_EXISTS: {
        code: 422,
        message: 'Email is already in use',
    },
    EMAIL_OR_PASSWORD_INVALID: {
        code: 422,
        message: 'Email and password are required',
    },
    EMAIL_IS_REQUIRED: {
        code: 422,
        message: 'Email is required',
    },
    PASSWORD_IS_REQUIRED: {
        code: 422,
        message: 'Password is required',
    },
    USER_NOT_FOUND: {
        code: 404,
        message: 'User not found',
    },
    INTERNAL_SERVER_ERROR: {
        code: 500,
        message: 'Internal server error',
    },
    INVALID_TOKEN: {
        code: 401,
        message: 'Invalid token',
    },
    EMAIL_NOT_VERIFIED: {
        code: 403,
        message: 'Email not verified',
    },
    EMAIL_OR_OTP_INVALID: {
        code: 422,
        message: 'Email or OTP is invalid',
    },
    OTP_EXPIRED: {
        code: 410,
        message: 'OTP has expired',
    },
//     FRIENDS
    FRIEND_REQUEST_SENT: {
        code: 409,
        message: 'Friend request already sent',
    },
    FRIEND_REQUEST_NOT_FOUND: {
        code: 404,
        message: 'Friend request not found',
    },
    FRIEND_REQUEST_ACCEPTED: {
        code: 200,
        message: 'Friend request accepted successfully',
    },
    FRIEND_REQUEST_REJECTED: {
        code: 200,
        message: 'Friend request rejected successfully',
    },
    FRIEND_ALREADY_EXISTS: {
        code: 409,
        message: 'You are already friends with this user',
    },
    FRIEND_NOT_FOUND: {
        code: 404,
        message: 'Friend not found',
    },
}

module.exports = ERROR_CODES;