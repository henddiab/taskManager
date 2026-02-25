exports.withAuth = (resolver) => {
    return (args, context) => {
        if (!context.userId) {
            throw new Error("Not authenticated");
        }

        return resolver(args, context);
    };
};

exports.withRole = (role, resolver) => {
    return (args, context) => {
        if (!context.userId) {
            throw new Error("Not authenticated");
        }

        if (context.role !== role) {
            throw new Error("Not authorized");
        }

        return resolver(args, context);
    };
};