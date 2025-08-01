// middleware/responseHandler.js

const responseHandler = () => (req, res, next) => {
    // Success
    res.success = (message = 'Success', data = null) => {
        return res.json({
            success: true,
            message,
            ...(data !== null && { data })
        });
    };

    // Error
    res.error = (message = 'Error', status = 500, errors = null) => {
        return res.status(status).json({
            success: false,
            message,
            ...(errors !== null && { errors })
        });
    };

    next();
};

module.exports = responseHandler;