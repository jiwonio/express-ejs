const responseHandler = () => (req, res, next) => {
    // Success
    res.success = function(message = 'Success', data = null) {
        return res.json({
            success: true,
            message,
            ...(data !== null && { data })
        });
    };

    // Error
    res.error = function(message = 'Error', status = 500, errors = null) {
        return res.status(status).json({
            success: false,
            message,
            ...(errors !== null && { errors })
        });
    };

    next();
};

module.exports = responseHandler;