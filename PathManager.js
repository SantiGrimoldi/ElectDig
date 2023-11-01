
export function splitPath(url, part) {
    const urlObj = new URL(url)
    const parts = urlObj.pathname.split("/")
    return parts[part];

}