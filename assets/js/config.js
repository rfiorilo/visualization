window.VISUAL_CONFIG = {
    textStyle: {
        color: "#0088b7",
        font: "15px sans-serif" /* '10px sans-serif' */,
    },

    drawingStyle: {
        link: "#0088b7",
        highlight: "#b70000",
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
            label: "Hash",
            color: "#db2777",
        },
    },
};

window.PAGES_CONFIG = {
    sections: [
        {
            title: "Algoritmos",
            groups: [],
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
