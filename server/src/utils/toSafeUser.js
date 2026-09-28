function toSafeUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

module.exports = toSafeUser;
