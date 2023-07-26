function replaceTemplate( str, data ){
    var newStr = str;
    return newStr.replace(
        /%(\w*)%/g, 
        function( m, key ){
          return data.hasOwnProperty( key ) ? data[ key ] : "";
        }
      );
}

function putDataArrayIfDataNotArray(data) {
    if (!Array.isArray(data)) {
        return [data];
    }
    else {
        return data
    }
}

function recursiveSectionsToSingleArray(s) {
    s.forEach(sElem => {
        if (sElem.sections) {
            sElem.sections.section = putDataArrayIfDataNotArray(sElem.sections.section);
            
            //s = s.concat(sElem.sections.section);
            s = s.concat(recursiveSectionsToSingleArray(sElem.sections.section));
        }
    });
    return s;
}
