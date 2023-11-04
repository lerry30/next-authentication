export const sendJSON = async (urlPath, payload) => {
    const res = await fetch(urlPath, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    const resPayload = await res.json();
    const message = resPayload?.message || 'Failed to fetch';

    if(!res.ok) throw new Error(message, { cause: { status: res.status, payload: resPayload } });

    return resPayload;
}

export const sendForm = async (urlPath, form) => {
    const res = await fetch(urlPath, {
        method: 'POST',
        body: form
    });

    const payload = await res.json();
    const message = payload?.message || 'Failed to fetch';

    if(!res.ok) throw new Error(message, { cause: { response: res, payload } });

    return payload;
}

export const getData = async (urlPath) => {
    const res = await fetch(urlPath);
    const payload = await res.json();
    const message = payload?.message || 'No response';

    if(!res.ok) throw new Error(message, { cause: { response: res, payload } });

    return payload;
}