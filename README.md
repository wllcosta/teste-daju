## 📊 Projeto DajuLabs

Este projeto consiste no desenvolvimento de uma **API RESTful** em **Node.js** para leitura de uma lista de itens de vendas a partir de um arquivo CSV, identificando os pares de **venda** e **devolução**.  
Os dados são expostos via endpoint e exibidos em uma interface **React** em formato de tabela com estatísticas.

## 🚀 Tecnologias Utilizadas

- **Backend:** Node.js
- **Banco de Dados:** Em memória
- **Frontend:** React.js
- **Paradigma:** Programação Orientada a Objetos (POO)

## 📂 Estrutura do Projeto

PROJETO-DAJU/
│
├── backend/
│ ├── data/
│ │ └── vendas_e_devolucoes.csv
│ ├── node_modules/
│ ├── package.json
│ ├── package-lock.json
│ └── server.js
│
├── frontend/
│ ├── node_modules/
│ ├── public/
│ ├── src/
│ │ ├── components/
│ │ │ ├── SalesTable.js
│ │ │ └── StatsCards.js
│ │ ├── services/
│ │ │ └── api.js
│ │ ├── App.js
│ │ ├── App.css
│ │ ├── index.js
│ │ └── ... outros arquivos do React
│ ├── package.json
│ └── package-lock.json
│
└── README.md

## ▶️ Como Rodar o Projeto

Clonar o repositório

--git clone https://github.com/wllcosta/teste-daju.git
--cd teste-daju

 Rodar o backend

--cd backend
--npm install
--npm start

Rodar o frontend

--cd frontend
--npm install
--npm start

## 👨‍💻Autor

Este projeto foi desenvolvido por Willian Costa, como parte de estudos e projetos para o teste da DajuLabs.
