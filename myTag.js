const myTags = document.getElementsByTagName('westmoon-viewer');
for(let el of myTags){
    const newEl = document.createElement('model-viewer');
    el.getAttributeNames().forEach(attr => {
        newEl.setAttribute(attr, el.getAttribute(attr))
    })
    el.replaceWith(newEl);
}