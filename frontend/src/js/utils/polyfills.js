if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(pattern) {
        var d = this.length - pattern.length;
        return d >= 0 && this.lastIndexOf(pattern) === d;
    };
}