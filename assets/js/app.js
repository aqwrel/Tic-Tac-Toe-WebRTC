import { Host } from './host.js'
import { Recipient } from './recipient.js'
import { TicTacToe } from './tictactoe.js'
import { Statistic } from './statistic.js'

class App {
    constructor() {
        this.game = document.querySelector('.game')
        this.statistic = new Statistic()
        this.ticTacToe = new TicTacToe(this.game, this.turnSend.bind(this), this.statistic)
        this.recipient = new Recipient(this.game, this.startGame.bind(this), this.turnReceive.bind(this))
        this.host = new Host(this.game, this.startGame.bind(this), this.turnReceive.bind(this))
        this.user = null
        this.init()
    }

    hostButton() {
        const buttonHost = document.createElement('button')
        buttonHost.classList.add('btn', 'btn-1')
        buttonHost.textContent = 'Hots game'
        this.game.appendChild(buttonHost)
        buttonHost.addEventListener('click', () => this.hostButtonListener())
    }

    async hostButtonListener(e) {
        this.game.innerHTML = ''
        this.user = 'x'
        await this.host.init()
    }

    joinButton() {
        const buttonJoin = document.createElement('button')
        buttonJoin.classList.add('btn', 'btn-2')
        buttonJoin.textContent = 'Join game'
        this.game.appendChild(buttonJoin)
        buttonJoin.addEventListener('click', () => this.joinButtonListener())
    }

    async joinButtonListener(e) {
        this.game.innerHTML = ''
        this.user = 'o'
        await this.recipient.init()
    }

    startGame() {
        this.game.innerHTML = ''
        this.ticTacToe.start(this.user)
    }

    victoryHandler(e) {
        this.statistic[e.winner] = ++this.statistic[e.winner]
        this.showVictoryModal(e)
    }

    drawHandler(e) {
        this.statistic.ties = ++this.statistic.ties
        this.showVictoryModal(e)
    }

    turnSend(e) {
        if (e.isEnd && e.isVictory) {
            this.victoryHandler(e)
        }
        if (e.isEnd && !e.isVictory) {
            this.drawHandler(e)
        }
        if (this.user === 'x') {
            this.host.dc.send(JSON.stringify(e))
        } else {
            this.recipient.dc.send(JSON.stringify(e))
        }
    }

    turnReceive(e) {
        const data = JSON.parse(e.data)
        if (data.isEnd && data.isVictory) {
            this.victoryHandler(data)
            return
        }
        if (data.isEnd && !data.isVictory) {
            this.drawHandler(data)
            return
        }
        if (data.restart) {
            this.restartGame()
            return
        }
        this.ticTacToe.setByIndex(data.index)
        this.ticTacToe.changeTurn()
    }

    restartGame() {
        this.game.innerHTML = ''
        const modal = document.querySelector('.modal')
        modal.remove()
        this.ticTacToe.restart()
    }

    showVictoryModal(e) {
        const modal = document.createElement('div')
        modal.classList.add('modal')

        const content = document.createElement('div')
        content.classList.add('modal-content')

        const title = document.createElement('p')
        if (e.isEnd && !e.isVictory) {
            title.textContent = 'Draw'
        } else {
            title.textContent = `Winner:`
            const icon = document.createElement('span')
            icon.classList.add(e.winner)
            title.appendChild(icon)
            this.ticTacToe.highlightCell(e.comb)
        }

        const button = document.createElement('button')
        button.textContent = this.user === 'x' ? 'Again' : 'Waiting the host'
        button.classList.add('btn', 'btn-1')
        button.disabled = this.user !== 'x'
        button.addEventListener('click', () => {
            this.host.dc.send(JSON.stringify({
                restart: true,
            }))
            this.restartGame()
        })

        content.appendChild(title)
        content.appendChild(button)

        modal.appendChild(content)

        document.body.appendChild(modal)
    }

    init() {
        this.hostButton()
        this.joinButton()
    }
}

const app = new App()
