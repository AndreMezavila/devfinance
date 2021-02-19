const Modal = {
    open() {
         document.querySelector('.modal-overlay').classList.add('active')
         document.querySelector("input#description").value = ""
         document.querySelector('input#amount').value = ""
         document.querySelector('input#date').value = ""
    },

    openUpdate(index) {
        document.querySelector('.modal-overlay').classList.add('active')
        document.querySelector('#form > h2').innerHTML = "Alterar Transação"
        document.querySelector('#form > form > div.input-group.actions > button').innerHTML = "Alterar"
        document.querySelector('#form > form > div.input-group.actions > button').value = index
        Form.getUpdateTransaction(index)
   },
    close() {
        document.querySelector('.modal-overlay').classList.remove('active')
        document.querySelector('#form > h2').innerHTML = "Salvar Transação"
        document.querySelector('#form > form > div.input-group.actions > button').innerHTML = "Salvar"
        document.querySelector('#form > form > div.input-group.actions > button').value = ""

    }
}
const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions",JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(), 

    add(transaction){
        Transaction.all.push(transaction)
        App.reload()
    },
    
    remove(index){
        Transaction.all.splice(index,1)
        App.reload()
    },

    update(transaction){
            const {index,description,amount,date} = transaction
            Transaction.all[index].description = description
            Transaction.all[index].amount = amount
            Transaction.all[index].date = date
            App.reload()

    },

    incomes() {
        let income = 0
        Transaction.all.forEach(transaction =>{
            if (transaction.amount >0 ){
                income += transaction.amount
            }
        })
        return (income)
    },

    expenses() {
        let expense = 0
        Transaction.all.forEach(transaction =>{
            if (transaction.amount <0 ){
                expense += transaction.amount
            }
        })
        return (expense)
    },
    total() {
       return Transaction.incomes() + Transaction.expenses()
    }

}

const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),

    addTransaction(Transaction, index) {     
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(Transaction,index)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
       
    },
    innerHTMLTransaction(Transaction,index) {
        const CSSclass = Transaction.amount >0 ? "income" : "expense";
        const amount = Utils.formatCurrency(Transaction.amount)
        const html = `
                        <td class="description"> ${Transaction.description}</td>
                        <td class=${CSSclass}>${amount}</td>
                        <td class="date">${Transaction.date}</td>
                        <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação"></td>
                        <td><img onclick="Modal.openUpdate(${index})" src="./assets/update.svg" alt="Alterar Transação"></td>        
                    `
        return html
    },
    updateBalance(){
        document
        .getElementById("incomeDisplay")
        .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
        .getElementById("expenseDisplay")
        .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
        .getElementById("totalDisplay")
        .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value){
        value = value * 100
        return Math.round(value)
    },
    formatAmountForm(value){
        value = value / 100
        return value
    },

    formateDate(value){
        const splittedDate = value.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formateDateForm(value){
        const splittedDate = value.split("/")
        return `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "");
        value =  Number(value) / 100
        value = value.toLocaleString("pt-BR",{
            style: "currency",
            currency: "BRL"
        })
    
    return signal + value
}
}

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    index: document.querySelector('#form > form > div.input-group.actions > button'),
  


    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
            index: Form.index.value,
        }
    },   

    validateFilds(){
        const {description,amount,date} = Form.getValues()
        if (description.trim() === "" | amount.trim() === "" | date.trim() === ""){
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues(){
        let {description,amount,date,index} = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formateDate(date)
        return{
        description,
        amount,
        date,
        index
        }
    },

    getUpdateTransaction(index){  
        Form.description.value = Transaction.all[index].description
        Form.amount.value = Utils.formatAmountForm(Transaction.all[index].amount)
        Form.date.value = Utils.formateDateForm(Transaction.all[index].date)
    },

    saveTransaction(transaction){
        const {index,description,amount,date} = transaction
        if (index === "") {
            Transaction.add({description,amount,date})
         } else {
            Transaction.update({index,description,amount,date})
         }
        console.log(index)
        
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

  
    submit(event){
        event.preventDefault()
        try{
        Form.validateFilds()
        const transaction = Form.formatValues()
        Form.saveTransaction(transaction)
        Form.clearFields()
        Modal.close()
        }catch (error){
            alert(error.message)
        }   
    },

    

    
}

const App = {
    init(){
        Transaction.all.forEach(DOM.addTransaction),

        DOM.updateBalance(),

        Storage.set(Transaction.all)
    },
    reload(){
        DOM.clearTransactions();
        App.init();
    }
}

App.init()
