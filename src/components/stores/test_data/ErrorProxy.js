export default class ErrorProxy {
    getAsync(url) {
        throw ("Unsupported");
    }

    asyncPost(url) {
        throw ('Unsupported');
    }
}