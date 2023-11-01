
function splitPath(url, part) {
    const parts = url.split("/")
    if (part === -1){
        return parts[parts.length -1]
    }
    return parts[part];

}

module.exports = {
    splitPath
}