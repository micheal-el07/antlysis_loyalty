const client = require("prom-client")

client.collectDefaultMetrics();

const httpDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
});

function metricsMiddleware(req, res, next) {
    const end = httpDuration.startTimer();
    res.on('finish', () => {
        end({ method: req.method, route: req.route?.path || req.path, status_code: res.statusCode });
    });
    next();
}

module.exports = { metricsMiddleware, register: client.register };