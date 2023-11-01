
function splitPath(url, part) {
    const parts = url.split("/")
    return parts[part];

}

module.exports = {
    splitPath
}