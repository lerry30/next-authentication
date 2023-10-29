import bcrypt from 'bcryptjs';

export const toHash = async (enteredPassword) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(enteredPassword, salt);
}