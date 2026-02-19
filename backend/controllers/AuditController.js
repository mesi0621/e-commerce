const AuditService = require('../services/AuditService');

class AuditController {
    /**
     * Get audit logs with filters
     * GET /api/audit/logs
     */
    async getAuditLogs(req, res) {
        try {
            const { userId, action, result, resource, startDate, endDate, page, limit } = req.query;

            const filters = {};
            if (userId) filters.userId = userId;
            if (action) filters.action = action;
            if (result) filters.result = result;
            if (resource) filters.resource = resource;
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;

            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 50;

            const result_data = await AuditService.getAuditLogs(filters, pageNum, limitNum);

            res.status(200).json(result_data);
        } catch (error) {
            console.error('Error getting audit logs:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching audit logs',
                message: error.message
            });
        }
    }

    /**
     * Get audit logs for a specific user
     * GET /api/audit/logs/:userId
     */
    async getUserAuditLogs(req, res) {
        try {
            const { userId } = req.params;
            const { limit } = req.query;

            const limitNum = parseInt(limit) || 100;

            const logs = await AuditService.getUserAuditLogs(userId, limitNum);

            res.status(200).json({
                success: true,
                data: logs,
                count: logs.length
            });
        } catch (error) {
            console.error('Error getting user audit logs:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching user audit logs',
                message: error.message
            });
        }
    }

    /**
     * Get audit statistics
     * GET /api/audit/statistics
     */
    async getAuditStatistics(req, res) {
        try {
            const { startDate, endDate } = req.query;

            const filters = {};
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;

            const statistics = await AuditService.getAuditStatistics(filters);

            res.status(200).json(statistics);
        } catch (error) {
            console.error('Error getting audit statistics:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching audit statistics',
                message: error.message
            });
        }
    }

    /**
     * Get recent failed login attempts
     * GET /api/audit/failed-logins
     */
    async getFailedLogins(req, res) {
        try {
            const { minutes } = req.query;
            const minutesNum = parseInt(minutes) || 15;

            const logs = await AuditService.getRecentFailedLogins(minutesNum);

            res.status(200).json({
                success: true,
                data: logs,
                count: logs.length,
                timeWindow: `${minutesNum} minutes`
            });
        } catch (error) {
            console.error('Error getting failed logins:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching failed logins',
                message: error.message
            });
        }
    }
}

module.exports = new AuditController();
