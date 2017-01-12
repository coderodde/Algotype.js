//// ////////////////////////////////////////////////////// ////
 // Algotype.js, version 1.6 by Rodion "(code)rodde" Efremov // 
////////////////////////////////////////////////////////////////

var Algotype = {};

// The string beginning the comments of the algorithm declaration.
Algotype.ALGORITHM_HEADER_COMMENT_TAG = "#";

// The string beginning the step comments. 
Algotype.ALGORITHM_STEP_COMMENT_TAG = "#";

// The width of code line numbers. This default works well. If you, however, 
// need to typeset an algorithm with at least 100 rows (in which case the space
// is tight) just increase this constant.
Algotype.LINE_NUMBER_WIDTH = 25;

// The indentation in pixels.
Algotype.INDENTATION_WIDTH = 30;

// Number of pixels between the line number span and the pseudocode span.
Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE = 8;

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
                'Mapped:  "\\\\mathbf{mapped}",' +
                'Nil:     "\\\\mathbf{nil}"'     +
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

Algotype.getAlgorithmParameterList = function(algorithmElement) {
    var algorithmParameterList = 
            algorithmElement.getAttribute("parameters") || "";
    
    algorithmParameterList = algorithmParameterList.trim();
    
    if (!algorithmParameterList) {
        return "$()$";
    }
    
    // Remove the beginning parenthesis, if present.
    if (algorithmParameterList[0] === "(") {
        algorithmParameterList = 
                algorithmParameterList.substring(1, 
                                                 algorithmParameterList.length);
    }
    
    // Remove the ending parenthesis, if present.
    if (algorithmParameterList[algorithmParameterList - 1] === ")") {
        algorithmParameterList.substring(0, algorithmParameterList.length - 1);
    }
    
    // Remove possible leading and trailing space within the parentheses.
    algorithmParameterList = algorithmParameterList.trim();
    
    // Split the string into parameter tokens.
    var algorithmParameters = algorithmParameterList.split(/\s*,\s*|\s+/);
    
    // Construct the TeX for the algorithm parameter list.
    var tex = "$(";
    var separator = "";
    
    for (var i = 0; i < algorithmParameters.length; ++i) {
        tex += separator;
        tex += algorithmParameters[i];
        separator = ", ";
    }
    
    return tex + ")$";
};

Algotype.getLabelHtml = function(state, label) {
    return "<table class='algotype-code-row-table'>\n" +
           "  <tbody class='algotype-code-row-tbody'\n" +
           "    <tr class='algotype-algorithm-line'>\n" +
           "      <td class='algotype-algorithm-line-number'></td>\n" +
           "      <td class='algotype-line-number-space' width='" + 
           (Algotype.INDENTATION_WIDTH * state["indentation"] +
            Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) +
           "px'></td>\n" + 
           "      <td class='algotype-label algotype-text'>" + label + 
           "</td>\n" +
           "    </tr>\n" +
           "  </tbody>\n" +
           "</table>\n";
};

Algotype.typesetIf = function(ifElement, state) {
    var conditionTeX = (ifElement.getAttribute("condition") || "").trim();
    conditionTeX = addTeXDelimeters(conditionTeX);
    
    var htmlText = "";
    var comment = ifElement.getAttribute("comment");
    var commentId = ifElement.getAttribute("comment-id");
    var idText = "";
    
    if (commentId) {
        idText = " id='" + commentId + "' ";
    }
    
    if (comment) {
        comment = " <span class='algotype-step-comment' " + idText + ">" +
                  Algotype.ALGORITHM_STEP_COMMENT_TAG + " " +
                  comment.trim() + "</span>";
    }
    
    var ifId = ifElement.getAttribute("id");
    var ifIdTextBegin = "";
    var ifIdTextEnd = "";
    
    if (ifId) {
        ifIdTextBegin = "<span id='" + ifId + "'>";
        ifIdTextEnd = "</span>";
    }
    
    htmlText += "<table class='algotype-code-row-table'>\n" +
                "  <tbody class='algotype-code-row-tbody'>\n" +
                "    <tr class='algotype-algorithm-line'>\n" +
                "      <td class='algotype-algorithm-line-number'>" +
                state["lineNumber"] +
                "      </td> " +
                "      <td class='algotype-line-number-space' width='" + 
                (Algotype.INDENTATION_WIDTH * state["indentation"] + 
                 Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) + 
                "px'></td>\n" +
                "      <td class='algotype-text algotype-keyword'>" +
                ifIdTextBegin + "if " + 
                conditionTeX + ":" + ifIdTextEnd + 
                (comment ? comment : "") +
                "      </td> " +
                "    </tr>\n" +
                "  </tbody>\n" +
                "</table>\n";
        
    var saveIndentation = state["indentation"];
    
    state["lineNumber"]++;
    state["indentation"]++;
    
    var childElements = ifElement.children;
    
    for (var i = 0; i < childElements.length; ++i) {
        var elementName = childElements[i].tagName.toLowerCase();
        var handlerFunction = Algotype.dispatchTable[elementName];
        
        if (handlerFunction) {
            htmlText += handlerFunction(childElements[i], state);
        } else {
            throw new Error("Unknown element: '" + elementName + "'.");
        }
    }
    
    // Reset the indentation counter.
    state["indentation"] = saveIndentation;
    return htmlText;
};

