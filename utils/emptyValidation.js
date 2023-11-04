
export const emptySignUpFields = (firstname, lastname, emailAddress, password) => {
    const fields = { 
        ['First Name']: firstname, 
        ['Last Name']: lastname, 
        ['Email']: emailAddress, 
        ['Password']: password
    };

    const invalidFields = {};
    for(const [ field, value ] of Object.entries(fields)) {
        if(!value) {
            const message = `${field} is empty`;
            const invalidField = field.toLowerCase()?.replace(/\s/g, '');
            invalidFields[invalidField] = message;
        }
    }

    return invalidFields;
}

export const emptySignInFields = (emailAddress, password) => {
    const fields = {
        ['Email']: emailAddress, 
        ['Password']: password
    };

    const invalidFields = {};
    for(const [ field, value ] of Object.entries(fields)) {
        if(!value) {
            const message = `${field} is empty`;
            const invalidField = field.toLowerCase()?.replace(/\s/g, '');
            invalidFields[invalidField] = message;
        }
    }

    return invalidFields;
}