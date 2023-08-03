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

function recursiveSectionsToSingleArray(s, rootFolder) {
    
    s.forEach((sElem, index) => {
        if (!sElem.folder) {
            sElem.folder = rootFolder+"/"+sElem.name;
        }
        if (sElem.sections) {
            sElem.sections.section = putDataArrayIfDataNotArray(sElem.sections.section);
            sElem.sections.section.forEach(element => {
                element.folder = sElem.folder+"/"+element.name;
            });
            //s = s.concat(sElem.sections.section);
            s = s.concat(recursiveSectionsToSingleArray(sElem.sections.section));
        }
    });
    return s;
}

function downloadFile(data, filename, format) {
    const csvData = 'data:text/'+format+';charset=utf-8,' + encodeURIComponent(data);
    const link = document.createElement('a');
    link.setAttribute('href', csvData);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function prettifyXml (xmlDoc) {
    var xsltDoc = new DOMParser().parseFromString([
        // describes how we want to modify the XML - indent everything
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
        '  <xsl:strip-space elements="*"/>',
        '  <xsl:template match="para[content-style][not(text())]">', // change to just text() to strip space in text nodes
        '    <xsl:value-of select="normalize-space(.)"/>',
        '  </xsl:template>',
        '  <xsl:template match="node()|@*">',
        '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
        '  </xsl:template>',
        '  <xsl:output indent="yes"/>',
        '</xsl:stylesheet>',
    ].join('\n'), 'application/xml');

    var xsltProcessor = new XSLTProcessor();    
    xsltProcessor.importStylesheet(xsltDoc);
    var resultDoc = xsltProcessor.transformToDocument(xmlDoc);
    var resultXml = new XMLSerializer().serializeToString(resultDoc);
    return resultXml;
};

function createElementWithData(xmlDocument, elemName, data) {
    var elem = xmlDocument.createElement(elemName);
    elemCDATA = xmlDocument.createCDATASection(data);
    elem.appendChild(elemCDATA);    
    return elem;
}

function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
  }