Algotype.typesetElseIf = function(elseIfElement, state) {
    var conditionTeX = (elseIfElement.getAttribute("condition") || "").trim();
    conditionTeX = addTeXDelimeters(conditionTeX);
    
    var htmlText = "";
    var comment = elseIfElement.getAttribute("comment");
    var commentId = elseIfElement.getAttribute("comment-id");
    var idText = "";
    
    if (commentId) {
        idText = " id='" + commentId + "' ";
    }
    
    if (comment) {
        comment = " <span class='algotype-step-comment' " + idText + ">" +
                  Algotype.ALGORITHM_STEP_COMMENT_TAG + " " +
                  comment.trim() + "</span>";
    }
    
    var elseIfId = elseIfElement.getAttribute("id");
    var elseIfIdTextBegin = "";
    var elseIfIdTextEnd = "";
    
    if (elseIfId) {
        elseIfIdTextBegin = "<span id='" + elseIfId + "'>";
        elseIfIdTextEnd = "</span>";
    }
    
    htmlText += "<table class='algotype-code-row-table'>\n" +
                "  <tbody class='algotype-code-row-tbody'>\n" +
                "    <tr class='algotype-algorithm-line'>\n" +
                "      <td class='algotype-algorithm-line-number'>" +
                state["lineNumber"] +
                "      </td> " +
                "      <td class='algotype-line-number-space' width='" + 
                (Algotype.INDENTATION_WIDTH * state["indentation"] + 
                 Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) + 
                "px'></td>\n" +
                "      <td class='algotype-text algotype-keyword'>" +
                elseIfIdTextBegin + "else if " + 
                conditionTeX + ":" + elseIfIdTextEnd + 
                (comment ? comment : "") +
                "      </td> " +
                "    </tr>\n" +
                "  </tbody>\n" +
                "</table>\n";
        
    var saveIndentation = state["indentation"];
    
    state["lineNumber"]++;
    state["indentation"]++;
    
    var childElements = elseIfElement.children;
    
    for (var i = 0; i < childElements.length; ++i) {
        var elementName = childElements[i].tagName.toLowerCase();
        var handlerFunction = Algotype.dispatchTable[elementName];
        
        if (handlerFunction) {
            htmlText += handlerFunction(childElements[i], state);
        } else {
            throw new Error("Unknown element: '" + elementName + "'.");
        }
    }
    
    // Reset the indentation counter.
    state["indentation"] = saveIndentation;
    return htmlText;
};

Algotype.typesetElse = function(elseElement, state) {
    var htmlText = "";
    var comment = elseElement.getAttribute("comment");
    var commentId = elseElement.getAttribute("comment-id");
    var idText = "";
    
    if (commentId) {
        idText = " id='" + commentId + "' ";
    }
    
    if (comment) {
        comment = " <span class='algotype-step-comment' " + idText + ">" +
                  Algotype.ALGORITHM_STEP_COMMENT_TAG + " " +
                  comment.trim() + "</span>";
    }
    
    var elseId = elseElement.getAttribute("id");
    var elseIdTextBegin = "";
    var elseIdTextEnd = "";
    
    if (elseId) {
        elseIdTextBegin = "<span id='" + elseId + "'>";
        elseIdTextEnd = "</span>";
    }
    
    htmlText += "<table class='algotype-code-row-table'>\n" +
                "  <tbody class='algotype-code-row-tbody'>\n" +
                "    <tr class='algotype-algorithm-line'>\n" +
                "      <td class='algotype-algorithm-line-number'>" +
                state["lineNumber"] +
                "      </td> " +
                "      <td class='algotype-line-number-space' width='" + 
                (Algotype.INDENTATION_WIDTH * state["indentation"] + 
                 Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) + 
                "px'></td>\n" +
                "      <td class='algotype-text algotype-keyword'>" +
                elseIdTextBegin + "else:" + elseIdTextEnd + 
                (comment ? comment : "") +
                "      </td> " +
                "    </tr>\n" +
                "  </tbody>\n" +
                "</table>\n";
        
    var saveIndentation = state["indentation"];
    
    state["lineNumber"]++;
    
    
    state["indentation"]++;
    
    var childElements = elseElement.children;
    
    for (var i = 0; i < childElements.length; ++i) {
        var elementName = childElements[i].tagName.toLowerCase();
        var handlerFunction = Algotype.dispatchTable[elementName];
        
        if (handlerFunction) {
            htmlText += handlerFunction(childElements[i], state);
        } else {
            throw new Error("Unknown element: '" + elementName + "'.");
        }
    }
    
    // Reset the indentation counter.
    state["indentation"] = saveIndentation;
    return htmlText;
};

