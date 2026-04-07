// TreeShared.js

// 1. Agrupamos as Constantes
const TreeConstants = {
    LINK_COLOR: VISUAL_CONFIG.drawingStyle.link,
    HIGHLIGHT_CIRCLE_COLOR: VISUAL_CONFIG.drawingStyle.highlight,
    FOREGROUND_COLOR: VISUAL_CONFIG.drawingStyle.foreground,
    BACKGROUND_COLOR: VISUAL_CONFIG.drawingStyle.background,
    PRINT_COLOR: VISUAL_CONFIG.drawingStyle.foreground,
    HIGHLIGHT_LINK_COLOR: VISUAL_CONFIG.drawingStyle.highlight,
    HIGHLIGHT_COLOR: VISUAL_CONFIG.drawingStyle.highlight,
    WARNING_BACKGROUND_COLOR: VISUAL_CONFIG.drawingStyle.focusWarningBackground,
    WARNING_FOREGROUND_COLOR: VISUAL_CONFIG.drawingStyle.focusWarningForeground,
    GOOD_BACKGROUND_COLOR: VISUAL_CONFIG.drawingStyle.focusGoodBackground,
    GOOD_FOREGROUND_COLOR: VISUAL_CONFIG.drawingStyle.focusGoodForeground,
    BAD_BACKGROUND_COLOR: VISUAL_CONFIG.drawingStyle.focusBadBackground,
    BAD_FOREGROUND_COLOR: VISUAL_CONFIG.drawingStyle.focusBadForeground,
    WIDTH_DELTA: 75,
    HEIGHT_DELTA: 50,
    STARTING_Y: 50,
    FIRST_PRINT_POS_X: 50,
    LABEL_X_DELTA: 15,
    LABEL_Y_DELTA: 25,
    PRINT_VERTICAL_GAP: 20,
    PRINT_HORIZONTAL_GAP: 50,
    MAX_KEY_LENGTH: 4,
    PERCURSO: Object.freeze({
        NONE: "none",
        PREORDEM: "pre",
        EMORDEM: "ordem",
        POSORDEM: "pos",
        EMNIVEL: "nivel",
    }),
};

