// Общие утилиты для проекта
// Простая безопасная функция экранирования для вставки в HTML
(function(window){
    function escapeHtml(str) {
        if (str === undefined || str === null) {return '';}
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Доступно глобально как escapeHtml
    window.escapeHtml = escapeHtml;
})(window);