Algotype.typesetStep = function(stepElement, state, isReturn) {
    var stepText = (stepElement.innerHTML || "").trim();
    var inTeX = false;
    var htmlText = "";
    var call = "";
    
    for (var i = 0; i < stepText.length; ++i) {
        var character = stepText[i];
        
        switch (character) {
            case '$':
                if (!inTeX) {
                    if (call) {
                        // Dump the current call.
                        htmlText += 
                            " <span " + 
                            "class='algotype-text algotype-algorithm-name'>" + 
                            call + 
                            "</span>";
                    
                        call = "";
                    }
                    
                    inTeX = true;
                } else {
                    inTeX = false;
                }
                
                htmlText += "$";
                break;
               
            default:
                
                if (inTeX) {
                    htmlText += character;
                } else {
                    call += character;
                }
        }
    }
    
    var comment = stepElement.getAttribute("comment") || "";
    var commentId = stepElement.getAttribute("comment-id");
    var idText = "";
    
    if (commentId) {
        idText = " id='" + commentId + "'";
    }
    
    if (comment) {
        comment = " <span class='algotype-step-comment'" + idText + ">" +
                  Algotype.ALGORITHM_STEP_COMMENT_TAG + " " +
                  comment.trim() + "</span>";
    }
    
    var returnHtml = "";
    
    if (isReturn === true) {
        returnHtml = "<span class='algotype-text algotype-keyword'>" +
                     "return</span> ";
    }
    
    var stepId = stepElement.getAttribute("id");
    var stepIdTextBegin = "";
    var stepIdTextEnd = "";
    
    if (stepId) {
        stepIdTextBegin = "<span id='" + stepId + "'>";
        stepIdTextEnd = "</span>";
    }
    
    htmlText = "<table class='algotype-code-row-table'>\n" + 
               "  <tbody class='algotype-code-row-tbody'>\n" +
               "    <tr class='algotype-algorithm-line'>\n" +
               "      <td class='algotype-algorithm-line-number'>" +
               state["lineNumber"] +
               "</td> " +
               "<td class='algotype-line-number-space' width='" +
               (Algotype.INDENTATION_WIDTH * state["indentation"] +
                Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) +
               "px'></td>" +
               "<td class='algotype-text'>" + 
               stepIdTextBegin + 
               returnHtml + 
               htmlText + stepIdTextEnd + comment +
               "</td>\n" +
               "    </tr>\n" +
               "  </tbody>\n" +
               "</table>\n";
       
    state["lineNumber"]++;
    return htmlText;
};

Algotype.typesetReturn = function(returnElement, state) {
    return Algotype.typesetStep(returnElement, state, true);
};

Algotype.typesetBreak = function(breakElement, state) {
    var comment = breakElement.getAttribute("comment") || "";
    var commentId = breakElement.getAttribute("comment-id");
    var idText = "";
    
    if (commentId) {
        idText = " id='" + commentId + "'";
    }
    
    if (comment) {
        comment = " <span class='algotype-step-comment'" + idText + ">" +
                  Algotype.ALGORITHM_STEP_COMMENT_TAG + " " +
                  comment.trim() + "</span>";
    }
    
    var label = breakElement.innerHTML;
    var breakId = breakElement.getAttribute("id");
    var breakIdTextBegin = "";
    var breakIdTextEnd = "";
    
    if (breakId) {
        breakIdTextBegin = "<span id='" + breakId + "'>";
        breakIdTextEnd = "</span>";
    }
    
    var htmlText = 
            "<table class='algotype-code-row-table'>\n" +
            "  <tbody class='algotype-code-row-tbody'>\n" +
            "    <tr class='algotype-algorithm-line'>\n" +
            "      <td class='algotype-algorithm-line-number'>" +
            state["lineNumber"] + "</td>\n" +
            "      <td class='algotype-line-number-space' width='" +
            (Algotype.INDENTATION_WIDTH * state["indentation"] +
             Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) +
            "px'></td>\n" +
            "      <td class='algotype-text algotype-keyword'>" +
            breakIdTextBegin + "break " +
            (label ? "<span class='algotype-label'>" + label + "</span>" : "") +
            breakIdTextEnd + comment +
            "</td>\n" +
            "    </tr>\n" +
            "  </tbody>\n" +
            "</table>\n";
    
    
    state["lineNumber"]++;
    return htmlText;
};

