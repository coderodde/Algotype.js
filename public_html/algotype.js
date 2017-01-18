//// ////////////////////////////////////////////////////// ////
 // Algotype.js, version 1.61 by Rodion "(code)rodde" Efremov // 
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
            '},' +
            'extensions: ["color.js"]' +
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
    if (algorithmParameterList[algorithmParameterList.length - 1] === ")") {
        algorithmParameterList =
                algorithmParameterList
                .substring(0, algorithmParameterList.length - 1);
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

Algotype.typesetConditionalBranch = function(element, state, keyword) {
    var conditionTeX = 
            Algotype.typesetCondition(element.getAttribute("condition"));
    
    var htmlText = "";
    var comment = element.getAttribute("comment");
    var commentId = (element.getAttribute("comment-id") || "").trim();
    var idText = "";
    
    if (commentId) {
        idText = " id='" + commentId + "' ";
    }
    
    if (comment) {
        comment = " <span class='algotype-step-comment' " + idText + ">" +
                  Algotype.ALGORITHM_STEP_COMMENT_TAG + " " + 
                  comment.trim() + "</span>";
    }
    
    var id = (element.getAttribute("id") || "").trim();
    var idTextBegin = "";
    var idTextEnd = "";
    
    if (id) {
        idTextBegin = "<span id='" + id + "'>";
        idTextEnd = "</span>";
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
                idTextBegin + keyword + " " + 
                conditionTeX + " then" + idTextEnd + 
                (comment ? comment : "") +
                "      </td> " +
                "    </tr>\n" +
                "  </tbody>\n" +
                "</table>\n";
        
    var saveIndentation = state["indentation"];
    state["lineNumber"]++;
    state["indentation"]++;
    htmlText += Algotype.processInnerElements(element, state);
    
    // Reset the indentation counter.
    state["indentation"] = saveIndentation;
    return htmlText;
};

Algotype.typesetIf = function(ifElement, state) {
    return Algotype.typesetConditionalBranch(ifElement, state, "if");
};

Algotype.typesetElseIf = function(elseIfElement, state) {
    return Algotype.typesetConditionalBranch(elseIfElement, state, "else if");
};

Algotype.typesetElse = function(elseElement, state) {
    return Algotype.typesetUnconditionalBlock(elseElement, state, "else");
};

Algotype.typesetCondition = function(conditionText) {
    if (!conditionText) {
        return "";
    }
    
    conditionText = conditionText.trim();
    
    if (!conditionText) {
        return "";
    }
    
    var inTeX = false;
    var htmlText = "";
    var call = "";
    
    for (var i = 0; i < conditionText.length; ++i) {
        var character = conditionText[i];
        
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
    
    if (call) {
        htmlText += " <span class='algotype-text algotype-algorithm-name'>" +
                    call +
                    "</span>";
    }
    
    return htmlText;
};

Algotype.typesetStep = function(stepElement, state, keyword) {
    if (!keyword) {
        keyword = "";
    }
    
    var htmlText = Algotype.typesetCondition(stepElement.innerHTML || "");
    var comment = stepElement.getAttribute("comment") || "";
    var commentId = (stepElement.getAttribute("comment-id") || "").trim();
    var idText = "";
    
    if (commentId) {
        idText = " id='" + commentId + "'";
    }
    
    if (comment) {
        comment = " <span class='algotype-step-comment'" + idText + ">" +
                  Algotype.ALGORITHM_STEP_COMMENT_TAG + " " +
                  comment.trim() + "</span>";
    }
    
    var keywordHtml = "<span class='algotype-text algotype-keyword'>" +
                      keyword +
                      "</span>";
              
    var stepId = (stepElement.getAttribute("id") || "").trim();
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
               stepIdTextBegin + keywordHtml + " " + htmlText + stepIdTextEnd + 
               comment +
               "</td>\n" +
               "    </tr>\n" +
               "  </tbody>\n" +
               "</table>\n";
       
    state["lineNumber"]++;
    return htmlText;
};

Algotype.typesetReturn = function(returnElement, state) {
    return Algotype.typesetStep(returnElement, state, "return");
};

Algotype.typesetPrint = function(printElement, state) {
    return Algotype.typesetStep(printElement, state, "print");
};

Algotype.typesetOutput = function(outputElement, state) {
    return Algotype.typesetStep(outputElement, state, "output");
};

Algotype.typesetYield = function(yieldElement, state) {
    return Algotype.typesetStep(yieldElement, state, "yield");
};

Algotype.typesetLabelControl = function(element, state, keyword) {
    var comment = element.getAttribute("comment") || "";
    var commentId = (element.getAttribute("comment-id") || "").trim();
    var idText = "";
    
    if (commentId) {
        idText = " id='" + commentId + "'";
    }
    
    if (comment) {
        comment = " <span class='algotype-step-comment'" + idText + ">" +
                  Algotype.ALGORITHM_STEP_COMMENT_TAG + " " + 
                  comment.trim() + "</span>";
    }
    
    var label = element.innerHTML;
    var elementId = (element.getAttribute("id") || "").trim();
    var elementIdTextBegin = "";
    var elementIdTextEnd = "";
    
    if (elementId) {
        elementIdTextBegin = "<span id='" + elementId + "'>";
        elementIdTextEnd = "</span>";
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
            elementIdTextBegin + keyword + " " +
            (label ? "<span class='algotype-label'>" + label + "</span>" : "") +
            elementIdTextEnd + comment +
            "</td>\n" +
            "    </tr>\n" +
            "  </tbody>\n" +
            "</table>\n";
    
    state["lineNumber"]++;
    return htmlText;
            
};

Algotype.typesetBreak = function(breakElement, state) {
    return Algotype.typesetLabelControl(breakElement, state, "break");
};

Algotype.typesetContinue = function(continueElement, state) {
    return Algotype.typesetLabelControl(continueElement, state, "continue");
};

Algotype.typesetConditionalLoop = function(element, state, keyword) {
    var conditionTeX = 
            Algotype.typesetCondition(element.getAttribute("condition"));
    
    if (conditionTeX[0] !== "$") {
        conditionTeX = "$" + conditionTeX;
    }
    
    if (conditionTeX[conditionTeX.length - 1] !== "$") {
        conditionTeX += "$";
    }
    
    var label = element.getAttribute("label");
    var htmlText = "";
    var comment = element.getAttribute("comment");
    var commentId = (element.getAttribute("comment-id") || "").trim();
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
    
    var id = (element.getAttribute("id") || "").trim();
    var idTextBegin = "";
    var idTextEnd = "";
    
    if (id) {
        idTextBegin = "<span id='" + id + "'>";
        idTextEnd = "</span>";
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
                idTextBegin + keyword + " " + 
                conditionTeX + ":" + idTextEnd + 
                (comment ? comment : "") +
                "      </td> " +
                "    </tr>\n" +
                "  </tbody>\n" +
                "</table>\n";
        
    var saveIndentation = state["indentation"];
    state["lineNumber"]++;
    state["indentation"]++;
    htmlText += Algotype.processInnerElements(element, state);
    
    // Reset the indentation counter.
    state["indentation"] = saveIndentation;
    return htmlText;
};

Algotype.typesetForEach = function(forEachElement, state) {
    return Algotype.typesetConditionalLoop(forEachElement, state, "for each");
};

Algotype.typesetWhile = function(whileElement, state) {
    return Algotype.typesetConditionalLoop(whileElement, state, "while");
};

Algotype.typesetCountingLoop = function(element, 
                                        state, 
                                        fromKeyword, 
                                        toKeyword,
                                        stepKeyword) {
    var initConditionTeX = 
            Algotype.typesetCondition(element.getAttribute("init"));
    
    var toConditionTeX = 
            Algotype.typesetCondition(element.getAttribute("to"));
    
    var stepConditionTeX = 
            Algotype.typesetCondition(element.getAttribute("step"));
    
    var label = element.getAttribute("label");
    var htmlText = "";
    var comment = element.getAttribute("comment");
    var commentId = (element.getAttribute("comment-id") || "").trim();
    var idText = "";
    var stepText = "";
    
    if (stepConditionTeX) {
        stepText = " " + stepKeyword + " " + stepConditionTeX;
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
    
    var id = (element.getAttribute("id") || "").trim();
    var idTextBegin = "";
    var idTextEnd = "";
    
    if (id) {
        idTextBegin = "</span id='" + id + "'>";
        idTextEnd = "</span>";
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
                idTextBegin + fromKeyword + " " +  
                initConditionTeX + " " + toKeyword + " " + toConditionTeX + 
                stepText + ":" + idTextEnd +
                (comment ? comment : "") +
                "      </td> " +
                "    </tr>\n" +
                "  </tbody>\n" +
                "</table>\n";
        
    var saveIndentation = state["indentation"];
    state["lineNumber"]++;
    state["indentation"]++;
    htmlText += Algotype.processInnerElements(element, state);
    
    // Reset the indentation counter.
    state["indentation"] = saveIndentation;
    return htmlText;
};

Algotype.typesetFor = function(forElement, state) {
    return Algotype.typesetCountingLoop(forElement, state, "for", "to", "step");
};

Algotype.typesetForDownto = function(forDowntoElement, state) {
    return Algotype.typesetCountingLoop(forDowntoElement, 
                                        state, 
                                        "for", 
                                        "downto", 
                                        "step");
};

Algotype.typesetUnconditionalBlock = function(element, state, keyword) {
    var label = element.getAttribute("label");
    var htmlText = "";
    var comment = element.getAttribute("comment");
    var commentId = (element.getAttribute("comment-id") || "").trim();
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
    
    var id = (element.getAttribute("id") || "").trim();
    var idTextBegin = "";
    var idTextEnd = "";
    
    if (id) {
        idTextBegin = "<span id='" + id + "'>";
        idTextEnd = "</span>";
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
                idTextBegin + keyword + ":" + idTextEnd +
                (comment ? comment : "") +
                "      </td> " +
                "    </tr>\n" +
                "  </tbody>\n" +
                "</table>\n";
        
    var saveIndentation = state["indentation"];
    state["lineNumber"]++;
    state["indentation"]++;
    htmlText += Algotype.processInnerElements(element, state);
    
    // Reset the indentation counter.
    state["indentation"] = saveIndentation;   
    return htmlText;
};

Algotype.processInnerElements = function(element, state) {
    var childElements = element.children;
    var htmlText = "";
    
    for (var i = 0; i < childElements.length; ++i) {
        var elementName = childElements[i].tagName.toLowerCase();
        var handlerFunction = Algotype.dispatchTable[elementName];
        
        if (handlerFunction) {
            htmlText += handlerFunction(childElements[i], state);
        } else {
            throw new Error("Unknown element: '" + elementName + "'.");
        }
    }
    
    return htmlText;
};

Algotype.typesetForever = function(foreverElement, state) {
    return Algotype.typesetUnconditionalBlock(foreverElement, state, "forever");
};

Algotype.typesetRepeatUntil = function(repeatUntilElement, state) {
    var conditionTeX = 
            Algotype.typesetCondition(
            repeatUntilElement.getAttribute("condition"));
    
    var label = repeatUntilElement.getAttribute("label");
    var htmlText = "";
    var comment = repeatUntilElement.getAttribute("comment");
    var commentId = 
            (repeatUntilElement.getAttribute("comment-id") || "").trim();
    
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
    
    var repeatUntilId = (repeatUntilElement.getAttribute("id") || "").trim();
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
    htmlText += Algotype.processInnerElements(repeatUntilElement, state);
    
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
            "<table class='algotype-algorithm-header'>\n" +
            "    <tbody class='algotype-no-padding-no-margin'>\n" +
            "        <tr class='algotype-no-padding-no-margin'>\n" + 
            "            <td class='algotype-no-padding-no-margin'>" +
            "<span class='algotype-text algotype-algorithm-name'>" +
            algorithmName +
            "</span><span class='algotype-text'>" + algorithmParameterList + 
            commentText +
            "</span></td>\n" + 
            "        </tr>\n" + 
            "    </tbody>\n" +
            "</table>\n";
            
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

Algotype.setCSSRules = function() {
    var styleElement = document.createElement("style");
    styleElement.type = "text/css";
    styleElement.innerHTML = 
"alg-algorithm {   \n\
    display: none;  \n\
} \n\
\n\
.algotype-text {                  \n\
    padding-bottom: 2px;          \n\
    font-family: Times New Roman; \n\
    font-size: 18px;              \n\
} \n\
\n\
.algotype-keyword {    \n\
    font-weight: bold; \n\
} \n\
\n\
table.algotype-code-row-table { \n\
    padding: 0;                 \n\
    margin: 0;                  \n\
    border-collapse: collapse;  \n\
    margin-bottom: -3px;        \n\
} \n\
\n\
tbody.algotype-code-row-tbody { \n\
    padding: 0;                 \n\
    margin: 0;                  \n\
    margin-bottom: -3px;        \n\
} \n\
\n\
tr.algotype-algorithm-line { \n\
    padding: 0;              \n\
    margin: 0;               \n\
    margin-bottom: -3px;     \n\
} \n\
\n\
td.algotype-algorithm-line-number { \n\
    padding: 0;                     \n\
    margin: 0;                      \n\
    font-family: Times New Roman;   \n\
    font-size: 16px;                \n\
    font-weight: bold;              \n\
    width: 20px;                    \n\
    text-align: right;              \n\
    margin-bottom: 0px;             \n\
} \n\
\n\
td.algotype-line-number-space { \n\
    padding: 0;                 \n\
    margin: 0;                  \n\
    margin-bottom: -3px;        \n\
} \n\
\n\
.algotype-algorithm-name {    \n\
    font-variant: small-caps; \n\
    font-weight: bolder;      \n\
} \n\
.algotype-label {} \n\
\n\
.algotype-label { \n\
        font-size: 14px; \n\
        font-family: monospace; \n\
        font-weight: normal;\n\
}\n\
.algotype-no-padding-no-margin {\n\
    margin: 0;  \n\
    padding: 0; \n\
}\n\
\n\
.algotype-algorithm-header { \n\
    border-bottom: 2px solid black; \n\
    border-top: 3px solid black;    \n\
    border-colapse: collapse;       \n\
    margin: 0;                      \n\
    padding: 0;                     \n\
    margin-bottom: 3px;             \n\
}\n\
\n\
.algotype-step-comment {          \n\
    font-family: Times New Roman; \n\
    font-size: 18px;              \n\
    font-weight: normal;          \n\
    font-variant: normal;         \n\
}\n";
    document.head.appendChild(styleElement);
};
    
Algotype.setup = function() {
    // Load MathJax.
    Algotype.setCSSRules();
    Algotype.loadMathJax();
    
    // Typeset all algorithms present in the DOM.
    var algorithmList = document.getElementsByTagName("alg-algorithm");
    
    for (var i = 0; i < algorithmList.length; ++i) {
        Algotype.typesetAlgorithm(algorithmList[i]);
    }
};

Algotype.dispatchTable = {};

Algotype.dispatchTable["alg-break"]        = Algotype.typesetBreak;
Algotype.dispatchTable["alg-continue"]     = Algotype.typesetContinue;
Algotype.dispatchTable["alg-else"]         = Algotype.typesetElse;
Algotype.dispatchTable["alg-else-if"]      = Algotype.typesetElseIf;
Algotype.dispatchTable["alg-for"]          = Algotype.typesetFor;
Algotype.dispatchTable["alg-foreach"]      = Algotype.typesetForEach;
Algotype.dispatchTable["alg-forever"]      = Algotype.typesetForever;
Algotype.dispatchTable["alg-for-downto"]   = Algotype.typesetForDownto;
Algotype.dispatchTable["alg-if"]           = Algotype.typesetIf;
Algotype.dispatchTable["alg-output"]       = Algotype.typesetOutput;
Algotype.dispatchTable["alg-print"]        = Algotype.typesetPrint;
Algotype.dispatchTable["alg-repeat-until"] = Algotype.typesetRepeatUntil;
Algotype.dispatchTable["alg-return"]       = Algotype.typesetReturn;
Algotype.dispatchTable["alg-step"]         = Algotype.typesetStep;
Algotype.dispatchTable["alg-while"]        = Algotype.typesetWhile;
Algotype.dispatchTable["alg-yield"]        = Algotype.typesetYield;

var oldOnloadHandler = window.onload;

window.onload = function() {
    if (oldOnloadHandler) {
        oldOnloadHandler();
    }
    
    Algotype.setup();
};