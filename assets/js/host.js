export class Host {
    constructor(game, startGame, turnReceive) {
        this.game = game
        this.startGame = startGame
        this.server = { urls: "stun:stun.l.google.com:19302" }
        this.sdpConstraints = { optional: [{ RtpDataChannels: true }] };
        this.pc = null
        this.dc = null
        this.turnReceive = turnReceive
    }

    async createOfferSDP() {
        this.dc = this.pc.createDataChannel("game");
        const data = await this.pc.createOffer()
        this.pc.setLocalDescription(data)
        this.dc.onopen = () => {
            this.startGame()
        };
        this.dc.onmessage = (e) => {
            this.turnReceive(e)
        }
    };

    oniceconnectionstatechange(e) {
        const state = this.pc.iceConnectionState;
        console.log(state);
        if(state === 'disconnected') {
            if(!alert('Opponent is leave')) document.location = '/index.html';
        }
    }

    onicecandidate(e) {
        if (e.candidate) return;
        this.createSDP()
        this.participantSDP()
        this.connectButton()
    }

    showError(text) {
        const snackbar = document.createElement('div')
        snackbar.classList.add('snackbar')
        snackbar.textContent = text
        document.body.appendChild(snackbar)

        setTimeout(() => {
            snackbar.remove()
        }, 5000);
    }

    createSDP() {
        const wrapper = document.createElement('div')
        const label = document.createElement('p')
        label.classList.add('label')
        label.textContent = '1.Host SDP'

        const copy = document.createElement('button')
        copy.classList.add('copy')

        label.appendChild(copy)

        copy.addEventListener('click', () => {
            navigator.clipboard.writeText(JSON.stringify(this.pc.localDescription));
        })

        const sdp = document.createElement('textarea')
        sdp.classList.add('textarea')
        sdp.readOnly = true
        sdp.textContent = JSON.stringify(this.pc.localDescription)
        wrapper.appendChild(label)
        wrapper.appendChild(sdp)
        this.game.appendChild(wrapper)
    }

    participantSDP() {
        const wrapper = document.createElement('div')
        const label = document.createElement('p')
        label.classList.add('label')
        label.textContent = '2.Participant\'S SDP'
        const sdp = document.createElement('textarea')
        sdp.classList.add('textarea')
        sdp.setAttribute('id', 'spd-participant')
        sdp.placeholder = 'Enter Participant SDP here...'
        wrapper.appendChild(label)
        wrapper.appendChild(sdp)
        this.game.appendChild(wrapper)
    }

    connectButtonListener() {
        const answerSDP = document.getElementById('spd-participant').value
        if(!answerSDP) {
            this.showError('Enter Participant\'S SDP')
            return
        }
        const answerDesc = new RTCSessionDescription(JSON.parse(answerSDP));
        this.pc.setRemoteDescription(answerDesc);
    }

    connectButton() {
        const button = document.createElement('button')
        button.classList.add('btn', 'btn-1')
        button.textContent = 'Start'
        this.game.appendChild(button)
        button.addEventListener('click', () => { this.connectButtonListener() })
    }

    async init() {
        this.pc = new RTCPeerConnection({ iceServers: [this.server] });
        this.pc.oniceconnectionstatechange = this.oniceconnectionstatechange.bind(this)
        this.pc.onicecandidate = this.onicecandidate.bind(this)
        await this.createOfferSDP()
    }
}