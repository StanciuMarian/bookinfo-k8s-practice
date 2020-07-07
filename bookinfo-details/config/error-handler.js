module.exports = func => async (req, res, next) => {
    try {
        await func(req, res, next);
    } catch (error) {
        res.status(500).send();
    }
};