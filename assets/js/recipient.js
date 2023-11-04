export class Recipient {
    constructor(game, startGame, turnReceive) {
        this.game = game
        this.startGame = startGame
        this.server = { urls: "stun:stun.l.google.com:19302" }
        this.sdpConstraints = { optional: [{ RtpDataChannels: true }] };
        this.pc = new RTCPeerConnection({ iceServers: [this.server] })
        this.dc = null
        this.turnReceive = turnReceive
    }

    ondatachannel(e) {
        this.dc = e.channel;
        this.dcInit()
    }

    dcInit() {
        this.dc.onopen = () => {
            this.startGame()
        };
        this.dc.onmessage = (e) => {
            this.turnReceive(e)
        }
    }

    hostSDP() {
        const wrapper = document.createElement('div')
        const label = document.createElement('p')
        label.classList.add('label')
        label.textContent = '1.Host SDP'
        const sdp = document.createElement('textarea')
        sdp.setAttribute('id', 'spd')
        sdp.classList.add('textarea')
        sdp.placeholder = 'Enter Participant SDP here...'
        wrapper.appendChild(label)
        wrapper.appendChild(sdp)
        this.game.appendChild(wrapper)
    }

    recipientSDP() {
        const wrapper = document.createElement('div')
        const label = document.createElement('p')
        label.classList.add('label')
        label.textContent = '2.Participant\'S SDP'


        const copy = document.createElement('button')
        copy.classList.add('copy')

        label.appendChild(copy)

        copy.addEventListener('click', () => {
            navigator.clipboard.writeText(JSON.stringify(this.pc.localDescription));
        })

        const sdp = document.createElement('textarea')
        sdp.readOnly = true
        sdp.setAttribute('id', 'spd-recipient')
        sdp.classList.add('textarea')
        sdp.placeholder = 'Enter Participant SDP here...'
        wrapper.appendChild(label)
        wrapper.appendChild(sdp)
        this.game.appendChild(wrapper)
    }

    createButton() {
        const button = document.createElement('button')
        button.classList.add('btn', 'btn-1')
        button.textContent = 'Create'
        this.game.appendChild(button)
        button.addEventListener('click', () => { this.createButtonListener() })
    }

    createButtonListener() {
        const spd = document.getElementById('spd').value
        var offerDesc = new RTCSessionDescription(JSON.parse(spd));
        this.pc.setRemoteDescription(offerDesc)
        this.pc.createAnswer(
            (answerDesc) => this.pc.setLocalDescription(answerDesc),
            () => { console.warn("Couldn't create offer") },
            this.sdpConstraints
        );
    }

    onicecandidate(e) {
        if (e.candidate) return;
        const textarea = document.getElementById('spd-recipient')
        textarea.value = JSON.stringify(this.pc.localDescription)
    }

    init() {
        this.hostSDP()
        this.createButton()
        this.recipientSDP()
        this.pc.ondatachannel = this.ondatachannel.bind(this)
        this.pc.onicecandidate = this.onicecandidate.bind(this)
    }
}