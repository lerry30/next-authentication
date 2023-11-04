export const terminateAllHtmlTags = (str) => {
    return str.replace(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g, '');
}