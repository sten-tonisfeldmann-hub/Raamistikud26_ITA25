const express = require('express')
const fs = require('fs')
const app = express()

const path = require('path')
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

const readFile = (filename) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            const tasks = JSON.parse(data)
            resolve(tasks)
        });
    })
}

app.get('/', (req, res) => {
    readFile('./tasks.json')
        .then(tasks => {
            res.render('index', {
                tasks: tasks,
                message: req.query.message || null
            })
        })
        .catch(err => {
            console.error(err)
            res.redirect('/')
        })
})

app.use(express.urlencoded({ extended: true }));

app.post('/', (req, res) => {
    readFile('./tasks.json')
        .then(tasks => {
            let index
            if (tasks.length === 0) {
                index = 0
            } else {
                index = tasks[tasks.length - 1].id + 1;
            }

            const newTask = {
                id: index,
                task: req.body.task
            }

            tasks.push(newTask)
            const data = JSON.stringify(tasks, null, 2)

            fs.writeFile('./tasks.json', data, 'utf-8', err => {
                if (err) {
                    console.error(err);
                    return;
                }
                res.redirect('/');
            })
        })
})

app.get('/delete-task/:taskId', (req, res) => {
    const deletedTaskId = parseInt(req.params.taskId)

    readFile('./tasks.json')
        .then(tasks => {
            const filteredTasks = tasks.filter(task => task.id !== deletedTaskId)
            const data = JSON.stringify(filteredTasks, null, 2)

            fs.writeFile('./tasks.json', data, 'utf-8', err => {
                if (err) {
                    console.error(err);
                    return;
                }
                res.redirect('/');
            })
        })
        .catch(err => {
            console.error(err)
            res.redirect('/')
        })
})

app.get('/edit-task/:taskId', (req, res) => {
    const taskId = parseInt(req.params.taskId)

    readFile('./tasks.json')
        .then(tasks => {
            const task = tasks.find(task => task.id === taskId)

            if (!task) {
                return res.redirect('/')
            }

            res.render('edit-task', {
                task: task,
                errorMessage: req.query.error || null
            })
        })
        .catch(err => {
            console.error(err)
            res.redirect('/')
        })
})

app.post('/update-task/:taskId', (req, res) => {
    const taskId = parseInt(req.params.taskId)
    const updatedTask = (req.body.task || '').trim()

    if (!updatedTask) {
        return res.redirect(`/edit-task/${taskId}?error=Please insert correct task data`)
    }

    readFile('./tasks.json')
        .then(tasks => {
            const task = tasks.find(task => task.id === taskId)

            if (!task) {
                return res.redirect('/')
            }

            task.task = updatedTask

            const data = JSON.stringify(tasks, null, 2)
            fs.writeFile('./tasks.json', data, 'utf-8', err => {
                if (err) {
                    console.error(err)
                    return
                }
                res.redirect('/?message=New correctly updated task')
            })
        })
        .catch(err => {
            console.error(err)
            res.redirect('/')
        })
})

app.listen(3001, () => {
    console.log('Example app is started at http://localhost:3001')
})