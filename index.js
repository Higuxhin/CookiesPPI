import express  from "express";
import path from 'path'
import cookieParser from "cookie-parser";
import session from 'express-session';

const port = 3000;
const host = 'localhost';

//pseudo middleware
function autenticar(req, resp, next){
    if(req.session.usuarioAutenticado){
        next();
    }else{
        resp.redirect("/login.html");
    }
};

const app = express();
app.use(cookieParser()); //manipular cookies


app.use(session({
    secret:"M1nH4Ch4v3S3cR3t4", 
    resave: true, //atualiza a sessão mesmo que não haja alterações
    saveUninitialized: true,
    cookie: {
        //tempo de vida da sessão
        maxAge: 1000 * 60 * 15 //15 minutos
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'paginas')));

app.get('/', autenticar, (req, res) => {
    const DataUltimoAcesso = req.cookies.DataUltimoAcesso;
    const data = new Date();
    res.cookie("DataUltimoAcesso", data.toLocaleDateString() + " " + data.toLocaleTimeString(), {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true
    });
    res.end(`
    <!DOCTYPE html>
        <head>
        <meta charset="UTF-8">
            <title>MENU</title>
        </head>
        <body>
            <h1>MENU INICIAL</h1>
            <ul>
                <li><a href="/cadastros.html">Cadastrar novo valor</a></li>
            </ul>
        </body>
        <footer>
            <p>Seu último acesso foi em ${DataUltimoAcesso}</p>
        </footer>
    </html>
    `);
});

const list = []; //Armazenar os dados 

function controller(req, res){
    const dados = req.body;
    let Conteudofinal = '';

    if(!dados.item || !dados.preco){
        Conteudofinal = `
        <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
                 <title>Controle Financeiro</title>
            </head>
        <body>
                <form class="row p-3 justify-content-center" action="/cadastros" method='POST'>
                 <h1 class="row justify-content-center m-3">Controle Financeiro</h1>
            <div class="col-auto">
              <label for="staticEmail2" class="visually-hidden">Item</label>
                <input type="text" name="item" class="form-control" id="inputPreco" value="${dados.item}" placeholder="Item">
            </div>
        `;
        if(!dados.item){
            Conteudofinal+=`<div>
            <p class="text-danger">Por favor, informe o nome!</p>
            </div>`;
        }

        Conteudofinal+=`
            <div class="col-auto">
          <label for="inputPassword2" class="visually-hidden">Preço</label>
          <input type="text" name="preco" class="form-control" id="inputPreco" value="${dados.preco}" placeholder="preço">
        </div>`;

        if(!dados.preco){
            Conteudofinal+=`<div>
            <p class="text-danger">Por favor, informe o preço!</p>
            </div>`;
        }
            
        Conteudofinal+=`<div class="col-auto">
            <button type="submit" class="btn btn-success mb-3">Salvar</button>
             </div>
            </form>
            </body>
        </html>`;
        res.end(Conteudofinal);
    }else{
        const usuarios = {
            item: dados.item,
            preco: dados.preco
        }
        
        list.push(usuarios);

        Conteudofinal = `
        <!DOCTYPE html>
        <head>
        <meta charset="UTF-8">
            <title>MENU</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
        </head>
        <body>
            <h1>valor</h1>
            <table class="table table-striped">
                <thead class="thead-dark justify-content-center">
                    <tr>
                        <th scope="col">Nome</th>
                        <th scope="col">Preco</th>
                    </tr>
                </thead>
                <tbody> `;

                let saldo = 0;
            for(const user of list){
                saldo = Number(user.preco);
                Conteudofinal+= `
                    <tr>
                        <td>${user.item}</td>
                        <td>${saldo.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</td>
                    </tr>      
                `
            }

            let final = 0;
            for(const usuario of list){
                final += Number(usuario.preco)
            }

        
            Conteudofinal += `
                        </tbody>
                    </table>
                    <p><strong>Valor total:</strong> ${final.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</p>
                    <a class="btn btn-primary" href="/" role="button">Voltar</a>
                    <a class="btn btn-primary" href="/cadastros.html" role="button">Novo cadastro</a>
                </html>
            `

            res.end(Conteudofinal)
    }
}

//endpoint login - processar login da aplicação
app.post('/login',(req, resp)=>{
    const usuario = req.body.usuario;
    const senha = req.body.senha;
    if(usuario && senha && (usuario === 'eduarda') && (senha === '2211')){
        req.session.usuarioAutenticado = true;
        resp.redirect('/');
    }else{
        resp.end(`
        <!DOCTYPE html>
        <head>
             <meta charset="UTF-8">
             <title>Falha na autenticação</title>
        </head>
        <body>
            <h3>Usuário ou senha inválidos</h3>
            <a href="/login.html">Voltar ao login</a>
        </body>
        </html>
        `);
    }
});

app.post('/cadastros', autenticar, controller);

app.listen(port, host, () => {
    console.log(`Servidor executando na url http://${host}:${port}`)
}) 