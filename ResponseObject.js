class ResponseObject {
    constructor(response = null) {
        // Puedes pasar un valor predeterminado o null si no se proporciona en el constructor
        this._response = response;
    }

    // Getter para obtener el valor actual de response
    get response() {
        return this._response;
    }

}