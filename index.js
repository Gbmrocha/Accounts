import inquirer from "inquirer";
import chalk from 'chalk';
import * as fs from 'node:fs';


operation();
function operation(){
    inquirer.prompt([{
        type: "list",
        name: "action",
        message: "O que deseja fazer?",
        choices: [
            'Criar conta',
            'Consultar saldo',
            'Depositar',
            'Sacar',
            'Sair'
        ]
    }]).then((answer) => {
        const action  = answer['action'];
        if (action == 'Criar conta'){
            createAccount();
            buildAccount();
        }else if(action == 'Depositar'){
            deposit();
        }else if(action == 'Consultar saldo'){
            getAccountBalance();
        }else if(action == 'Sacar'){
            withdraw();
        }else if(action == 'Sair'){
            console.log(chalk.bgBlue.black('Obrigado por utilizar o Accounts!'));
            process.exit();
        }
    })
    .catch((err) => console.log(err));
}

// create an account
function createAccount(){
    console.log(chalk.bgGreen.black('Obrigado por utlizar o Accounts!'));
    console.log(chalk.green('Defina as opções da sua conta a seguir'));
}

function buildAccount(){
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para a sua conta: ',
        }
    ]).then((answer) => {
        const accountName = answer['accountName'];
        console.info(accountName);
        
        if(!fs.existsSync('accounts')){
            fs.mkdirSync('accounts');
        }

        if(fs.existsSync(`accounts/${accountName}.json`)){
            console.log(chalk.bgRed.black('Já existe uma conta com esse nome em nossa base de dados, informe um novo nome...'))
            buildAccount();
            return;
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance" : 0}', 
        function (err) {
            console.log(err);   
        });

        console.log(chalk.bgBlue.white('Parabéns, a conta foi criada com sucesso!'));
        operation()
    })
    .catch((err) => console.log(err))
}

// add an amount to user account
function deposit(){
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Informe o nome da conta: '
        }
    ]).then((answer) => {
        const accountName = answer['accountName'];
        if(!checkAccount(accountName)){
            return deposit();
        }

        inquirer.prompt([{
            name: 'amount',
            message: 'Informe o valor a ser depositado: '
        }]).then((answer) => {
            const amount = answer['amount'];
            addAmount(accountName, amount);
            operation();
        })
        .catch((err) => console.log(err));

    })
    .catch((err) => console.log(err));
}

//verify if account exists
function checkAccount(accountName){
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black('Essa conta não existe, tente novamente...'));
        return false;
    }

    return true;
}

//add an amount
function addAmount(accountName, amount){
    const accountData = getAccount(accountName);

    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu algum erro, tente novamente...'));
        return deposit();
    }
    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err){
            console.log(err);
        }
    )
    console.log(`Foi depositado um valor de R$ ${amount} na conta ${accountName}`);

}

function getAccount(accountName){
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf-8',
        flag: 'r'
    })

    return JSON.parse(accountJSON);
}

//show account balance
function getAccountBalance(){
    inquirer.prompt([{
        name: 'accountName',
        message: 'Informe a conta que deseja verificar: '
    }]).then((answer) => {
        const accountName = answer['accountName'];
        if(!checkAccount(accountName)){
            return getAccountBalance();
        }

        const accountData = getAccount(accountName);

        console.log(chalk.bgBlue.black(`Olá, o saldo de sua conta é R$ ${accountData.balance}`));
        operation();
    }).catch((err) => console.log(err))
}

// withdraw an amount from userAccount
function withdraw(accountName){
    inquirer.prompt([{
        name: 'accountName',
        message: 'Informe a conta que deseja sacar: '
    }]).then((answer) =>{
        const accountName = answer['accountName'];
        
        if(!checkAccount(accountName)){
            return withdraw();
        }

        inquirer.prompt([{
            name: 'amount',
            message: 'Informe o valor de saque: R$',
        }]).then((answer) => {
            const amount = answer['amount'];
            removeAmount(accountName, amount);
        }).catch((err) => console.log(err));
    }).catch((err) => console.log(err));
}

function removeAmount(accountName, amount){
    const accountData = getAccount(accountName);

    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente...'));
        return withdraw();
    }

    if(accountData.balance < amount){
        console.log(chalk.bgRed.black('Saldo insuficiente...'));
        return withdraw();
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err){
            console.log(err);
        }
    )
    console.log(chalk.bgGreen.black(`Foi retirado um valor de R$ ${amount} na conta ${accountName}`));
    operation();
}