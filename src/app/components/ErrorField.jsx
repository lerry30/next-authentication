const ErrorField = ({ message }) => {
    return (
        <p 
            className={ `w-full text-[12px] text-rose-500` }
        >
            { message }
        </p>
    );
}

export default ErrorField