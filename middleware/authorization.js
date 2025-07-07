// middleware/authorization.js
// TODO: check permission
const { logger } = require("../modules/logger");

const authorization = (req, res, next) => {
    next();
};

module.exports = { authorization };