Algotype.typesetContinue = function(continueElement, state) {
    var comment = continueElement.getAttribute("comment") || "";
    var commentId = continueElement.getAttribute("comment-id") || "";
    var idText = "";
    
    if (commentId) {
        idText = " id='" + commentId + "'";
    }
    
    if (comment) {
        comment = " <span class='algotype-step-comment'" + idText + ">" + 
                  Algotype.ALGORITHM_STEP_COMMENT_TAG + " " + 
                  comment.trim() + "</span>";
    }
    
    var label = continueElement.innerHTML;
    var continueId = continueElement.getAttribute("id");
    var continueIdTextBegin = "";
    var continueIdTextEnd = "";
    
    if (continueId) {
        continueIdTextBegin = "<span id='" + continueId + "'>";
        continueIdTextEnd = "</span>";
    }
    
    var htmlText = "<table class='algotype-code-row-table'>\n" +
            "  <tbody class='algotype-code-row-tbody'>\n" +
            "    <tr class='algotype-algorithm-line'>\n" +
            "      <td class='algotype-algorithm-line-number'>" +
            state["lineNumber"] + "</td>\n" +
            "      <td class='algotype-line-number-space' width='" +
            (Algotype.INDENTATION_WIDTH * state["indentation"] +
             Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) +
            "px'></td>\n" +
            "      <td class='algotype-text algotype-keyword'>" +
            continueIdTextBegin + "continue " +
            (label ? "<span class='algotype-label'>" + label + "</span>" : "") +
            continueIdTextEnd + comment +
            "</td>\n" +
            "    </tr>\n" +
            "  </tbody>\n" +
            "</table>\n";
    
    
    state["lineNumber"]++;
    return htmlText;
};

Algotype.typesetForEach = function(forEachElement, state) {
    var conditionTeX = forEachElement.getAttribute("condition") || "";
    conditionTeX = conditionTeX.trim();
    
    if (conditionTeX[0] !== "$") {
        conditionTeX = "$" + conditionTeX;
    }
    
    if (conditionTeX[conditionTeX.length - 1] !== "$") {
        conditionTeX += "$";
    }
    
    var label = forEachElement.getAttribute("label");
    var htmlText = "";
    var comment = forEachElement.getAttribute("comment");
    var commentId = forEachElement.getAttribute("comment-id");
    var idText = "";
    
    if (commentId) {
        idText = " id='" + commentId + "' ";
    }
    
    if (comment) {
        comment = " <span class='algotype-step-comment' " + idText + ">" + 
                Algotype.ALGORITHM_STEP_COMMENT_TAG + " " +
                comment.trim() + "</span>";
    }
    
    if (label) {
        label = label.trim();
        
        if (label[label.length - 1] !== ":") {
            label += ":";
        }
        
        htmlText += Algotype.getLabelHtml(state, label);
    }
    
    var forEachId = forEachElement.getAttribute("id");
    var forEachIdTextBegin = "";
    var forEachIdTextEnd = "";
    
    if (forEachId) {
        forEachIdTextBegin = "<span id='" + forEachId +"'>";
        forEachIdTextEnd = "</span>";
    }
    
    htmlText += "<table class='algotype-code-row-table'>\n" +
                "  <tbody class='algotype-code-row-tbody'>\n" +
                "    <tr class='algotype-algorithm-line'>\n" +
                "      <td class='algotype-algorithm-line-number'>" +
                state["lineNumber"] +
                "      </td> " +
                "      <td class='algotype-line-number-space' width='" + 
                (Algotype.INDENTATION_WIDTH * state["indentation"] + 
                 Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) + 
                "px'></td>\n" +
                "      <td class='algotype-text algotype-keyword'>" +
                forEachIdTextBegin + "for each " + 
                conditionTeX + ":" + forEachIdTextEnd + 
                (comment ? comment : "") +
                "      </td> " +
                "    </tr>\n" +
                "  </tbody>\n" +
                "</table>\n";
        
    var saveIndentation = state["indentation"];
    
    state["lineNumber"]++;
    state["indentation"]++;
    
    var childElements = forEachElement.children;
    
    for (var i = 0; i < childElements.length; ++i) {
        var elementName = childElements[i].tagName.toLowerCase();
        var handlerFunction = Algotype.dispatchTable[elementName];
        
        if (handlerFunction) {
            htmlText += handlerFunction(childElements[i], state);
        } else {
            throw new Error("Unknown element: '" + elementName + "'.");
        }
    }
    
    // Reset the indentation counter.
    state["indentation"] = saveIndentation;
    return htmlText;
};