const TreeVisuals = {
    setupBasicInputs: function () {
        this.insertField = addControlToAlgorithmBar("Text", "");
        this.insertField.size = TreeConstants.MAX_KEY_LENGTH;
        this.insertField.onkeydown = this.returnSubmit(
            this.insertField,
            this.insertCallback.bind(this),
            TreeConstants.MAX_KEY_LENGTH,
            true,
        );
        this.insertButton = addControlToAlgorithmBar("Button", "Inserir");
        this.insertButton.onclick = this.insertCallback.bind(this);
        addSpaceToAlgorithmBar(15);

        this.findField = addControlToAlgorithmBar("Text", "");
        this.findField.size = TreeConstants.MAX_KEY_LENGTH;
        this.findField.onkeydown = this.returnSubmit(
            this.findField,
            this.findCallback.bind(this),
            TreeConstants.MAX_KEY_LENGTH,
            true,
        );
        this.findButton = addControlToAlgorithmBar("Button", "Buscar");
        this.findButton.onclick = this.findCallback.bind(this);
        addSpaceToAlgorithmBar(15);

        this.deleteField = addControlToAlgorithmBar("Text", "");
        this.deleteField.size = TreeConstants.MAX_KEY_LENGTH;
        this.deleteField.onkeydown = this.returnSubmit(
            this.deleteField,
            this.deleteCallback.bind(this),
            TreeConstants.MAX_KEY_LENGTH,
            true,
        );
        this.deleteButton = addControlToAlgorithmBar("Button", "Remover");
        this.deleteButton.onclick = this.deleteCallback.bind(this);
        addSpaceToAlgorithmBar(55);
    },

    setupTraversalSelect: function () {
        var options = [
            { value: TreeConstants.PERCURSO.NONE, text: "Percurso" },
            { value: TreeConstants.PERCURSO.PREORDEM, text: "Pré ordem" },
            { value: TreeConstants.PERCURSO.EMORDEM, text: "Em ordem" },
            { value: TreeConstants.PERCURSO.POSORDEM, text: "Pós ordem" },
        ];

        this.selectionBoxList = addCustomSelectionBoxToAlgorithmBar(options, "SelecaoPercurso2");

        this.selectionBoxList.addEventListener("change", (e) => {
            const escolha = e.detail.value;

            switch (escolha) {
                case TreeConstants.PERCURSO.EMORDEM:
                    this.emOrdemCallback();
                    break;
                case TreeConstants.PERCURSO.PREORDEM:
                    this.preOrdemCallback();
                    break;
                case TreeConstants.PERCURSO.POSORDEM:
                    this.posOrdemCallback();
                    break;
                case TreeConstants.PERCURSO.EMNIVEL:
                    this.emNivelCallback();
                    break;
                default:
                    console.warn("Escolha desconhecida:", escolha);
            }
        });
    },

    resizeWidths: function (tree) {
        if (tree == null) {
            return 0; // Se o nó é nulo, não ocupa espaço
        }

        // Calcula os filhos recursivamente primeiro (Bottom-Up)
        this.resizeWidths(tree.left);
        this.resizeWidths(tree.right);

        // Pega a "invasão" em direção ao centro que os filhos causariam
        var leftConflict = tree.left != null ? tree.left.rightWidth : 0;
        var rightConflict = tree.right != null ? tree.right.leftWidth : 0;

        // O SEGREDO AQUI:
        // O deslocamento (offset) do pai para os filhos DEVE ser idêntico para ambos os lados.
        // Pegamos o maior conflito possível, garantindo no mínimo o espaço visual de um nó.
        var offset = Math.max(leftConflict, rightConflict, TreeConstants.WIDTH_DELTA / 2);

        // Salvamos o offset diretamente no nó. Isso vai facilitar muito o posicionamento.
        tree.offset = offset;

        // A largura total da subárvore em relação ao centro deste nó
        tree.leftWidth = offset + (tree.left != null ? tree.left.leftWidth : 0);
        tree.rightWidth = offset + (tree.right != null ? tree.right.rightWidth : 0);

        return tree.leftWidth + tree.rightWidth;
    },

    // 1. resizeTree (Inicia passando o side = 0 para a raiz)
    resizeTree: function () {
        var startingPoint = this.startingX;

        // Usa o cálculo simétrico (mantido igual ao passo anterior)
        this.resizeWidths(this.treeRoot);

        if (this.treeRoot != null) {
            if (this.treeRoot.leftWidth > startingPoint) {
                startingPoint = this.treeRoot.leftWidth;
            } else if (this.treeRoot.rightWidth > startingPoint) {
                startingPoint = Math.max(this.treeRoot.leftWidth, 2 * startingPoint - this.treeRoot.rightWidth);
            }

            // Passamos '0' no final indicando que é a raiz
            this.setNewPositions(this.treeRoot, startingPoint, TreeConstants.STARTING_Y, 0);

            this.animateNewPositions(this.treeRoot);
        }
        this.cmd("Step");
    },

    // 2. setNewPositions (Calcula o X/Y da árvore E o X/Y do rótulo)
    setNewPositions: function (tree, xPosition, yPosition, side) {
        if (tree != null) {
            tree.x = xPosition;
            tree.y = yPosition;

            // --- CÁLCULO GENÉRICO DO RÓTULO (FB da AVL) ---
            // Desloca o rótulo para a esquerda se for filho esquerdo, ou para a direita se for direito,
            // evitando que o rótulo fique por cima da linha que conecta ao pai.
            if (side == -1) {
                tree.heightLabelX = xPosition - TreeConstants.LABEL_X_DELTA;
            } else if (side == 1) {
                tree.heightLabelX = xPosition + TreeConstants.LABEL_X_DELTA;
            } else {
                tree.heightLabelX = xPosition - TreeConstants.LABEL_X_DELTA; // Raiz
            }
            tree.heightLabelY = yPosition - TreeConstants.LABEL_Y_DELTA;
            // ----------------------------------------------

            // Continua a descida recursiva usando o offset simétrico!
            // Passamos -1 para a esquerda e 1 para a direita.
            if (tree.left != null) {
                this.setNewPositions(tree.left, xPosition - tree.offset, yPosition + TreeConstants.HEIGHT_DELTA, -1);
            }
            if (tree.right != null) {
                this.setNewPositions(tree.right, xPosition + tree.offset, yPosition + TreeConstants.HEIGHT_DELTA, 1);
            }
        }
    },

    // 3. animateNewPositions (A mágica da checagem)
    animateNewPositions: function (tree) {
        if (tree != null) {
            // Move o círculo principal do nó (Serve para BST, AVL e RN)
            this.cmd("Move", tree.graphicID, tree.x, tree.y);

            // CHECAGEM DE SEGURANÇA: Esse nó possui um ID de rótulo instanciado?
            // Na BST isso será undefined, então ele pula silenciosamente.
            // Na AVL, como você criou o heightLabelID na inserção, ele executa!
            if (tree.heightLabelID !== undefined && tree.heightLabelID !== null) {
                this.cmd("Move", tree.heightLabelID, tree.heightLabelX, tree.heightLabelY);
            }

            this.animateNewPositions(tree.left);
            this.animateNewPositions(tree.right);
        }
    },

    projecaoFilhoEsquerdo: function (node) {
        // Usa o offset perfeito precalculado, ou o padrão da folha
        const offset = node.offset ?? TreeConstants.WIDTH_DELTA / 2;
        return [node.x - offset, node.y + TreeConstants.HEIGHT_DELTA];
    },

    projecaoFilhoDireito: function (node) {
        const offset = node.offset ?? TreeConstants.WIDTH_DELTA / 2;
        return [node.x + offset, node.y + TreeConstants.HEIGHT_DELTA];
    },
};

