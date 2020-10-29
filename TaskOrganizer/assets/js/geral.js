let selected
const avatar_list_option = $('.avatar-option')

function avatarClick(avatar) {
  if (selected) {
    $(`#${selected}`).removeClass("selected-avatar")
  }
  $(`#${avatar.id}`).addClass("selected-avatar")
  selected = avatar.id
}

function readURL(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader()
		
		reader.onload = async (e) => {
      const formData = new FormData()
      console.log(input.files[0])
      formData.append('avatar_img', input.files[0])
      if (selected) {
        $(`#${selected}`).removeClass("selected-avatar")
      }
      $("#avatar-option")[0].innerHTML = ""
      $("#avatar-option")[0].setAttribute("data-url", e.target.result)
      $(`#avatar-option`).addClass("selected-avatar")
      selected = 'avatar-option'

      document.getElementById('avatar-option').style.backgroundImage = `url('${e.target.result}')`
    }
    
		reader.readAsDataURL(input.files[0])
	}
}

$("#avatar_option_input").change(() => {
	readURL($("#avatar_option_input")[0])
})

async function createFile(url){
  let response = await fetch(url)
  let data = await response.blob()
  let metadata = {
    type: 'image/jpeg'
  }
  let file = new File([data], "test.jpg", metadata)

  return file
}

$("#save")[0].onclick = async () => {
  console.log("saved")
  try {
    const token = localStorage.getItem('token')
    let user = JSON.parse(localStorage.getItem('user'))
    const formData = new FormData();
    console.log($(`#${selected}`)[0].getAttribute("data-url"))
    let file = await createFile($(`#${selected}`)[0].getAttribute("data-url"))
    console.log(file)
    formData.append('avatar_img', file)

    const responsePutAvatar = await axios.put('https://redeheroes-bot-v2.herokuapp.com/avatar', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
      }
    })

    await loadInfos()
    user.avatar_url = responsePutAvatar.data.avatar_url
    localStorage.setItem('user', JSON.stringify(user))
    $('#modalOptions').modal('hide');
    alert('Você trocou de avatar com sucesso!')
  } catch (err) {
    console.log(err.response)
    alert(`Erro » ${err.response.data.validation.body.message}`)          
  }
}
