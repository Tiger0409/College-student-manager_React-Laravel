export default class HtmlHelper {
    static encodeHtmlEntities(text) {
        var toReplace = {
            '<': '&lt;',
            '>': '&gt;'
        };

        return text.replace(/[<>]/g, function(entity) {
            return toReplace[entity] || entity;
        });
    }

    static unescapeHTML(html) {
        var escapeEl = document.createElement('textarea');
        escapeEl.innerHTML = html;
        return escapeEl.textContent;
    }
}