const TreeSearch = {
    findCallback: function (event) {
        if (this.findField.value != "") {
            var findValue;
            findValue = this.normalizeNumber(this.findField.value, 4);
            if (typeof gtag === "function") {
                gtag("event", "operacao_arvore", {
                    tipo_arvore: this.treeType || "desconecido",
                    acao: "busca",
                    valor: findValue,
                });
            }
            this.findField.value = "";
            this.implementAction(this.findElement.bind(this), findValue);
        }
    },

    findElement: function (findValue) {
        this.commands = [];

        this.highlightID = this.nextIndex++;
        var msg = "Buscando elemento: " + Utils.toShow(findValue);
        this.cmd("SetText", 0, msg);
        this.cmd("Step");

        if (this.treeRoot == null) {
            var nullID = this.nextIndex + 1;
            this.cmd("CreateLabel", nullID, "null", this.startingX, TreeConstants.STARTING_Y);
            this.cmd("SetForegroundColor", nullID, TreeConstants.HIGHLIGHT_CIRCLE_COLOR);
            this.cmd(
                "CreateHighlightCircle",
                this.highlightID,
                TreeConstants.HIGHLIGHT_CIRCLE_COLOR,
                this.startingX,
                TreeConstants.STARTING_Y,
            );
            this.cmd("SetText", 0, msg + "\n\n   ► Árvore Vazia!");
            this.cmd("Step");

            this.cmd("Delete", nullID);
            this.cmd("Delete", this.highlightID);
            this.cmd("SetText", 0, msg + " Não encontrado!\n\n   ► Árvore Vazia!");
        } else {
            this.doFind(this.treeRoot, findValue);
        }

        this.cmd("Step");
        this.cmd("SetText", 0, "");

        return this.commands;
    },

    doFind: function (tree, value) {
        showValue = Utils.toShow(value);
        var texto = "Buscando elemento: " + showValue;

        if (tree != null) {
            showTreeValue = Utils.toShow(tree.data);

            this.cmd("SetHighlight", tree.graphicID, 1);
            if (tree.data == value) {
                texto += "\n\n   " + showValue + " = " + showTreeValue;
                this.cmd("SetText", 0, texto);
                this.cmd("Step");

                this.cmd("SetFocus", tree.graphicID, 1);
                this.cmd("SetFocusBackgroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.focusGoodBackground);
                this.cmd("SetFocusForegroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.focusGoodForeground);
                this.cmd("SetHighlightColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.focusGoodForeground);
                this.cmd("Step");

                this.cmd("SetText", 0, "Buscando elemento: " + showValue + " Encontrado!");
                this.cmd("Step");
                this.cmd("SetHighlight", tree.graphicID, 0);
                this.cmd("SetFocus", tree.graphicID, 0);
                this.cmd("SetHighlightColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.highlight);
            } else {
                if (tree.data > value) {
                    texto += "\n\n   " + showValue + " < " + showTreeValue;
                    this.cmd("SetText", 0, texto);
                    this.cmd("Step");

                    this.cmd("SetHighlight", tree.graphicID, 0);
                    texto += "\n\n   ► Descer para a subárvore esquerda";
                    this.cmd("SetText", 0, texto);
                    this.cmd(
                        "CreateHighlightCircle",
                        this.highlightID,
                        TreeConstants.HIGHLIGHT_CIRCLE_COLOR,
                        tree.x,
                        tree.y,
                    );

                    if (tree.left != null) {
                        this.nextPos = [tree.left.x, tree.left.y];
                    } else {
                        this.nextPos = this.projecaoFilhoEsquerdo(tree);
                    }
                    this.cmd("Move", this.highlightID, this.nextPos[0], this.nextPos[1]);
                    this.cmd("Step");

                    this.cmd("Delete", this.highlightID);
                    this.doFind(tree.left, value);
                } else {
                    texto += "\n\n   " + showValue + " > " + showTreeValue;
                    this.cmd("SetText", 0, texto);
                    this.cmd("Step");

                    this.cmd("SetHighlight", tree.graphicID, 0);
                    texto += "\n\n   ► Descer para a subárvore direita";
                    this.cmd("SetText", 0, texto);
                    this.cmd(
                        "CreateHighlightCircle",
                        this.highlightID,
                        TreeConstants.HIGHLIGHT_CIRCLE_COLOR,
                        tree.x,
                        tree.y,
                    );

                    if (tree.right != null) {
                        this.nextPos = [tree.right.x, tree.right.y];
                    } else {
                        this.nextPos = this.projecaoFilhoDireito(tree);
                    }
                    this.cmd("Move", this.highlightID, this.nextPos[0], this.nextPos[1]);
                    this.cmd("Step");

                    this.cmd("Delete", this.highlightID);
                    this.doFind(tree.right, value);
                }
            }
        } else {
            texto += "\n\n   Subárvore vazia!";
            this.cmd("SetText", 0, texto);
            var nullID = this.nextIndex + 1;
            this.cmd("CreateLabel", nullID, "null", this.nextPos[0], this.nextPos[1]);
            this.cmd("SetForegroundColor", nullID, TreeConstants.HIGHLIGHT_CIRCLE_COLOR);
            this.cmd(
                "CreateHighlightCircle",
                this.highlightID,
                TreeConstants.HIGHLIGHT_CIRCLE_COLOR,
                this.nextPos[0],
                this.nextPos[1],
            );
            this.cmd("Step");

            this.cmd("Delete", nullID);
            this.cmd("Delete", this.highlightID);
            this.cmd("SetText", 0, "Buscando elemento: " + showValue + " Não encontrado!");
        }
    },
};

const weights = {
    1: 0.7,
    0: 0.9,
    2: 0.8,
    3: 0.8,
    4: 0.8,
    5: 0.8,
    6: 0.8,
    7: 0.8,
    8: 0.9,
    9: 0.8,
    " ": 0.3,
};

// Agrupamos as funções de percurso
const TreeTraversals = {
    // Suas funções de percurso entram aqui exatamente como eram.
    // O 'this' dentro delas vai referenciar corretamente a árvore que as chamar.

    emOrdemCallback: function (event) {
        if (typeof gtag === "function") {
            gtag("event", "operacao_arvore", {
                tipo_arvore: this.treeType || "desconecido",
                acao: "percurso_em_ordem",
            });
        }
        this.implementAction(this.printTree.bind(this), TreeConstants.PERCURSO.EMORDEM);
    },

    preOrdemCallback: function (event) {
        if (typeof gtag === "function") {
            gtag("event", "operacao_arvore", {
                tipo_arvore: this.treeType || "desconecido",
                acao: "percurso_pre_ordem",
            });
        }
        this.implementAction(this.printTree.bind(this), TreeConstants.PERCURSO.PREORDEM);
    },

    posOrdemCallback: function (event) {
        if (typeof gtag === "function") {
            gtag("event", "operacao_arvore", {
                tipo_arvore: this.treeType || "desconecido",
                acao: "percurso_pos_ordem",
            });
        }
        this.implementAction(this.printTree.bind(this), TreeConstants.PERCURSO.POSORDEM);
    },

    printTree: function (percurso) {
        this.commands = [];

        if (this.treeRoot != null) {
            this.highlightID = this.nextIndex++;
            this.firstLabel = this.nextIndex;
            this.cmd(
                "CreateHighlightCircle",
                this.highlightID,
                TreeConstants.HIGHLIGHT_CIRCLE_COLOR,
                this.treeRoot.x,
                this.treeRoot.y,
            );
            this.yPosOfNextLabel = this.first_print_pos_y + 10;

            var labelPerc = this.nextIndex++;
            this.linhas = 1;
            this.recuos = [];
            switch (percurso) {
                case TreeConstants.PERCURSO.EMORDEM:
                    this.cmd("CreateLabel", labelPerc, "Percurso em ordem simétrica: ", 133, this.yPosOfNextLabel);
                    this.labelPosition = 133;
                    this.xPosOfNextLabel = this.initialXPosition = 235;
                    this.printTreeRec(this.treeRoot);
                    break;
                case TreeConstants.PERCURSO.PREORDEM:
                    this.cmd("CreateLabel", labelPerc, "Percurso em pré ordem: ", 115, this.yPosOfNextLabel);
                    this.labelPosition = 115;
                    this.xPosOfNextLabel = this.initialXPosition = 198;
                    // this.preOrdemRec(this.treeRoot);
                    this.preOrdemRec(this.treeRoot);

                    break;
                case TreeConstants.PERCURSO.POSORDEM:
                    this.cmd("CreateLabel", labelPerc, "Percurso em pós ordem: ", 115, this.yPosOfNextLabel);
                    this.labelPosition = 115;
                    this.xPosOfNextLabel = this.initialXPosition = 198;
                    // this.posOrdemRec(this.treeRoot);
                    this.posOrdemRec(this.treeRoot);

                    break;
            }
            this.cmd("Delete", this.highlightID);
            this.cmd("Step");

            for (var i = this.firstLabel; i < this.nextIndex; i++) {
                this.cmd("Delete", i);
            }
            this.nextIndex = this.highlightID; /// Reuse objects.  Not necessary.
            this.cmd("SetText", 0, "");
        }

        return this.commands;
    },

    printTreeRec: function (tree) {
        this.cmd("Step");
        var esq = this.projecaoFilhoEsquerdo(tree);
        var dir = this.projecaoFilhoDireito(tree);

        /* vista esquerda */
        if (tree.left != null) {
            this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
            this.printTreeRec(tree.left);
        } else {
            this.cmd("Move", this.highlightID, esq[0], esq[1]);
            this.cmd("Step");

            var nullID = this.nextIndex++;
            this.cmd("CreateLabel", nullID, "null", esq[0], esq[1]);
            this.cmd("SetForegroundColor", nullID, TreeConstants.HIGHLIGHT_CIRCLE_COLOR);
            this.cmd("Step");
            this.cmd("Delete", nullID);
            this.nextIndex--;
        }
        this.cmd("Move", this.highlightID, tree.x, tree.y);
        this.cmd("Step");

        /* visita o no */

        let total = 0;
        if (this.initialXPosition != this.xPosOfNextLabel) total = 1.5; /* para espaco*/
        for (let char of Utils.toShow(tree.data)) {
            total += weights[char] || 0.8;
        }
        var delta = total * 10;
        this.xPosOfNextLabel += delta;

        if (this.xPosOfNextLabel >= this.print_max) {
            var linhas = this.linhas;
            this.cmd("Move", this.firstLabel, this.labelPosition, this.yPosOfNextLabel - 20 * linhas);
            var x_pos = this.recuos[0];
            var des = 1;
            for (var i = this.firstLabel + 1; i < this.nextIndex; i++) {
                this.cmd("Move", i, x_pos, this.yPosOfNextLabel - 20 * linhas);
                if (this.recuos[des] < this.recuos[des - 1]) {
                    linhas--;
                }
                x_pos = this.recuos[des++];
            }

            this.xPosOfNextLabel = this.initialXPosition + (total - 1.5) * 10;
            this.linhas++;
        }
        this.cmd("SetFocus", tree.graphicID, 1);
        this.cmd("SetFocusBackgroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.foreground);
        this.cmd("SetFocusForegroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.background);
        var nextLabelID = this.nextIndex++;
        this.cmd("CreateLabel", nextLabelID, Utils.toShow(tree.data), tree.x, tree.y);
        this.cmd("SetForegroundColor", nextLabelID, TreeConstants.PRINT_COLOR);
        this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
        this.cmd("Step");
        this.cmd("SetFocus", tree.graphicID, 0);
        this.recuos.push(this.xPosOfNextLabel);

        // this.xPosOfNextLabel +=  TreeConstants.PRINT_HORIZONTAL_GAP;

        /* visita direita */
        if (tree.right != null) {
            this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
            this.printTreeRec(tree.right);
        } else {
            this.cmd("Move", this.highlightID, dir[0], dir[1]);
            this.cmd("Step");

            var nullID = this.nextIndex++;
            this.cmd("CreateLabel", nullID, "null", dir[0], dir[1]);
            this.cmd("SetForegroundColor", nullID, TreeConstants.HIGHLIGHT_CIRCLE_COLOR);
            this.cmd("Step");
            this.cmd("Delete", nullID);
            this.nextIndex--;
        }
        this.cmd("Move", this.highlightID, tree.x, tree.y);
        this.cmd("Step");

        return;
    },

    preOrdemRec: function (tree) {
        this.cmd("Step");
        var esq = this.projecaoFilhoEsquerdo(tree);
        var dir = this.projecaoFilhoDireito(tree);

        /* visita o no */
        let total = 0;
        if (this.initialXPosition != this.xPosOfNextLabel) total = 1.5; /* para espaco*/
        for (let char of Utils.toShow(tree.data)) {
            total += weights[char] || 0.8;
        }
        var delta = total * 10;
        this.xPosOfNextLabel += delta;

        if (this.xPosOfNextLabel >= this.print_max) {
            var linhas = this.linhas;
            this.cmd("Move", this.firstLabel, this.labelPosition, this.yPosOfNextLabel - 20 * linhas);
            var x_pos = this.recuos[0];
            var des = 1;
            for (var i = this.firstLabel + 1; i < this.nextIndex; i++) {
                this.cmd("Move", i, x_pos, this.yPosOfNextLabel - 20 * linhas);
                if (this.recuos[des] < this.recuos[des - 1]) {
                    linhas--;
                }
                x_pos = this.recuos[des++];
            }

            this.xPosOfNextLabel = this.initialXPosition + (total - 1.5) * 10;
            this.linhas++;
        }
        this.cmd("SetFocus", tree.graphicID, 1);
        this.cmd("SetFocusBackgroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.foreground);
        this.cmd("SetFocusForegroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.background);
        var nextLabelID = this.nextIndex++;
        this.cmd("CreateLabel", nextLabelID, Utils.toShow(tree.data), tree.x, tree.y);
        this.cmd("SetForegroundColor", nextLabelID, TreeConstants.PRINT_COLOR);
        this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
        this.cmd("Step");
        this.cmd("SetFocus", tree.graphicID, 0);
        this.recuos.push(this.xPosOfNextLabel);

        /* vista esquerda */
        if (tree.left != null) {
            this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
            this.preOrdemRec(tree.left);
        } else {
            this.cmd("Move", this.highlightID, esq[0], esq[1]);
            this.cmd("Step");

            var nullID = this.nextIndex++;
            this.cmd("CreateLabel", nullID, "null", esq[0], esq[1]);
            this.cmd("SetForegroundColor", nullID, TreeConstants.HIGHLIGHT_CIRCLE_COLOR);
            this.cmd("Step");
            this.cmd("Delete", nullID);
            this.nextIndex--;
        }
        this.cmd("Move", this.highlightID, tree.x, tree.y);
        this.cmd("Step");

        /* visita direita */
        if (tree.right != null) {
            this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
            this.preOrdemRec(tree.right);
        } else {
            this.cmd("Move", this.highlightID, dir[0], dir[1]);
            this.cmd("Step");

            var nullID = this.nextIndex++;
            this.cmd("CreateLabel", nullID, "null", dir[0], dir[1]);
            this.cmd("SetForegroundColor", nullID, TreeConstants.HIGHLIGHT_CIRCLE_COLOR);
            this.cmd("Step");
            this.cmd("Delete", nullID);
            this.nextIndex--;
        }
        this.cmd("Move", this.highlightID, tree.x, tree.y);
        this.cmd("Step");

        return;
    },

    posOrdemRec: function (tree) {
        this.cmd("Step");
        var esq = this.projecaoFilhoEsquerdo(tree);
        var dir = this.projecaoFilhoDireito(tree);

        /* vista esquerda */
        if (tree.left != null) {
            this.cmd("Move", this.highlightID, tree.left.x, tree.left.y);
            this.posOrdemRec(tree.left);
        } else {
            this.cmd("Move", this.highlightID, esq[0], esq[1]);
            this.cmd("Step");

            var nullID = this.nextIndex++;
            this.cmd("CreateLabel", nullID, "null", esq[0], esq[1]);
            this.cmd("SetForegroundColor", nullID, TreeConstants.HIGHLIGHT_CIRCLE_COLOR);
            this.cmd("Step");
            this.cmd("Delete", nullID);
            this.nextIndex--;
        }
        this.cmd("Move", this.highlightID, tree.x, tree.y);
        this.cmd("Step");

        /* visita direita */
        if (tree.right != null) {
            this.cmd("Move", this.highlightID, tree.right.x, tree.right.y);
            this.posOrdemRec(tree.right);
        } else {
            this.cmd("Move", this.highlightID, dir[0], dir[1]);
            this.cmd("Step");

            var nullID = this.nextIndex++;
            this.cmd("CreateLabel", nullID, "null", dir[0], dir[1]);
            this.cmd("SetForegroundColor", nullID, TreeConstants.HIGHLIGHT_CIRCLE_COLOR);
            this.cmd("Step");
            this.cmd("Delete", nullID);
            this.nextIndex--;
        }
        this.cmd("Move", this.highlightID, tree.x, tree.y);
        this.cmd("Step");

        /* visita o no */
        let total = 0;
        if (this.initialXPosition != this.xPosOfNextLabel) total = 1.5; /* para espaco*/
        for (let char of Utils.toShow(tree.data)) {
            total += weights[char] || 0.8;
        }
        var delta = total * 10;
        this.xPosOfNextLabel += delta;

        if (this.xPosOfNextLabel >= this.print_max) {
            var linhas = this.linhas;
            this.cmd("Move", this.firstLabel, this.labelPosition, this.yPosOfNextLabel - 20 * linhas);
            var x_pos = this.recuos[0];
            var des = 1;
            for (var i = this.firstLabel + 1; i < this.nextIndex; i++) {
                this.cmd("Move", i, x_pos, this.yPosOfNextLabel - 20 * linhas);
                if (this.recuos[des] < this.recuos[des - 1]) {
                    linhas--;
                }
                x_pos = this.recuos[des++];
            }

            this.xPosOfNextLabel = this.initialXPosition + (total - 1.5) * 10;
            this.linhas++;
        }
        this.cmd("SetFocus", tree.graphicID, 1);
        this.cmd("SetFocusBackgroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.foreground);
        this.cmd("SetFocusForegroundColor", tree.graphicID, VISUAL_CONFIG.drawingStyle.background);
        var nextLabelID = this.nextIndex++;
        this.cmd("CreateLabel", nextLabelID, Utils.toShow(tree.data), tree.x, tree.y);
        this.cmd("SetForegroundColor", nextLabelID, TreeConstants.PRINT_COLOR);
        this.cmd("Move", nextLabelID, this.xPosOfNextLabel, this.yPosOfNextLabel);
        this.cmd("Step");
        this.cmd("SetFocus", tree.graphicID, 0);
        this.recuos.push(this.xPosOfNextLabel);

        return;
    },
};
