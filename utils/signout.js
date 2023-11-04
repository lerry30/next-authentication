const signout = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/users/signout`, { method: 'POST' });
    return !!response?.success;
}

export default signout;