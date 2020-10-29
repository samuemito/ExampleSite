let tasks = []
let tasks_completed = []
let completed = false
const add_new_task = document.getElementById('add-new-task')

function openModalTask(modal) {
  $(modal).modal('show')
}

async function takeOutTask(task) {
  try {
    const response = await axios.put(`https://redeheroes-bot-v2.herokuapp.com/task/${task}?status=false`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    $('#quantity-points')[0].innerHTML = Number($('#quantity-points')[0].innerHTML) - (-response.data.rewarded)

    tasks = tasks.map((task_origin) => {
      const task_changed = {...task_origin, completed: !task_origin.completed}
      return (task_origin.id === task) ? task_changed : task_origin
    })
  
    renderTasks()
  } catch (err) {
    console.log(err.response)
    alert(`Erro » ${err.response.data.validation.body.message}`)
  }
}

async function completeTask(task) {
  try {
    const response = await axios.put(`https://redeheroes-bot-v2.herokuapp.com/task/${task}?status=true`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    $('#quantity-points')[0].innerHTML = Number($('#quantity-points')[0].innerHTML) + response.data.rewarded

    tasks = tasks.map((task_origin) => {
      const task_changed = {...task_origin, completed: !task_origin.completed}
      return (task_origin.id === task) ? task_changed : task_origin
    })
  
    renderTasks()
  } catch (err) {
    console.log(err.response)
    alert(`Erro » ${err.response.data.validation.body.message}`)
  }
}

function renderTasks(completed_local) {
  const container_tasks = $('#container-tasks')[0]
  const quantity_task = $('#quantity-task')[0]
  const quantity_task_completed = $('#quantity-task-completed')[0]
  const model_task = $('#models')[0]
  let tasks_locate;

  if (completed_local != undefined) {
    completed = completed_local
  }

  if (!completed) {
    $('#closed').removeClass('selected_completed')
    $('#waiting').addClass('selected')
    tasks_locate = tasks.filter((task) => !task.completed)
  } else {
    $('#closed').addClass('selected_completed')
    $('#waiting').removeClass('selected')
    tasks_locate = tasks.filter((task) => task.completed)
  }
  
  quantity_task.innerHTML = tasks.filter((task) => !task.completed).length
  quantity_task_completed.innerHTML = tasks.filter((task) => task.completed).length

  if (tasks_locate.length < 1) {
    container_tasks.innerHTML = ''
    model_task.innerHTML = ''
    container_tasks.innerHTML += `
      <h1 class="empty-task">Você não tem nenhuma tarefa.</h1>
    `
  } else {
    container_tasks.innerHTML = ''
    model_task.innerHTML = ''
    tasks_locate.sort((a, b) => new Date(a.due_timestamp).valueOf() - new Date(b.due_timestamp).valueOf()).forEach((task, index) => {
      const timestamp = new Date(task.due_timestamp).valueOf()

      model_task.innerHTML += `
        <div class="modal fade" id="${task.id}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-matter-title-task" id="exampleModalLabel">${task.matter_title}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-row">
                <div class="col-md-5 mb-3">
                  <label class="modal-task-title">${task.task_title}</label>
                </div>
              </div>
              <div class="form-row">
                <div class="col-md-9 mb-3">
                  <label class="modal-task-description">${task.description}</label>
                </div>
              </div>
              <div class="form-row">
                <div class="col-md-5 mb-3">
                  <label class="modal-task-date">${moment(task.due_timestamp).format('HH:mm:ss - DD/MM/YYYY')}</label>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
              <button data-dismiss="modal" onclick="${task.completed ? `takeOutTask(${task.id})` : `completeTask(${task.id})`}" type="submit" class="btn ${task.completed ? 'btn-danger' : 'btn-primary'}">${task.completed ? 'Desfazer entrega' : 'Concluir'}</button>
            </div>
          </div>
        </div>
      </div>
      `

      container_tasks.innerHTML += `
        <div class="card task">
          <div class="card-header">
            ${task.matter_title} ${(timestamp < new Date().valueOf()) ? `<span style="font-family: sans-serif;" class="badge badge-danger">${task.completed ? 'Entregue em atraso' : 'Em atraso'}</span>` : ''}
          </div>
          <div class="card-body">
            <p class="text-muted">Prazo ${moment(task.due_timestamp).format('HH:mm:ss - DD/MM/YYYY')}</p>
            <h2 class="card-title">${task.task_title}</h2>
            <p class="card-text">${task.description}</p>
            <button onclick="openModalTask('#${task.id}')" class="btn btn-primary">Ver mais</button>
          </div>
        </div>
      `
    }) 
  }
}

add_new_task.onsubmit = async (event) => {
  event.preventDefault()

  const token = localStorage.getItem('token')
  const {value: matter_title} = document.querySelector('input[name=matter_title]')
  const {value: task_title} = document.querySelector('input[name=task_title]')
  const {value: due_date} = document.querySelector('input[name=due_date]')
  const {value: due_hour} = document.querySelector('input[name=due_hour]')
  const {value: description} = document.querySelector('textarea[name=description]')

  try {
    const task = {
      matter_title,
      task_title,
      due_timestamp: new Date(`${due_date} ${due_hour}`).valueOf(),
      description,
    }
    const response = await axios.post('https://redeheroes-bot-v2.herokuapp.com/task', task, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    tasks.push(response.data)
    
    renderTasks(false)
    $('#add-new-task').trigger("reset");
    $('#modalExemplo').modal('hide');

  } catch (error) {
    console.log(error)
    alert((!error.response || error.response.status === 500) ? 'Houve um erro desconhecido, contate aos desenvolvedores.' : error.response.data || 'Houve um erro desconhecido, contate aos desenvolvedores.')
  }

  return false
}

window.onload = async () => {
  const token = localStorage.getItem('token')

  try {
    const response = await axios.get('https://redeheroes-bot-v2.herokuapp.com/tasks?status=false', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const responseCompleted = await axios.get('https://redeheroes-bot-v2.herokuapp.com/tasks?status=true', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    tasks = [...tasks, ...response.data, ...responseCompleted.data]
    renderTasks(false)
  } catch (error) {
    console.log(error)
    alert((!error.response || error.response.status === 500) ? 'Houve um erro desconhecido, contate aos desenvolvedores.' : error.response.data || 'Houve um erro desconhecido, contate aos desenvolvedores.')
  }
}

function logout() {
  localStorage.removeItem('token')

  window.location.replace('/')
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
