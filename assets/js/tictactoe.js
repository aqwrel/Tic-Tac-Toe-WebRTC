export class TicTacToe {
    constructor(game, send, statistic) {
        this.game = game
        this.currentTurn = 'x'
        this.user = null
        this.send = send
        this.statistic = statistic
    }

    createHeader() {
        const wrapper = document.createElement('div')
        wrapper.classList.add('header')
        
        const headerLeft = document.createElement('div')
        headerLeft.classList.add('header-left')

        const text = document.createElement('p')
        text.textContent = 'YOU:'
        headerLeft.appendChild(text)
        if(this.user === 'x') {
            const cross = document.createElement('div')
            cross.classList.add('cross')
            headerLeft.appendChild(cross)
        } else {
            const circle = document.createElement('div')
            circle.classList.add('circle')
            headerLeft.appendChild(circle)
        }

        wrapper.appendChild(headerLeft)

        const headerMiddle = document.createElement('div')
        headerMiddle.classList.add('header-middle')

        const headerMiddleTurn = document.createElement('span')
        headerMiddleTurn.textContent = 'Turn'

        const turn = document.createElement('div')
        turn.classList.add(this.currentTurn, 'current-turn')
        headerMiddle.appendChild(turn)
        headerMiddle.appendChild(headerMiddleTurn)
        wrapper.appendChild(headerMiddle)

        this.game.appendChild(wrapper)
    }

    createFooter() {
        const wrapper = document.createElement('div')
        wrapper.classList.add('footer')

        const winX = document.createElement('div')
        winX.classList.add('win-x')

        const labelX = document.createElement('p')
        labelX.textContent = 'X'
        winX.appendChild(labelX)

        const countX = document.createElement('p')
        countX.textContent = this.statistic.x
        winX.appendChild(countX)

        wrapper.appendChild(winX)

        const draw = document.createElement('div')
        draw.classList.add('draw')

        const labelDraw = document.createElement('p')
        labelDraw.textContent = 'Ties'
        draw.appendChild(labelDraw)

        const countDraw = document.createElement('p')
        countDraw.textContent = this.statistic.ties
        draw.appendChild(countDraw)

        wrapper.appendChild(draw)

        const winO = document.createElement('div')
        winO.classList.add('win-o')

        const labelO = document.createElement('p')
        labelO.textContent = 'O'
        winO.appendChild(labelO)

        const countO = document.createElement('p')
        countO.textContent = this.statistic.o
        winO.appendChild(countO)

        wrapper.appendChild(winO)

        this.game.appendChild(wrapper)
    }

    changeTurn (data) {
        this.currentTurn = data
        const turn = document.querySelector('.current-turn')
        turn.classList.remove('x', 'o')
        turn.classList.add(this.currentTurn)
    }

    createCell() {
        const wrapper = document.createElement('div')
        wrapper.classList.add('field')
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div')
            cell.addEventListener('click', (e) => {this.cellListener(e, i)})
            cell.classList.add('cell')
            wrapper.appendChild(cell)
        }
        this.game.appendChild(wrapper)
    }

    cellListener(e, index) {
        if(this.currentTurn !== this.user) return
        if(e.target.classList.contains('cell-x') || e.target.classList.contains('cell-o')) return
        e.target.classList.add(`cell-${this.currentTurn}`)
        this.turnListener(index)
    }

    turnListener(index) {
        this.changeTurn(this.currentTurn === 'x' ? 'o' : 'x')
        this.send(index)
        this.isVictory()
        this.isEnd()
    }

    isVictory() {
        const cellsBlocks = [...document.querySelectorAll('.cell')]
        const combs = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        const cells = cellsBlocks.map((item) => {
            if(item.classList.contains('cell-x')) {
                return 'x'
            }
            if(item.classList.contains('cell-o')) {
                return 'o'
            }
            return null
        })
        for (let comb of combs) {
            if (
                cells[comb[0]] == cells[comb[1]] &&
                cells[comb[1]] == cells[comb[2]] &&
                cells[comb[0]] != undefined
            ) {
                cellsBlocks[comb[0]].classList.add('cell-win')
                cellsBlocks[comb[1]].classList.add('cell-win')
                cellsBlocks[comb[2]].classList.add('cell-win')
                setTimeout(() => {
                    this.send({
                        isEnd: true,
                        isVictory: true,
                        winner: cells[comb[0]]
                    })
                }, 500);
                return cells[comb[0]];
            }
        }
        
        return false;
    }

    isEnd() {
        const cells = [...document.querySelectorAll('.cell')].map((item) => {
            if(item.classList.contains('cell-x')) {
                return 'x'
            }
            if(item.classList.contains('cell-o')) {
                return 'o'
            }
            return null
        })
        const isEnd = !cells.includes(null)
        if(isEnd) {
            this.send({
                isEnd: true,
                isVictory: false,
                winner: null
            })
        }
    }

    setByIndex (index) {
        const cells = [...document.querySelectorAll('.cell')]
        cells[index].classList.add(`cell-${this.currentTurn}`)
    }

    restart() {
        this.currentTurn = 'x'
        this.createHeader()
        this.createCell()
        this.createFooter()
    }

    start(user) {
        this.user = user
        this.createHeader()
        this.createCell()
        this.createFooter()
    }
}