/*
    This regex pattern requires at least one lowercase letter, one uppercase letter, 
    one digit, and one special character while also ensuring a minimum length of 8 
    characters.
*/
export const isAValidPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&_]{8,}$/;
    return regex.test(password);
};

export const missingRequirements = (password) => {
    const isLowercase = /[a-z]/.test(password);
    const isUppercase = /[A-Z]/.test(password);
    const isDigit = /\d/.test(password);
    const isSpecialChar = /[@$!%*?&_]/.test(password);
    const isLengthValid = password.length >= 8;
  
    const missing = [
        !isLowercase ? 'At least one lowercase letter. ' : '', // lowercase
        !isUppercase ? 'At least one uppercase letter. ' : '', // uppercase
        !isDigit ? 'At least one digit. ' : '', // digit
        !isSpecialChar ? 'At least one special character. ' : '', // specialChar
        !isLengthValid ? 'Minimum length of 8 characters. ': '', // minLength
    ];

    const requirements = missing.join('');
    if(!requirements) return 'Valid special characters @$!%*?&_';
    return `Requirements: ${requirements}`;
}