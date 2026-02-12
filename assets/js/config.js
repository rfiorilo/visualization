window.VISUAL_CONFIG = {

  colors: {
    link: "#0088b7",
    highlight: "#0088b7",
    foreground: "#0088b7",
    background: "#d6eef6"
  },

  layout: {
    widthDelta: 50,
    heightDelta: 50,
    startingY: 50
  },

  print: {
    firstX: 50,
    verticalGap: 20,
    horizontalGap: 50
  }

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
    }
  },
}


window.PAGES_CONFIG = {
  sections: [
    {
      title: "Algoritmos",
      groups: [
        {
          name: "Árvores",
          showGroupName: true,
          items: [
            { shortname: "BST", fullname: "Árvore Binária de Busca", link: "pages/algorithms/BST.html", description: "Árvore binária de busca.", categories: ["arvores"] },
            // { name: "AVL", link: "AVL.html", description: "Árvore balanceada.", categories: ["arvores"] }
          ]
        },
        // {
        //   name: "Grafos",
        //   showGroupName: false,
        //   items: [
        //     { name: "Dijkstra", link: "Dijkstra.html", description: "Caminho mínimo.", categories: ["grafos"] }
        //   ]
        // },
        // {
        //     name: "",
        //     showGroupName: false,
        //     items: [
        //       { name: "Hash", link: "Hash.html", description: "Algoritmo de busca eficiente em vetores ordenados.", categories: ["ordenacao", "arvores"] }
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
                    { name: "F.A.Q", link: "pages/faq.html", description: "Perguntas frequentes." },
                    { name: "Known Bugs", link: "pages/bugs.html", description: "Lista de bugs conhecidos." },
                    { name: "Feature Requests", link: "pages/features.html", description: "Solicitações de novas funcionalidades." },
                    { name: "Source Code", link: "pages/source.html", description: "Código-fonte da plataforma." },
                    { name: "Contact", link: "pages/contact.html", description: "Formas de contato." }
                ]
            }
        ]
    }
  ]
};