function addTeXDelimeters(code) {
    if (!code) {
        return "";
    }
    
    code = code.trim();
    
    if (code[0] !== "$") {
        code = "$" + code;
    }
    
    if (code[code.length - 1] !== "$") {
        code += "$";
    }
    
    return code;
}

Algotype.typesetFor = function(forElement, state) {
    var initConditionTeX = forElement.getAttribute("init") || "";
    var toConditionTeX = forElement.getAttribute("to") || "";
    var stepConditionTeX = forElement.getAttribute("step") || "";
    
    initConditionTeX = addTeXDelimeters(initConditionTeX);
    toConditionTeX = addTeXDelimeters(toConditionTeX);
    
    if (stepConditionTeX) {
        stepConditionTeX = addTeXDelimeters(stepConditionTeX);
    }
    
    var label = forElement.getAttribute("label");
    var htmlText = "";
    var comment = forElement.getAttribute("comment");
    var commentId = forElement.getAttribute("comment-id");
    var idText = "";
    var stepText = "";
    
    if (stepConditionTeX) {
        stepText = " step " + stepConditionTeX;
    }
    
    if (commentId) {
        idText = "id='" + commentId + "' ";
    }
    
    if (comment) {
        comment = " <span class='algotype-step-comment' " + idText + ">" +
                Algotype.ALGORITHM_STEP_COMMENT_TAG + " " +
                comment.trim() + "</span>";
    }
    
    if (label) {
        label = label.trim();
        
        if (label[label.length - 1] !== ":") {
            label += ":";
        }
        
        htmlText += Algotype.getLabelHtml(state, label);
    }
    
    var forId = forElement.getAttribute("id");
    var forIdTextBegin = "";
    var forIdTextEnd = "";
    
    if (forId) {
        forIdTextBegin = "<span id='" + forId + "'>";
        forIdTextEnd = "</span>";
    }
    
    htmlText += "<table class='algotype-code-row-table'>\n" +
                "  <tbody class='algotype-code-row-tbody'>\n" +
                "    <tr class='algotype-algorithm-line'>\n" +
                "      <td class='algotype-algorithm-line-number'>" +
                state["lineNumber"] +
                "      </td> " +
                "      <td class='algotype-line-number-space' width='" + 
                (Algotype.INDENTATION_WIDTH * state["indentation"] + 
                 Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) + 
                "px'></td>\n" +
                "      <td class='algotype-text algotype-keyword'>" +
                forIdTextBegin + "for " + 
                initConditionTeX + " to " + toConditionTeX + stepText + ":" + 
                forIdTextEnd +
                (comment ? comment : "") +
                "      </td> " +
                "    </tr>\n" +
                "  </tbody>\n" +
                "</table>\n";
        
    var saveIndentation = state["indentation"];
    
    state["lineNumber"]++;
    state["indentation"]++;
    
    var childElements = forElement.children;
    
    for (var i = 0; i < childElements.length; ++i) {
        var elementName = childElements[i].tagName.toLowerCase();
        var handlerFunction = Algotype.dispatchTable[elementName];
        
        if (handlerFunction) {
            htmlText += handlerFunction(childElements[i], state);
        } else {
            throw new Error("Unknown element: '" + elementName + "'.");
        }
    }
    
    // Reset the indentation counter.
    state["indentation"] = saveIndentation;
    return htmlText;
};

