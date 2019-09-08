export const isAuthenticated = (allowedRoles) => {
	if (allowedRoles !== undefined && allowedRoles.length > 0) {
		return false;
	}
	return true;
}

export const getUserData = () => {
    return {
		role: "student"
	}
}