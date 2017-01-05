var Algotype = {};

// The string beginning the comments of the algorithm declaration.
Algotype.ALGORITHM_HEADER_COMMENT_TAG = "#";

// The string beginning the step comments. 
Algotype.ALGORITHM_STEP_COMMENT_TAG = "##";

// The URL from which to download the MathJax math typesetting facilities.
Algotype.MATHJAX_SCRIPT_URL = 
    "https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_CHTML";
    
// Configuration for MathJax. This provides in the pseudocode macros for such
// keywords as 'and', 'or', 'not', and others, with the font that matches the 
// actual keywords, such as 'for each', 'repeat ... until', etc.
Algotype.MATHJAX_CONFIG =
        'MathJax.Hub.Config({' + 
        "tex2jax: {inlineMath: [['$','$']]}," +
        'TeX: {' + 
            'Macros: {' +
                'And:     "\\\\mathbf{and}",'    +
                'Or:      "\\\\mathbf{or}",'     +
                'Not:     "\\\\mathbf{not}",'    +
                'Is:      "\\\\mathbf{is}",'     +
                'In:      "\\\\mathbf{in}",'     +
                'Mapped:  "\\\\mathbf{mapped}"'  +
            '}' +
        '}' +
    '});';
    
Algotype.MATHJAX_CONFIG_MIME_TYPE = "text/x-mathjax-config";

Algotype.UNNAMED_ALGORITHM = "UnnamedAlgorithm";
    
Algotype.loadMathJax = function() {
    // Load the MathJax.
    var importedScript = document.createElement("script");
    importedScript.async = "true";
    importedScript.src = Algotype.MATHJAX_SCRIPT_URL;
    document.head.appendChild(importedScript);
    
    // Make MathJax process the configuration.
    var mathJaxSettingsScript = document.createElement("script");
    mathJaxSettingsScript.type = Algotype.MATHJAX_CONFIG_MIME_TYPE;
    mathJaxSettingsScript.innerHTML = Algotype.MATHJAX_CONFIG;
    document.head.appendChild(mathJaxSettingsScript);
};

Algotype.getAlgorithmParameterElements = function(algorithmElement) {
    var algorithmParameterElementList = [];
    var childElements = algorithmElement.childNodes;
    
    for (var i = 0; i < childElements.length; ++i) {
        var currentChildElement = childElements[i];
        
        if (currentChildElement.nodeName.toLowerCase() === "alg-parameter") {
            algorithmParameterElementList.push(currentChildElement);
        }
    }
    
    return algorithmParameterElementList;
};

Algotype.getParameterNames = function(algorithmParameterElements) {
    var parameterNameList = [];
    
    for (var i = 0; i < algorithmParameterElements.length; ++i) {
        parameterNameList.push(algorithmParameterElements[i].innerHTML);
    }
    
    return parameterNameList;
};

Algotype.getParameterListText = function(algorithmParameterNames) {
    var str = "(";
    var separator = "";
    
    for (var i = 0; i < algorithmParameterNames.length; ++i) {
        str += separator;
        str += algorithmParameterNames[i];
        separator = ", ";
    }
    
    return str + ")";
};

Algotype.getAlgorithmHeaderComment = function (algorithmElement) {
    var algorithmHeaderComment = 
            algorithmElement.getAttribute("comment");
    
    if (!algorithmHeaderComment) {
        return "";
    }
    
    return " " +
            Algotype.ALGORITHM_HEADER_COMMENT_TAG + 
            " " + algorithmHeaderComment;
};

Algotype.typesetAlgorithm = function(algorithmElement) {
    var algorithmName =
            algorithmElement.getAttribute("name") || Algotype.UNNAMED_ALGORITHM;
    
    var algorithmParameterElements = 
            Algotype.getAlgorithmParameterElements(algorithmElement);
    
    var algorithmParameterNames = 
            Algotype.getParameterNames(algorithmParameterElements);
    
    var parameterListText = 
            Algotype.getParameterListText(algorithmParameterNames);
    
    alert(parameterListText);
    
    var commentText = Algotype.getAlgorithmHeaderComment(algorithmElement);
    
    var parentNode = algorithmElement.parentNode;
    
    var htmlText = 
            "<span class='algotype-text algotype-algorithm-name'>" +
            algorithmName +
            "</span>$" + 
            parameterListText + 
            "$" +
            commentText +
            "<br/>";
    
    parentNode.innerHTML += htmlText;
};

Algotype.setup = function() {
    // Load MathJax.
    Algotype.loadMathJax();
    
    // Create the Algotype.js specific tags.
    document.registerElement("alg-algorithm");
    document.registerElement("alg-parameter");
    
    // Typeset all algorithms present in the DOM.
    var algorithmList = document.getElementsByTagName("alg-algorithm");
    
    for (var i = 0; i < algorithmList.length; ++i) {
        Algotype.typesetAlgorithm(algorithmList[i]);
    }
};

var oldOnloadHandler = window.onload;

window.onload = function() {
    if (oldOnloadHandler) {
        oldOnloadHandler();
    }
    
    Algotype.setup();
};