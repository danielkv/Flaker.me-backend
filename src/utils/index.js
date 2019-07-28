
function slugify(text) {
	text = text.trim().toLowerCase();

    text = text.replace(new RegExp('[ÁÀÂÃ][áàâã]','gi'), 'a');
    text = text.replace(new RegExp('[ÉÈÊ][éèê]','gi'), 'e');
    text = text.replace(new RegExp('[ÍÌÎ][íìî]','gi'), 'i');
    text = text.replace(new RegExp('[ÓÒÔÕ][óòôõ]','gi'), 'o');
    text = text.replace(new RegExp('[ÚÙÛ][úùû]','gi'), 'u');
	text = text.replace(new RegExp('[Ç][ç]','gi'), 'c');
	text = text.replace(new RegExp('[\(\)]', 'g'), '');
	
	text = text.replace(new RegExp(' - | ', 'g'), '-');
    return text;                 
}

module.exports = {
	slugify,
}