let avatar_img;

function load() {
	const token = localStorage.getItem('token')

	if (token) {
		window.location.replace('/dashboard')
	}
}
load()

function readURL(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		
		reader.onload = (e) => {
			document.getElementById('testando').style.backgroundImage = `url('${e.target.result}')`
		}

		avatar_img = input.files[0]
		reader.readAsDataURL(input.files[0]);
	}
}

$("#img").change(() => {
	readURL($("#img")[0]);
});

async function handleSubmit() {
	try {
		const {value: username} = $("input[name=username]")[0]
		const {value: password} = $("input[name=password]")[0]
		const {value: confirm_password} = $("input[name=confirm_password]")[0]

		if (!username)
			return alert('Por favor digite seu nome, ele é obrigatório.')

		if (!password)
			return alert('Erro » Por favor digite sua senha, ela é obrigatória.')

		if (!confirm_password)
			return alert('Erro » Por favor digite sua confirmação de senha, ela é obrigatória.')
	
		if (confirm_password !== password)
			return alert('Erro » Sua senha e sua confirmação de senha devem ser iguais.')

		const response = await axios.post('https://redeheroes-bot-v2.herokuapp.com/user', {
			username,
			password,
			confirm_password,
		})

		const formData = new FormData();
		formData.append('avatar_img', avatar_img)

		let {token, user} = response.data;

		if (avatar_img) {
			const responsePutAvatar = await axios.put('https://redeheroes-bot-v2.herokuapp.com/avatar', formData, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
				}
			})
			user.avatar_url = responsePutAvatar.data.avatar_url
		}

		localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    window.location.replace("/dashboard")
	} catch (err) {
		console.log(err.response)
		alert(`Erro » ${err.response.data.validation.body.message}`)
	}
}

$("#submit-button").on('click', handleSubmit)
