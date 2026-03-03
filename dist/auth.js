const API_KEY_HEADER = 'x-api-key';
export const apiKeyAuth = async (c, next) => {
    try {
        const configuredKey = process.env.MCP_API_KEY;
        if (!configuredKey) {
            // Dev mode: no auth enforced
            // eslint-disable-next-line no-console
            console.warn('[todo-mcp-server] MCP_API_KEY is not set; skipping API key auth.');
            await next();
            return;
        }
        const providedKey = c.req.header(API_KEY_HEADER);
        if (!providedKey || providedKey !== configuredKey) {
            return c.json({
                success: false,
                error: 'Unauthorized: invalid or missing API key.'
            }, 401);
        }
        await next();
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error('[todo-mcp-server] API key auth error:', error);
        return c.json({
            success: false,
            error: 'Internal authentication error.'
        }, 500);
    }
};
