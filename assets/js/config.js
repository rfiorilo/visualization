window.VISUAL_CONFIG = {
    textStyle: {
        color: "#0088b7",
        font: "15px sans-serif" /* '10px sans-serif' */,
    },

    drawingStyle: {
        link: "#0088b7",
        highlight: "#b70000",
        focusGoodBackground: "#85bd74",
        focusBadBackground: "#f1a4a4",
        focusGoodForeground: "#0e6e01",
        focusBadForeground: "#b70000",
        foreground: "#0088b7",
        background: "#d6eef6",
        arraybackground: "#ffffff",
        index: "#0088b7",
    },
};

window.CATEGORIES_CONFIG = {
    categories: {
        ordenacao: {
            label: "Ordenação",
            color: "#8b5cf6",
        },
        arvores: {
            label: "Árvores",
            color: "#16a34a",
        },
        grafos: {
            label: "Grafos",
            color: "#2563eb",
        },
        hash: {
            label: "Tabelas de dispersão",
            color: "#db2777",
        },
    },
};

window.PAGES_CONFIG = {
    sections: [
        {
            title: "Algoritmos",
            groups: [
                {
                    name: "Árvores de busca",
                    showGroupName: false,
                    items: [
                        {
                            shortname: "ABB",
                            fullname: "Árvore Binária de Busca",
                            pagename: "BST",
                            link: "pages/algorithms/BST.html",
                            description:
                                "Organiza os dados de forma hierárquica e ordenada, permitindo acesso eficiente por meio de comparações entre os elementos. Pode degradar para uma lista linear em casos desbalanceados.",
                            categories: ["arvores"],
                        },
                    ],
                },
                {
                    name: "Tabelas de dispersão",
                    showGroupName: true,
                    items: [
                        {
                            shortname: "Encadeamento externo",
                            fullname: "Encadeamento externo",
                            pagename: "OpenHash",
                            link: "pages/algorithms/OpenHash.html",
                            description:
                                "Utiliza função de dispersão para acesso rápido aos dados, sem necessidade de ordenação. As colisões são tratadas por meio de listas encadeadas externas à tabela.",
                            categories: ["hash"],
                        },
                        {
                            shortname: "Endereçamento aberto",
                            fullname: "Endereçamento aberto",
                            pagename: "ClosedHash",
                            link: "pages/algorithms/ClosedHash.html",
                            description:
                                "Utiliza função de dispersão para acesso rápido aos dados, sem necessidade de ordenação. As colisões são tratadas por endereçamento aberto, com sondagens linear, quadrática e por duplo hashing.",
                            categories: ["hash"],
                        },
                    ],
                },
            ],
        },
        {
            title: "Plataforma",
            groups: [
                {
                    name: "Institucional",
                    showGroupName: false,
                    items: [
                        { name: "Sobre", link: "pages/sobre.html", description: "Informações sobre a plataforma." },
                        {
                            name: "Perguntas Frequentes (FAQ)",
                            link: "pages/faq.html",
                            description: "Perguntas frequentes.",
                        },
                        { name: "Source Code", link: "pages/source.html", description: "Código-fonte da plataforma." },
                        { name: "Contact", link: "pages/contato.html", description: "Formas de contato." },
                    ],
                },
            ],
        },
    ],
};