Algotype.typesetForDownto = function(forDowntoElement, state) {
    var initConditionTeX = forDowntoElement.getAttribute("init") || "";
    var toConditionTeX   = forDowntoElement.getAttribute("to")   || "";
    var stepConditionTeX = forDowntoElement.getAttribute("step") || "";
    
    initConditionTeX = addTeXDelimeters(initConditionTeX);
    toConditionTeX   = addTeXDelimeters(toConditionTeX);
    
    if (stepConditionTeX) {
        stepConditionTeX = addTeXDelimeters(stepConditionTeX);
    }
    
    var label = forDowntoElement.getAttribute("label");
    var htmlText = "";
    var comment = forDowntoElement.getAttribute("comment");
    var commentId = forDowntoElement.getAttribute("comment-id");
    var idText = "";
    var stepText = "";
    
    if (stepConditionTeX) {
        stepText = " step " + stepConditionTeX;
    }
    
    if (commentId) {
        idText = "id='" + commentId + "' ";
    }
    
    if (comment) {
        comment = " <span class='algotype-step-comment' " + idText + ">" +
                  Algotype.ALGORITHM_STEP_COMMENT_TAG + " " +
                  comment.trim() + "</span>";
    }
    
    if (label) {
        label = label.trim();
        
        if (label[label.length - 1] !== ":") {
            label += ":";
        }
        
        htmlText += Algotype.getLabelHtml(state, label);
    }
    
    var forDowntoId = forDowntoElement.getAttribute("id");
    var forDowntoTextBegin = "";
    var forDowntoTextEnd = "";
    
    if (forDowntoId) {
        forDowntoTextBegin = "<span id='" + forDowntoId + "'>";
        forDowntoTextEnd = "</span>";
    }
    
    htmlText += "<table class='algotype-code-row-table'>\n" +
                "  <tbody class='algotype-code-row-tbody'>\n" +
                "    <tr class='algotype-algorithm-line'>\n" +
                "      <td class='algotype-algorithm-line-number'>" +
                state["lineNumber"] +
                "      </td> " +
                "      <td class='algotype-line-number-space' width='" + 
                (Algotype.INDENTATION_WIDTH * state["indentation"] + 
                 Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) + 
                "px'></td>\n" +
                "      <td class='algotype-text algotype-keyword'>" + 
                forDowntoTextBegin + "for " +
                initConditionTeX + " downto " + toConditionTeX + stepText + 
                ":" + 
                forDowntoTextEnd +
                (comment ? comment : "") +
                "      </td> " +
                "    </tr>\n" +
                "  </tbody>\n" +
                "</table>\n";
        
    var saveIndentation = state["indentation"];
    
    state["lineNumber"]++;
    state["indentation"]++;
    var childElements = forDowntoElement.children;
    
    for (var i = 0; i < childElements.length; ++i) {
        var elementName = childElements[i].tagName.toLowerCase();
        var handlerFunction = Algotype.dispatchTable[elementName];
        
        if (handlerFunction) {
            htmlText += handlerFunction(childElements[i], state);
        } else {
            throw new Error("Unknown element: '" + elementName + "'.");
        }
    }
    
    // Reset the indentation counter.
    state["indentation"] = saveIndentation;
    return htmlText;
};

Algotype.typesetForever = function(foreverElement, state) {
    var label = foreverElement.getAttribute("label");
    var htmlText = "";
    var comment = foreverElement.getAttribute("comment");
    var commentId = foreverElement.getAttribute("comment-id");
    var idText = "";
    
    if (commentId) {
        idText = "id='" + commentId + "' ";
    }
    
    if (comment) {
        comment = " <span class='algotype-step-comment' " + idText + ">" +
                Algotype.ALGORITHM_STEP_COMMENT_TAG + " " +
                comment.trim() + "</span>";
    }
    
    if (label) {
        label = label.trim();
        
        if (label[label.length - 1] !== ":") {
            label += ":";
        }
        
        htmlText += Algotype.getLabelHtml(state, label);
    }
    
    var foreverId = foreverElement.getAttribute("id");
    var foreverIdTextBegin = "";
    var foreverIdTextEnd = "";
    
    if (foreverId) {
        foreverIdTextBegin = "<span id='" + foreverId + "'>";
        foreverIdTextEnd = "</span>";
    }
    
    htmlText += "<table class='algotype-code-row-table'>\n" +
                "  <tbody class='algotype-code-row-tbody'>\n" +
                "    <tr class='algotype-algorithm-line'>\n" +
                "      <td class='algotype-algorithm-line-number'>" +
                state["lineNumber"] +
                "      </td> " +
                "      <td class='algotype-line-number-space' width='" + 
                (Algotype.INDENTATION_WIDTH * state["indentation"] + 
                 Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) + 
                "px'></td>\n" +
                "      <td class='algotype-text algotype-keyword'>" +
                foreverIdTextBegin + "forever:" + foreverIdTextEnd +
                (comment ? comment : "") +
                "      </td> " +
                "    </tr>\n" +
                "  </tbody>\n" +
                "</table>\n";
        
    var saveIndentation = state["indentation"];
    
    state["lineNumber"]++;
    state["indentation"]++;
    
    var childElements = foreverElement.children;
    
    for (var i = 0; i < childElements.length; ++i) {
        var elementName = childElements[i].tagName.toLowerCase();
        var handlerFunction = Algotype.dispatchTable[elementName];
        
        if (handlerFunction) {
            htmlText += handlerFunction(childElements[i], state);
        } else {
            throw new Error("Unknown element: '" + elementName + "'.");
        }
    }
    
    // Reset the indentation counter.
    state["indentation"] = saveIndentation;   
    return htmlText;
};

