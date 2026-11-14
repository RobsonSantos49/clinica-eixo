window.SITE = {
  nome: "Clínica Eixo",

  whatsapp: {
    numero: "5541900000000", // só dígitos, ex.: 5511999998888
    mensagem: "Olá! Gostaria de agendar uma avaliação na Clínica Eixo.",
  },

  contato: {
    // E-mail que recebe o formulário (FormSubmit). Depois da ativação, o FormSubmit manda
    // um código aleatório: coloque o código aqui no lugar do e-mail, e o e-mail some do site.
    email: "contato@exemplo.com",
    // Opcional: chave do Web3Forms (https://web3forms.com). Se vazio, usa FormSubmit.
    web3formsChave: "",
    assunto: "Novo contato pelo site Clínica Eixo",
  },

  // Redes sociais: cole o endereço do perfil. Deixe "" para esconder o ícone.
  // EXEMPLO: no site-modelo apontam para a página inicial de cada rede.
  redes: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    youtube: "https://www.youtube.com/",
  },

  frames: {
    total: 160, // valor impresso pelo fatiar_frames.sh
    totalMobile: 80, // celular: quadros verticais 540x960, um a cada dois
    desktop: "assets/frames/desktop/f_{n}.webp",
    mobile: "assets/frames/mobile/f_{n}.webp",
  },
};
