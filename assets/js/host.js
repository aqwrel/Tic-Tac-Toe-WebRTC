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
        this.dc = this.pc.createDataChannel("chat");
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
        var state = this.pc.iceConnectionState;
        console.log(state);
    }

    onicecandidate(e) {
        if (e.candidate) return;
        this.createSDP()
        this.participantSDP()
        this.connectButton()
    }

    createSDP() {
        const wrapper = document.createElement('div')
        const label = document.createElement('p')
        label.classList.add('label')
        label.textContent = '1.CREATE Offer\'s SDP'
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
        label.textContent = '2.GET Participant\'s SDP'
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