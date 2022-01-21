// // login DOM
// const loginbtn = document.querySelector('#loginBtn')
// const loginUsername = document.querySelector('#loginUsername')
// const loginPassword = document.querySelector('#loginPassword')

// create account DOM

const createAccountbtn = document.querySelector('#createAccountBtn')
const createUsername = document.querySelector('#createUsername')
const createPassword = document.querySelector('#createPassword')
const createEmail = document.querySelector('#createEmail')


async function signup(accountInfo){
const res = await fetch('http://localhost:3000/api/signup', {
    method:'POST',
    body: JSON.stringify(accountInfo),
    headers: {
        'Content-Type': 'application/json' }
})

const data = await res.json()
console.log(data)

}



createAccountbtn.addEventListener('click', () => {
    const accountInfo = {
        username: createUsername.value,
        email: createEmail.value,
        password: createPassword.value
    }

 signup(accountInfo)


})