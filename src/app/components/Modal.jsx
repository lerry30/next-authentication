import { X } from 'lucide-react';
import { useRef } from 'react';

export const SuccessModal = ({ message, callback }) => {
    const modalRef = useRef();

    const closeModal = () => {
        modalRef.current.style.display = 'none';
        callback();
    }

    return (
        <div className="w-screen h-screen fixed top-0 left-0 bg-neutral-800/90 z-50 flex justify-center items-center backdrop-blur-sm" ref={ modalRef }>
            <div className="card p-16 bg-zinc-50 rounded-md shadow-lg shadow-black dark:bg-neutral-800 dark:border dark:border-emerald-500 dark:text-white flex flex-col">
                <article className="w-full relative">
                    <X 
                        onClick={ closeModal }
                        className="absolute top-[-20px] right-[-20px] cursor-pointer rounded-full hover:bg-neutral-800/30 dark:hover:bg-zinc-100/30" 
                    />
                </article>
                
                <h1 className="font-bold text-2xl ">Success!</h1>
                <p className="w-60 py-4 text-center text-neutral-500 dark:text-neutral-400">{ message }</p>
            </div>
        </div>
    );
}

export const ErrorModal = ({ message, callback }) => {
    const modalRef = useRef();

    const closeModal = () => {
        modalRef.current.style.display = 'none';
        callback();
    }

    return (
        <div className="w-screen h-screen fixed top-0 bg-neutral-800/90 z-50 flex justify-center items-center" ref={ modalRef }>
            <div className="card p-16 bg-zinc-50 rounded-md shadow-lg shadow-black border border-rose-700 dark:bg-neutral-800 dark:text-white flex flex-col">
                <article className="w-full relative">
                    <X 
                        onClick={ closeModal }
                        className="absolute top-[-20px] right-[-20px] cursor-pointer rounded-full hover:bg-neutral-800/30 dark:hover:bg-zinc-100/30" 
                    />
                </article>
                
                <h1 className="font-bold text-2xl text-rose-700 dark:text-white">Error!</h1>
                <p className="w-60 py-4 text-center text-neutral-500 dark:text-neutral-400">{ message }</p>
            </div>
        </div>
    );
}