exports.withAuth = (resolver) => {
    return (parent, args, context) => {
        if (!context.userId) {
            throw new Error("Not authenticated");
        }

        return resolver(parent, args, context);
    };
};

exports.withRole = (role, resolver) => {
    return (parent, args, context) => {
        if (!context.userId) {
            throw new Error("Not authenticated");
        }

        if (context.role !== role) {
            throw new Error("Not authorized");
        }

        return resolver(parent, args, context);
    };
};