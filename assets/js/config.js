window.VISUAL_CONFIG = {

  textStyle: {
    color: "#0088b7",
    font: "15px sans-serif", /* '10px sans-serif' */
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
      color: "#8b5cf6"
    },
    arvores: {
      label: "Árvores",
      color: "#16a34a"
    },
      grafos: {
        label: "Grafos",
        color: "#2563eb"
      },
    hash: {
      label: "Hash",
      color: "#db2777"
    }
  },
}

// avl Garante balanceamento automático, mantendo operações em O(log n).
// Rubro-Negra Balanceamento garantido com menor número de rotações.
// hash 
// heap Estrutura otimizada para acesso eficiente ao maior ou menor elemento.
// B Estrutura otimizada para acesso eficiente ao maior ou menor elemento.
// b+ Variante da Árvore B com dados armazenados apenas nas folhas.




window.PAGES_CONFIG = {
  sections: [
    {
      title: "Algoritmos",
      groups: [
        // {
        //   name: "Árvores",
        //   showGroupName: true,
        //   items: [
        //     { shortname: "ABB", fullname: "Árvore Binária de Busca", pagename: "BST", link: "pages/algorithms/BST.html", description: "Permite busca eficiente, mas pode degradar sem balanceamento.", categories: ["arvores"] },
        //     // { name: "AVL", link: "AVL.html", description: "Árvore balanceada.", categories: ["arvores"] }
        //   ]
        // },
        {
          name: "Hash",
          showGroupName: true,
          items: [
            { shortname: "Encadeamento externo", fullname: "Tabela de dispersão - Encadeamento externo", pagename: "OpenHash", link: "pages/algorithms/OpenHash.html", description: "Utiliza função de dispersão para acesso rápido sem ordenação.", categories: ["hash"] },
            { shortname: "Endereçamento aberto", fullname: "Tabela de dispersão - Endereçamento aberto", pagename: "ClosedHash", link: "pages/algorithms/ClosedHash.html", description: "Utiliza função de dispersão para acesso rápido sem ordenação.", categories: ["hash"] },
          ]
        },
        // {
        //     name: "mais",
        //     showGroupName: false,
        //     items: [
        //     { shortname: "Hash", fullname: "Tabela de dispersão", pagename: "OpenHash", link: "pages/algorithms/OpenHash.html", description: "Utiliza função de dispersão para acesso rápido sem ordenação.", categories: ["hash"] },
              
        //     ]
        // },
      ]
    },
    {
        title: "Plataforma",
        groups: [
            {
                name: "Institucional",
                showGroupName: false,
                items: [
                    { name: "Sobre", link: "pages/sobre.html", description: "Informações sobre a plataforma." },
                    { name: "Perguntas Frequentes (FAQ)", link: "pages/faq.html", description: "Perguntas frequentes." },
                    // { name: "Known Bugs", link: "pages/bugs.html", description: "Lista de bugs conhecidos." },
                    // { name: "Feature Requests", link: "pages/features.html", description: "Solicitações de novas funcionalidades." },
                    { name: "Source Code", link: "pages/source.html", description: "Código-fonte da plataforma." },
                    { name: "Contact", link: "pages/contato.html", description: "Formas de contato." }
                ]
            }
        ]
    }
  ]
};
