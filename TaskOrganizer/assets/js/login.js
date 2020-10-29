const form = document.getElementById('login-submit')

function load() {
  const token = localStorage.getItem('token')

  if (token) {
    window.location.replace('/dashboard')
  }
}
load()

form.onsubmit = async (event) => {
  event.preventDefault()
  
  const {value: username} = document.querySelector("input[data-type=username]")
  const {value: password} = document.querySelector("input[data-type=password]")

  if (!username || !password) {
    alert('Por favor digite seu nome e sua senha.')
    return false
  }

  try {
    const response = await axios.post('https://redeheroes-bot-v2.herokuapp.com/session', {
      username,
      password,
    })

    console.log(response)
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    window.location.replace("/dashboard")
  } catch (error) {
    console.log(error.response)
    alert((!error.response || error.response.status === 500) ? 'Houve um erro desconhecido, contate aos desenvolvedores.' : error.response.data.validation.body.message)
  }

  return false
}