Algotype.typesetWhile = function(whileElement, state) {
    var conditionTeX = (whileElement.getAttribute("condition") || "").trim();
    
    conditionTeX = addTeXDelimeters(conditionTeX);
    
    var label = whileElement.getAttribute("label");
    var htmlText = "";
    var comment = whileElement.getAttribute("comment");
    var commentId = whileElement.getAttribute("comment-id");
    var idText = "";
    
    if (commentId) {
        idText = " id='" + commentId + "' ";
    }
    
    if (comment) {
        comment = " <span class='algotype-step-comment' " + idText + ">" +
                  Algotype.ALGORITHM_STEP_COMMENT_TAG + " " + 
                  comment.trim() + "</span>";
    }
    
    if (label) {
        label = label.trim();
        
        if (label[label.length - 1] !== ":") {
            label += ":";
        }
        
        htmlText += Algotype.getLabelHtml(state, label);
    }
    
    var whileId = whileElement.getAttribute("id");
    var whileIdTextBegin = "";
    var whileIdTextEnd = "";
    
    if (whileId) {
        whileIdTextBegin = "<span id='" + whileId + "'>";
        whileIdTextEnd = "</span>";
    }
    
    htmlText += "<table class='algotype-code-row-table'>\n" +
                "  <tbody class='algotype-code-row-tbody'>\n" +
                "    <tr class='algotype-algorithm-line'>\n" +
                "      <td class='algotype-algorithm-line-number'>" +
                state["lineNumber"] +
                "      </td> " +
                "      <td class='algotype-line-number-space' width='" + 
                (Algotype.INDENTATION_WIDTH * state["indentation"] + 
                 Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) + 
                "px'></td>\n" +
                "      <td class='algotype-text algotype-keyword'>" +
                whileIdTextBegin + "while " + 
                conditionTeX + ":" + whileIdTextEnd + 
                (comment ? comment : "") +
                "      </td> " +
                "    </tr>\n" +
                "  </tbody>\n" +
                "</table>\n";
        
    var saveIndentation = state["indentation"];
    
    state["lineNumber"]++;
    state["indentation"]++;
    
    var childElements = whileElement.children;
    
    for (var i = 0; i < childElements.length; ++i) {
        var elementName = childElements[i].tagName.toLowerCase();
        var handlerFunction = Algotype.dispatchTable[elementName];
        
        if (handlerFunction) {
            htmlText += handlerFunction(childElements[i], state);
        } else {
            throw new Error("Unknown element: '" + elementName + "'.");
        }
    }
    
    // Reset the indentation counter.
    state["indentation"] = saveIndentation;
    return htmlText;
};

Algotype.typesetRepeatUntil = function(repeatUntilElement, state) {
    var conditionTeX = 
            (repeatUntilElement.getAttribute("condition") || "").trim();
    
    conditionTeX = addTeXDelimeters(conditionTeX);
    
    var label = repeatUntilElement.getAttribute("label");
    var htmlText = "";
    var comment = repeatUntilElement.getAttribute("comment");
    var commentId = repeatUntilElement.getAttribute("comment-id");
    var idText = "";
    
    if (commentId) {
        idText = " id='" + commentId + "' ";
    }
    
    if (comment) {
        comment = " <span class='algotype-step-comment' " + idText + ">" +
                  Algotype.ALGORITHM_STEP_COMMENT_TAG + " " +
                  comment.trim() + "</span>";
    }
    
    if (label) {
        label = label.trim();
        
        if (label[label.length - 1] !== ":") {
            label += ":";
        }
        
        htmlText += Algotype.getLabelHtml(state, label);
    }
    
    var repeatUntilId = repeatUntilElement.getAttribute("id");
    var repeatUntilIdTextBegin = "";
    var repeatUntilIdTextEnd = "";
    
    if (repeatUntilId) {
        repeatUntilIdTextBegin = "<span id='" + repeatUntilId + "'>";
        repeatUntilIdTextEnd = "</span>";
    }
    
    htmlText += "<table class='algotype-code-row-table'>\n" +
                "  <tbody class='algotype-code-row-tbody'>\n" +
                "    <tr class='algotype-algorithm-line'>\n" +
                "      <td class='algotype-algorithm-line-number'>" +
                state["lineNumber"] +
                "      </td> " +
                "      <td class='algotype-line-number-space' width='" + 
                (Algotype.INDENTATION_WIDTH * state["indentation"] + 
                 Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) + 
                "px'></td>\n" +
                "      <td class='algotype-text algotype-keyword'>" +
                repeatUntilIdTextBegin + "repeat" + repeatUntilIdTextEnd + 
                "      </td> " +
                "    </tr>\n" +
                "  </tbody>\n" +
                "</table>\n";
        
    var saveIndentation = state["indentation"];
    
    state["lineNumber"]++;
    state["indentation"]++;
    
    var childElements = repeatUntilElement.children;
    
    for (var i = 0; i < childElements.length; ++i) {
        var elementName = childElements[i].tagName.toLowerCase();
        var handlerFunction = Algotype.dispatchTable[elementName];
        
        if (handlerFunction) {
            htmlText += handlerFunction(childElements[i], state);
        } else {
            throw new Error("Unknown element: '" + elementName + "'.");
        }
    }
    
    // Reset the indentation counter.
    state["indentation"] = saveIndentation;
    
    htmlText += "<table class='algotype-code-row-table'>\n" +
                "  <tbody class='algotype-code-row-tbody'>\n" +
                "    <tr class='algotype-algorithm-line'>\n" +
                "      <td class='algotype-algorithm-line-number'>" +
                state["lineNumber"] +
                "      </td> " +
                "      <td class='algotype-line-number-space' width='" + 
                (Algotype.INDENTATION_WIDTH * state["indentation"] + 
                 Algotype.DISTANCE_BETWEEN_LINE_NUMBER_AND_CODE) + 
                "px'></td>\n" +
                "      <td class='algotype-text algotype-keyword'>" +
                repeatUntilIdTextBegin + "until " + 
                conditionTeX + repeatUntilIdTextEnd + 
                (comment ? comment : "") +
                "      </td> " +
                "    </tr>\n" +
                "  </tbody>\n" +
                "</table>\n";
    
    state["lineNumber"]++;
    return htmlText;
};

