window.onload = async () => {

  try {
    const {data: positions} = await axios.get('https://redeheroes-bot-v2.herokuapp.com/podium')

    positions.forEach((position, index) => {
      $('#positions')[0].innerHTML += `
        <div class="containerTable">
          <tdCustom rowspan="1">${index+1}</tdCustom>
          <tdCustom rowspan="2"><img class="avatar-table" src="${position.avatar_url}" /> ${position.username}</tdCustom>
          <tdCustom rowspan="1">${position.points}</tdCustom>
        </div>
      `
    })

    positions.filter((_, index) => (index < 3)).forEach((position, index) => {
      $(`#username-top-${index+1}`)[0].innerHTML = position.username
      $(`#points-top-${index+1}`)[0].innerHTML = position.points
      $(`#avatar-top-${index+1}`)[0].src = position.avatar_url
    })

  } catch (err) {
    alert('Houve um erro ao carregar o podium.')
  }

}


function readURL(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		
		reader.onload = async (e) => {
      const response = confirm('Você tem certeza que quer trocar seu avatar?\nClique em `Cancel` para cancelar a troca ou clique em `Ok` para confirmar.')
      if (response) {
        try {
          const token = localStorage.getItem('token')
          let user = JSON.parse(localStorage.getItem('user'))
          const formData = new FormData();
          formData.append('avatar_img', input.files[0])
  
          document.getElementById('user-icon').style.backgroundImage = `url('${e.target.result}')`
          const responsePutAvatar = await axios.put('https://redeheroes-bot-v2.herokuapp.com/avatar', formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
            }
          })
          user.avatar_url = responsePutAvatar.data.avatar_url
          localStorage.setItem('user', JSON.stringify(user))
          alert('Você trocou de avatar com sucesso!')
        } catch (err) {
          console.log(err.response)
          alert(`Erro » ${err.response.data.validation.body.message}`)          
        }
      }
    }
    
		reader.readAsDataURL(input.files[0]);
	}
}

$("#img").change(() => {
	readURL($("#img")[0]);
});
