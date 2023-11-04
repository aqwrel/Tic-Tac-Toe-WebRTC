import {Host} from './host.js'
import {Recipient} from './recipient.js'
import {TicTacToe} from './tictactoe.js'
import {Statistic} from './statistic.js'

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

    hostButton () {
        const buttonHost = document.createElement('button')
        buttonHost.classList.add('btn', 'btn-1')
        buttonHost.textContent = 'Hots game'
        this.game.appendChild(buttonHost)
        buttonHost.addEventListener('click', () => this.hostButtonListener())
    }

    async hostButtonListener (e) {
        this.game.innerHTML = ''
        this.user = 'x'
        await this.host.init()
    }

    joinButton () {
        const buttonJoin = document.createElement('button')
        buttonJoin.classList.add('btn', 'btn-2')
        buttonJoin.textContent = 'Join game'
        this.game.appendChild(buttonJoin)
        buttonJoin.addEventListener('click', () => this.joinButtonListener())
    }

    async joinButtonListener (e) {
        this.game.innerHTML = ''
        this.user = 'o'
        await this.recipient.init()
    }

    startGame () {
        this.game.innerHTML = ''
        this.ticTacToe.start(this.user)
    }

    turnSend (e) {
        if(e.isEnd) {
            if(e.isVictory) {
                this.statistic[e.winner] = ++this.statistic[e.winner]
            } else {
                this.statistic.ties = ++this.statistic.ties
            }
        }
        if(this.user === 'x') {
            if(e.isEnd) {
                if(e.isVictory) {
                    this.host.dc.send(JSON.stringify(e))
                    this.showVictoryModal(true)
                } else {
                    this.host.dc.send(JSON.stringify(e))
                    this.showVictoryModal(false, true)
                }
                return
            }
            this.host.dc.send(JSON.stringify({
                index: e,
                user: 'x'
            }))
        } else {
            if(e.isVictory) {
                this.recipient.dc.send(JSON.stringify(e))
                this.showVictoryModal(true)
                return
            }
            this.recipient.dc.send(JSON.stringify({
                index: e,
                user: 'o'
            }))
        }
    }

    turnReceive (e) {
        const data = JSON.parse(e.data)

        if(data.isEnd) {
            if(data.isVictory) {
                this.showVictoryModal()
                this.statistic[data.winner] = ++this.statistic[data.winner]
            } else {
                this.showVictoryModal(false, true)
                this.statistic.ties = ++this.statistic.ties
            }
            return
        }
        if(data.restart) {
            this.restartGame()
            return
        }
        this.ticTacToe.setByIndex(data.index)
        this.ticTacToe.changeTurn(data.user === 'x' ? 'o' : 'x' )
    }

    restartGame() {
        this.game.innerHTML = ''
        const modal = document.querySelector('.modal')
        modal.remove()
        this.ticTacToe.restart()
    }

    showVictoryModal (isWin, isDraw) {
        const modal = document.createElement('div')
        modal.classList.add('modal')

        const content = document.createElement('div')
        content.classList.add('modal-content')

        const title = document.createElement('p')
        if(isDraw) {
            title.textContent = 'Draw'
        } else {
            title.textContent = isWin ? 'You win' : 'You lose'
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
