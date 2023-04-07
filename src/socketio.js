import * as socketIoParser from "socket.io-parser";
import * as engineIoParser from "engine.io-parser";
import { Emitter } from "@socket.io/component-emitter";

import { WebSocket } from 'k6/experimental/websockets';


/**
 * Represents a connection to a Socket.IO server over WebSocket.
 * @extends Emitter
 */
export class SocketIO extends Emitter {
    /**
     * The `socket.io-parser` `Decoder` instance used to decode incoming packets.
     * @type {Decoder}
     * @private
     */
    _decoder = new socketIoParser.Decoder();

    /**
     * The `socket.io-parser` `Encoder` instance used to encode outgoing packets.
     * @type {Encoder}
     * @private
     */
    _encoder = new socketIoParser.Encoder();

    /**
     * The `socket.io-parser` packet type constants.
     * @type {PacketType}
     * @private
     */
    _packetType = socketIoParser.PacketType;

    /**
     * Whether or not the `SocketIO` instance is currently connected to the Socket.IO server.
     * @type {boolean}
     */
    connected = false;

    /**
     * The host of the Socket.IO server being connected to.
     * @type {string}
     * @private
     */
    _host;

    /**
     * The underlying `WebSocket` instance used for communication with the Socket.IO server.
     * @type {WebSocket}
     * @private
     */
    _ws;
    /**
     * Creates a new `SocketIO` instance.
     * @param {string} host - The host of the Socket.IO server to connect to.
     */
    constructor(host) {
        super();

        this._host = host;
        this._decoder.on("decoded", (decoded) => {
            switch (decoded.type) {
                case this._packetType.CONNECT:
                    this.emit("connected", decoded);
                    break;
                case this._packetType.ACK: {
                    this.emit("ack", decoded);
                    break;
                }
                case this._packetType.EVENT:
                    this.emit("event", decoded);
                    break;
            }
        })
    }

    /**
     * Connects to the Socket.IO server.
     * @param {string} authPayload - The payload for authenticating with the Socket.IO server.
     * @returns {Promise<void>} A promise that resolves when the connection has been established.
     */
    async connect(authPayload) {
        if (this.connected) return;

        return await new Promise((resolve, reject) => {
            this.once("connected", resolve);
            this._ws = new WebSocket(`ws://${__ENV.BAGMAN_HOST}/socket.io/?EIO=4&transport=websocket`);

            /**
             * Handles WebSocket errors.
             * @param {ErrorEvent} e - The WebSocket error event.
             */
            this._ws.addEventListener('error', (e) => {
                this.emit('error', e);
                reject(e.error);
            });

            /**
             * Handles incoming WebSocket messages from the Socket.IO server.
             * @param {MessageEvent} e - The WebSocket message event.
             */
            this._ws.addEventListener('message', (e) => {
                const packet = engineIoParser.decodePacket(e.data);

                if (packet.type == "open") {
                    this._sendPacket('message', { type: this._packetType.CONNECT, nsp: '/', data: authPayload });
                }

                if (packet.type == "ping") {
                    this._sendPacket('pong')
                }

                if (packet.type == "message") {
                    this._decoder.add(packet.data);
                }
            });
        });
    }

    _sendPacket(type, payload) {
        engineIoParser.encodePacket({
            type,
            ...(payload && { data: this._encoder.encode(payload) })
        }, false, this._ws.send);
    }

    /**
     * Sends an event with optional data to the Socket.IO server.
     * @param {string} event - The name of the event to send.
     * @param {*} data - The data to send with the event.
     * @param {number} [id] - The ID of the event, used for acknowledgements.
     * @returns {Promise<void>} A promise that resolves when the event has been sent
     */
    async send(event, data, id) {
        this._sendPacket('message', {
            type: this._packetType.EVENT,
            data: [event, data],
            nsp: '/',
            id
        });
    }

    /**
     * Sends an event with optional data to the Socket.IO server and waits for an acknowledgement.
     * @param {string} event - The name of the event to send.
     * @param {*} data - The data to send with the event.
     * @returns {Promise<*>} A promise that resolves with the acknowledgement data.
     */
    async sendWithAck(event, data) {
        return await new Promise((resolve) => {
            this.once("ack", resolve);

            const id = Math.floor(Math.random() * 100000000000);
            this.send(event, data, id);
        });
    }

    /**
     * Closes the WebSocket connection to the Socket.IO server.
     */
    close() {
        this._sendPacket('message', { type: this._packetType.DISCONNECT, nsp: '/' });
        this._sendPacket('close')
        this._ws.close();
    }
}