Algotype.typesetAlgorithm = function(algorithmElement) {
    var algorithmName =
            algorithmElement.getAttribute("name") || Algotype.UNNAMED_ALGORITHM;
    
    var algorithmParameterList = 
            Algotype.getAlgorithmParameterList(algorithmElement);
    
    var commentText = Algotype.getAlgorithmHeaderComment(algorithmElement);
    
    var parentNode = algorithmElement.parentNode;

    var htmlText = 
            "<span class='algotype-text algotype-algorithm-name'>" +
            algorithmName +
            "</span><span class='algotype-text'>" + algorithmParameterList + 
            commentText +
            "</span><br/>";
    
    var childElements = algorithmElement.children;
    
    var state = {
        lineNumber: 1,
        indentation: 0
    };
    
    for (var i = 0; i < childElements.length; ++i) {
        var elementName = childElements[i].tagName.toLowerCase();
        var handlerFunction = Algotype.dispatchTable[elementName];
        
        if (handlerFunction) {
            htmlText += handlerFunction(childElements[i], state);
        } else {
            throw new Error("Unknown element: '" + elementName + "'.");
        }
    }
    
    var paragraphElement = document.createElement("p");
    paragraphElement.style.textAlign = "left";
    paragraphElement.innerHTML = htmlText;
    parentNode.appendChild(paragraphElement);
};

Algotype.setup = function() {
    // Load MathJax.
    Algotype.loadMathJax();
    
    // Create the Algotype.js specific tags.
    document.registerElement("alg-algorithm");
    document.registerElement("alg-foreach");
    document.registerElement("alg-for");
    document.registerElement("alg-for-downto");
    document.registerElement("alg-forever");
    document.registerElement("alg-if");
    document.registerElement("alg-elseif");
    document.registerElement("alg-else");
    document.registerElement("alg-step");
    document.registerElement("alg-return");
    document.registerElement("alg-break");
    document.registerElement("alg-continue");
    
    // Typeset all algorithms present in the DOM.
    var algorithmList = document.getElementsByTagName("alg-algorithm");
    
    for (var i = 0; i < algorithmList.length; ++i) {
        Algotype.typesetAlgorithm(algorithmList[i]);
    }
};

Algotype.dispatchTable = {};

Algotype.dispatchTable["alg-foreach"]      = Algotype.typesetForEach;
Algotype.dispatchTable["alg-for"]          = Algotype.typesetFor;
Algotype.dispatchTable["alg-for-downto"]   = Algotype.typesetForDownto;
Algotype.dispatchTable["alg-forever"]      = Algotype.typesetForever;
Algotype.dispatchTable["alg-while"]        = Algotype.typesetWhile;
Algotype.dispatchTable["alg-repeat-until"] = Algotype.typesetRepeatUntil;
Algotype.dispatchTable["alg-if"]           = Algotype.typesetIf;
Algotype.dispatchTable["alg-else-if"]      = Algotype.typesetElseIf;
Algotype.dispatchTable["alg-else"]         = Algotype.typesetElse;
Algotype.dispatchTable["alg-step"]         = Algotype.typesetStep;
Algotype.dispatchTable["alg-return"]       = Algotype.typesetReturn;
Algotype.dispatchTable["alg-break"]        = Algotype.typesetBreak;
Algotype.dispatchTable["alg-continue"]     = Algotype.typesetContinue;

var oldOnloadHandler = window.onload;

window.onload = function() {
    if (oldOnloadHandler) {
        oldOnloadHandler();
    }
    
    Algotype.setup();
};